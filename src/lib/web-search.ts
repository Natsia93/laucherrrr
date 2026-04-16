/**
 * Web Search Utility for Real-Time AI Grounding
 * Uses multiple search providers for reliable results.
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
}

/**
 * Determines if a user message likely needs real-time web data.
 * Returns true for questions about current events, people, facts, etc.
 */
export function needsWebSearch(message: string): boolean {
  const lower = message.toLowerCase();

  // Keywords indicating real-time information needs
  const realTimeKeywords = [
    // Indonesian
    "siapa", "kapan", "berapa", "dimana", "saat ini", "sekarang",
    "terbaru", "terkini", "update", "berita", "hari ini",
    "presiden", "rektor", "gubernur", "menteri", "kepala",
    "walikota", "bupati", "ketua", "direktur", "ceo",
    "tahun ini", "tahun lalu", "periode", "menjabat",
    "harga", "kurs", "nilai tukar", "cuaca",
    "jadwal", "hasil", "skor", "klasemen",
    "regulasi terbaru", "peraturan terbaru", "undang-undang",
    "kebijakan", "kurikulum terbaru",
    // English
    "who is", "what is", "when did", "current", "latest",
    "today", "now", "recent", "news", "president",
    "how much", "price", "score",
  ];

  // Check for question patterns  
  const isQuestion = /\?|siapa|apa |bagaimana|kapan|dimana|berapa|mengapa|kenapa/i.test(lower);
  
  // Check for real-time keywords
  const hasRealTimeKeyword = realTimeKeywords.some(kw => lower.includes(kw));

  // Check for factual inquiries that might be outdated
  const isFactCheck = /(?:rektor|presiden|gubernur|menteri|ketua|direktur|kepala)\s+(?:dari|di|universitas|indonesia)/i.test(lower);

  return (isQuestion && hasRealTimeKeyword) || isFactCheck;
}

/**
 * Scrape search results using a simple fetch to DuckDuckGo HTML 
 * and extract relevant snippets. Falls back to a lite search if needed.
 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo HTML search (no API key needed)
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse DuckDuckGo HTML results using regex 
    // Extract result blocks
    const resultBlocks = html.match(/<div class="result results_links[\s\S]*?<\/div>\s*<\/div>/g) || [];
    
    for (const block of resultBlocks.slice(0, 8)) {
      // Extract title
      const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      // Extract snippet
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      // Extract URL
      const urlMatch = block.match(/href="\/\/duckduckgo\.com\/l\/\?uddg=([^"&]+)/);
      const resultUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : '';

      if (title && snippet) {
        results.push({ title, snippet, url: resultUrl });
      }
    }

    return results;
  } catch (error) {
    console.error("DuckDuckGo search failed:", error);
    return [];
  }
}

/**
 * Alternative: Use Google's CSE-like approach via a simple scrape 
 */
async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    // Use Google's public search page (lightweight)
    const url = `https://www.google.com/search?q=${encodedQuery}&hl=id&num=5`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Accept-Language": "id-ID,id;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
    });

    const html = await response.text();
    const results: SearchResult[] = [];

    // Simple extraction of text content from Google results
    // Look for common patterns in Google's HTML
    const snippets = html.match(/<div[^>]*class="[^"]*BNeawe[^"]*"[^>]*>([\s\S]*?)<\/div>/g) || [];
    
    for (const s of snippets.slice(0, 6)) {
      const text = s.replace(/<[^>]*>/g, '').trim();
      if (text.length > 30 && text.length < 500) {
        results.push({ title: "", snippet: text, url: "" });
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Main search function — tries DuckDuckGo first, then Google as fallback.
 * Returns formatted context string for LLM injection.
 */
export async function performWebSearch(query: string): Promise<SearchResponse> {
  const timestamp = new Date().toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta",
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Try DuckDuckGo first
  let results = await searchDuckDuckGo(query);

  // Fallback to Google scrape if DuckDuckGo fails
  if (results.length === 0) {
    results = await searchGoogle(query);
  }

  return { query, results, timestamp };
}

/**
 * Format search results into a context string for the LLM system prompt.
 */
export function formatSearchContext(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `[Web Search dilakukan untuk: "${searchResponse.query}" pada ${searchResponse.timestamp}, tapi tidak ada hasil ditemukan. Jawab berdasarkan pengetahuan Anda, tapi beri peringatan bahwa informasi mungkin tidak up-to-date.]`;
  }

  const formattedResults = searchResponse.results
    .map((r, i) => {
      let entry = `${i + 1}. `;
      if (r.title) entry += `**${r.title}**: `;
      entry += r.snippet;
      if (r.url) entry += ` (Sumber: ${r.url})`;
      return entry;
    })
    .join("\n");

  return `
=== HASIL WEB SEARCH REAL-TIME (${searchResponse.timestamp}) ===
Query: "${searchResponse.query}"

${formattedResults}

INSTRUKSI: Gunakan informasi dari hasil pencarian di atas sebagai SUMBER UTAMA untuk menjawab pertanyaan user. Jika ada konflik antara pengetahuan Anda dan hasil pencarian, PRIORITASKAN hasil pencarian karena data tersebut lebih baru. Sebutkan sumber informasi Anda dalam jawaban.
===`;
}
