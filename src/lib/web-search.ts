/**
 * Web Search Utility for Real-Time AI Grounding
 * Optimized for Indonesian Education & Institutional Data.
 * 
 * Strategy v3.0: AGGRESSIVE SEARCH
 * - Nearly ALL user questions trigger web search (except document revision commands)
 * - Tavily is PRIMARY for knowledge questions; free providers as supplement
 * - This ensures Launcher OS-RevoU matches ChatGPT/Gemini accuracy
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
  
  // SKIP search for simple greetings & conversational messages (very short, no factual question)
  const greetingPatterns = [
    /^(h[ae]lo|hai|hi|hey|hei|yo|p|oi|woi|hoy|assalamualaikum|selamat\s*(pagi|siang|sore|malam)|good\s*(morning|afternoon|evening|night))[\s!.,?]*$/i,
    /^(terima\s*kasih|makasih|thanks|thank\s*you|thx|ok|oke|okay|siap|mantap|keren|bagus|nice|cool|great|good|iya|ya|yap|yep|yoi|betul|benar|setuju|noted)[\s!.,?]*$/i,
    /^(gimana\s*kabar|apa\s*kabar|how\s*are\s*you|what'?s?\s*up)[\s!?.,]*$/i,
    /^(bye|dah|dadah|sampai\s*jumpa|see\s*you)[\s!.,?]*$/i,
  ];
  
  if (greetingPatterns.some(p => p.test(lower))) return false;
  
  // SKIP search for very short messages (1-2 words, no question marks) — likely conversational
  const wordCount = lower.split(/\s+/).length;
  if (wordCount <= 2 && !lower.includes('?') && !/\b(siapa|apa|dimana|kapan|berapa|mengapa|kenapa|how|what|who|where|when|why)\b/i.test(lower)) {
    return false;
  }
  
  // SKIP search for explicit document-editing commands
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
        title: "Ringkasan Informasi Terkini",
        snippet: data.answer,
        url: ""
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

  // If Tavily returned results, use them directly for clean, high-signal context
  let results = tavilyResults.length > 0 
    ? tavilyResults 
    : [...searxResults, ...wikiResults];
  
  // Deduplicate by URL
  const seen = new Set<string>();
  results = results.filter(r => {
    if (!r.url) return true;
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Limit to top 5 high quality results
  results = results.slice(0, 5);

  let provider = "none";
  if (tavilyResults.length > 0) provider = "Pencarian Web Lanjutan";
  else if (searxResults.length > 0 || wikiResults.length > 0) provider = "Pencarian Web";

  console.log(`[WebSearch] Query: "${query}" → Tavily: ${tavilyResults.length}, SearXNG: ${searxResults.length}, Wiki: ${wikiResults.length} results. Provider: ${provider}`);

  return { query, results, timestamp, provider };
}

export function formatSearchContext(searchResponse: SearchResponse): string {
  if (!searchResponse.results || searchResponse.results.length === 0) {
    return "";
  }

  const resText = searchResponse.results
    .map((r, i) => {
      const source = r.url ? ` (Sumber: ${r.url})` : '';
      return `${i+1}. **${r.title}**: ${r.snippet}${source}`;
    })
    .join("\n\n");

  return `
=== REFERENSI PENCARIAN WEB TERBARU (${searchResponse.timestamp}) ===
Query: "${searchResponse.query}"

${resText}

PANDUAN MENJAWAB:
- Padukan informasi pencarian di atas dengan basis pengetahuan luas Anda untuk memberikan jawaban yang lengkap, kaya wawasan, dan terstruktur rapi (gunakan poin-poin/list).
- JANGAN menyalin teks potongan pencarian secara mentah atau kaku. Sampaikan dengan gaya bahasa yang cerdas, lugas, dan mengalir seperti ChatGPT.
===`;
}
