/**
 * Web Search Utility for Real-Time AI Grounding
 * Uses multiple providers with cascading fallbacks for reliability on Vercel.
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
     "siapa", "presiden", "rektor", "ketua", "menteri", "gubernur",
     "terbaru", "terkini", "sekarang", "saat ini", "jadwal", "harga",
     "update", "berita", "hasil", "skor", "kapan", "dimana", "periode",
     "menjabat", "peraturan", "regulasi", "undang", "kurikulum",
     "who is", "current", "latest", "today", "news"
  ];

  return triggers.some(t => lower.includes(t)) || /\b(rektor|presiden|gubernur|menteri)\b/i.test(lower);
}

/**
 * Provider 1: Wikipedia Search API (Search)
 */
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const q = encodeURIComponent(cleanQuery(query));
    const url = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&srlimit=3&origin=*`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    
    if (data.query?.search?.length > 0) {
      return data.query.search.map((r: any) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]*>/g, '').trim(),
        url: `https://id.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`
      }));
    }
  } catch (e) {
    console.error("Wiki failed:", e);
  }
  return [];
}

/**
 * Provider 2: DuckDuckGo HTML Lite (Robust scraping)
 */
async function searchDDG(query: string): Promise<SearchResult[]> {
  try {
    const q = cleanQuery(query);
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(q)}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: `q=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(8000)
    });

    const html = await res.text();
    const results: SearchResult[] = [];
    
    // Simple table row parsing
    const rows = html.split(/<tr/gi);
    for (const row of rows) {
      if (row.includes('class="result-link"')) {
        const titleMatch = row.match(/class="result-link"[^>]*>([\s\S]*?)<\/a>/i);
        const snippetMatch = row.match(/class="result-snippet"[^>]*>([\s\S]*?)<\/td>/i);
        const urlMatch = row.match(/href="([^"]+)"/i);
        
        if (titleMatch && snippetMatch) {
          results.push({
            title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
            snippet: snippetMatch[1].replace(/<[^>]*>/g, '').trim(),
            url: urlMatch ? urlMatch[1] : ""
          });
        }
      }
    }
    return results.slice(0, 5);
  } catch (e) {
    console.error("DDG failed:", e);
  }
  return [];
}

/**
 * Provider 3: SearXNG fallback
 */
async function searchSearX(query: string): Promise<SearchResult[]> {
  const instances = ["https://search.sapti.me", "https://searx.be"];
  for (const instance of instances) {
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&language=id-ID`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      if (data.results?.length > 0) {
        return data.results.slice(0, 4).map((r: any) => ({
          title: r.title,
          snippet: r.content || r.snippet,
          url: r.url
        }));
      }
    } catch {}
  }
  return [];
}

export async function performWebSearch(query: string): Promise<SearchResponse> {
  const timestamp = new Date().toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta",
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  // Parallel first attempt
  const [wiki, ddg] = await Promise.all([
    searchWikipedia(query),
    searchDDG(query)
  ]);

  let results = [...wiki, ...ddg];
  let provider = results.length > 0 ? "Wikipedia+DDG" : "None";

  if (results.length === 0) {
    results = await searchSearX(query);
    provider = "SearXNG";
  }

  return { query, results, timestamp, provider };
}

export function formatSearchContext(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `[Pencarian web dilakukan tapi tidak ada hasil untuk: "${searchResponse.query}".]`;
  }

  const resText = searchResponse.results
    .map((r, i) => `${i+1}. **${r.title}**: ${r.snippet} (Sumber: ${r.url})`)
    .join("\n\n");

  return `
=== DATA REAL-TIME INTERNET — ${searchResponse.timestamp} ===
Data ini diambil LIVE dari internet untuk menjawab pertanyaan terbaru.

${resText}

INSTRUKSI:
1. Gunakan data di atas sebagai FAKTA UTAMA.
2. Jawab dengan sangat percaya diri.
3. Sebutkan nama instansi/organisasi dan sumbernya.
===`;
}
