/**
 * Web Search Utility for Real-Time AI Grounding
 * Optimized for Indonesian Education & Institutional Data.
 * 
 * Strategy v3.0: AGGRESSIVE SEARCH
 * - Nearly ALL user questions trigger web search (except document revision commands)
 * - Tavily is PRIMARY for knowledge questions; free providers as supplement
 * - This ensures Dekstorio matches ChatGPT/Gemini accuracy
 */

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: string;
  provider: string;
}

/**
 * Clean query for search engines — strip conversational fluff
 */
export function cleanQuery(query: string): string {
  return query
    .replace(/\b(siapa|apa|bagaimana|dimana|kapan|mengapa|kenapa|apakah|dari|saat|ini|terbaru|terkini|sekarang|please|tolong|carikan|coba|jelaskan|ceritakan|kamu|tahu|nggak|gak|dong|deh|sih|ya|yah|kah|lah|bantu|bisa|kasih|tau)\b/gi, '')
    .replace(/[?!.]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || query;
}

/**
 * Determines if a user message likely needs real-time web data.
 * 
 * v3.0: INVERTED LOGIC — search by default, skip ONLY for explicit document commands.
 * This ensures we never miss answerable questions.
 */
export function needsWebSearch(message: string): boolean {
  const lower = message.toLowerCase().trim();
  
  // SKIP search ONLY for these explicit document-editing commands
  const skipPatterns = [
    /^(perbaiki|revisi|edit|ubah|ganti|tambah|hapus|format|rapikan)\s+(dokumen|tabel|paragraf|kalimat|judul|bab|bagian)/i,
    /^(lanjutkan|continue)\s*(penulisan|menulis|buat|generate)?/i,
    /^(buatkan|buat|generate|susun)\s+(dokumen|lkpd|atp|prota|prosem|kktp|cp|rpp|silabus)/i,
    /^(export|download|simpan|save)/i,
  ];
  
  if (skipPatterns.some(p => p.test(lower))) return false;
  
  // For everything else: SEARCH!
  // This includes: factual questions, "apa itu X", "siapa X", opinions, current events, etc.
  return true;
}

/**
 * Provider 1: Wikipedia Search API (Free, reliable for established topics)
 */
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const q = encodeURIComponent(cleanQuery(query));
    const url = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&srlimit=3&origin=*`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    return data.query?.search?.map((r: any) => ({
      title: r.title,
      snippet: r.snippet.replace(/<[^>]*>/g, '').trim(),
      url: `https://id.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`
    })) || [];
  } catch { return []; }
}

/**
 * Provider 2: SearXNG (Free Metasearch, good for Indonesian content)
 */
async function searchSearXNG(query: string): Promise<SearchResult[]> {
  const instances = [
    "https://search.sapti.me",
    "https://searx.be",
    "https://paulgo.io",
    "https://searx.work"
  ];

  for (const instance of instances) {
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&language=id-ID`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      if (data.results?.length > 0) {
        return data.results.slice(0, 5).map((r: any) => ({
          title: r.title,
          snippet: r.content || r.snippet || '',
          url: r.url
        }));
      }
    } catch { continue; }
  }
  return [];
}

/**
 * Provider 3: Tavily AI (Premium — HIGH QUALITY)
 * Now used as PRIMARY search for knowledge/factual questions.
 */
async function searchTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    
    const results: SearchResult[] = [];

    // If Tavily provides a direct answer, include it as first result
    if (data.answer) {
      results.push({
        title: "Ringkasan Jawaban (Tavily AI)",
        snippet: data.answer,
        url: "https://tavily.com"
      });
    }

    // Add individual search results
    if (data.results?.length > 0) {
      results.push(...data.results.map((r: any) => ({
        title: r.title,
        snippet: r.content || r.snippet || '',
        url: r.url
      })));
    }

    return results;
  } catch (err) {
    console.error("[Tavily] Search failed:", err);
    return [];
  }
}

export async function performWebSearch(query: string): Promise<SearchResponse> {
  const timestamp = new Date().toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  // Strategy v3: Run Tavily + Free providers in PARALLEL for speed
  const hasTavily = !!process.env.TAVILY_API_KEY;
  
  const searchPromises: Promise<SearchResult[]>[] = [
    searchWikipedia(query),
    searchSearXNG(query),
  ];
  
  if (hasTavily) {
    searchPromises.push(searchTavily(query));
  }

  const [wiki, searx, tavily] = await Promise.allSettled(searchPromises);

  const wikiResults = wiki.status === 'fulfilled' ? wiki.value : [];
  const searxResults = searx.status === 'fulfilled' ? searx.value : [];
  const tavilyResults = tavily?.status === 'fulfilled' ? tavily.value : [];

  // Tavily results are highest quality — put them first
  let results = [...tavilyResults, ...searxResults, ...wikiResults];
  
  // Deduplicate by URL
  const seen = new Set<string>();
  results = results.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Limit to top 8 results
  results = results.slice(0, 8);

  let provider = "none";
  if (tavilyResults.length > 0) provider = "Tavily AI + Web";
  else if (searxResults.length > 0 || wikiResults.length > 0) provider = "Free Providers";

  console.log(`[WebSearch] Query: "${query}" → Tavily: ${tavilyResults.length}, SearXNG: ${searxResults.length}, Wiki: ${wikiResults.length} results. Provider: ${provider}`);

  return { query, results, timestamp, provider };
}

export function formatSearchContext(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `[Pencarian web tidak menemukan data spesifik untuk: "${searchResponse.query}". Jawab berdasarkan pengetahuan Anda, namun PERINGATKAN user bahwa jawaban mungkin tidak akurat tanpa data terbaru.]`;
  }

  const resText = searchResponse.results
    .map((r, i) => `${i+1}. **${r.title}**: ${r.snippet} (Sumber: ${r.url})`)
    .join("\n\n");

  return `
=== HASIL PENCARIAN WEB REAL-TIME (${searchResponse.timestamp}) ===
Query: "${searchResponse.query}"
Provider: ${searchResponse.provider}

${resText}

INSTRUKSI WAJIB:
1. Jawab pertanyaan user berdasarkan data di atas secara MENDALAM dan DETAIL.
2. JANGAN PERNAH katakan "tidak ada informasi" atau "saya tidak tahu" jika ada data di atas yang relevan.
3. PRIORITASKAN data pencarian ini di atas pengetahuan bawaan Anda.
4. Sebutkan sumber informasi (nama website/instansi).
5. Jika data pencarian bertentangan dengan pengetahuan Anda, IKUTI data pencarian karena lebih up-to-date.
===`;
}
