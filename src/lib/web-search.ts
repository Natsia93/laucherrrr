/**
 * Web Search Utility for Real-Time AI Grounding
 * Optimized for Indonesian Education & Institutional Data.
 * Strategy: Free providers first, Tavily as smart fallback to save credits.
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
 * Clean query for search engines
 */
export function cleanQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/\b(siapa|apa|bagaimana|dimana|kapan|mengapa|kenapa|apakah|dari|di|saat|ini|tahun|terbaru|terkini|sekarang|please|tolong|carikan)\b/g, '')
    .replace(/[?]/g, '')
    .trim() || query;
}

/**
 * Determines if a user message likely needs real-time web data.
 */
export function needsWebSearch(message: string): boolean {
  const lower = message.toLowerCase();
  const triggers = [
     "siapa", "presiden", "rektor", "ketua", "menteri", "gubernur", "kepala sekolah",
     "terbaru", "terkini", "sekarang", "saat ini", "jadwal", "harga", "update", "berita",
     "hasil", "skor", "kapan", "dimana", "periode", "menjabat", "peraturan", "kepsek"
  ];
  return triggers.some(t => lower.includes(t)) || /\b(rektor|presiden|kepsek|menteri)\b/i.test(lower);
}

/**
 * Provider 1: Wikipedia Search API (Free)
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
 * Provider 2: SearXNG (Free Metasearch)
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
          snippet: r.content || r.snippet,
          url: r.url
        }));
      }
    } catch { continue; }
  }
  return [];
}

/**
 * Provider 3: Tavily AI (Premium Fallback)
 * Only called if free providers fail to give enough information.
 */
async function searchTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  console.log(`[WebSearch] Free providers failed. Escalating to Tavily for: "${query}"`);

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        max_results: 5
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    return data.results?.map((r: any) => ({
      title: r.title,
      snippet: r.content || r.snippet,
      url: r.url
    })) || [];
  } catch { return []; }
}

export async function performWebSearch(query: string): Promise<SearchResponse> {
  const timestamp = new Date().toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  // 1. Try Free Providers first
  const [wiki, searx] = await Promise.all([
    searchWikipedia(query),
    searchSearXNG(query)
  ]);

  let results = [...wiki, ...searx];
  let provider = results.length > 0 ? "Free Providers" : "none";

  // 2. SMART FALLBACK: If free results are non-existent or very thin (< 150 chars total), use Tavily
  const totalSnippetLength = results.reduce((acc, r) => acc + r.snippet.length, 0);
  
  if (results.length === 0 || totalSnippetLength < 150) {
    const tavily = await searchTavily(query);
    if (tavily.length > 0) {
      results = tavily;
      provider = "Tavily AI (Premium)";
    }
  }

  return { query, results, timestamp, provider };
}

export function formatSearchContext(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `[Pencarian web gagal menemukan data spesifik untuk: "${searchResponse.query}".]`;
  }

  const resText = searchResponse.results
    .map((r, i) => `${i+1}. **${r.title}**: ${r.snippet} (Sumber: ${r.url})`)
    .join("\n\n");

  return `
=== HASIL PENCARIAN WEB REAL-TIME (${searchResponse.timestamp}) ===
Query: "${searchResponse.query}"
Provider: ${searchResponse.provider}

${resText}

INSTRUKSI:
1. Jawab pertanyaan user berdasarkan data di atas secara mendalam.
2. JANGAN katakan Anda tidak tahu jika ada data di atas.
3. Sebutkan sumber info (URL/Instansi).
===`;
}
