/**
 * Web Search Utility for Real-Time AI Grounding
 * Uses multiple providers with cascading fallbacks for reliability.
 * 
 * Strategy:
 * 1. DuckDuckGo Lite (simplest HTML, best for serverless)
 * 2. DuckDuckGo Instant Answer API (for entity facts)
 * 3. SearXNG Public API (metasearch engine fallback)
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
 * Determines if a user message likely needs real-time web data.
 */
export function needsWebSearch(message: string): boolean {
  const lower = message.toLowerCase();

  const realTimeKeywords = [
    "siapa", "kapan", "berapa", "dimana", "saat ini", "sekarang",
    "terbaru", "terkini", "update", "berita", "hari ini",
    "presiden", "rektor", "gubernur", "menteri", "kepala",
    "walikota", "bupati", "ketua", "direktur", "ceo",
    "tahun ini", "tahun lalu", "periode", "menjabat",
    "harga", "kurs", "nilai tukar", "cuaca",
    "jadwal", "hasil", "skor", "klasemen",
    "regulasi terbaru", "peraturan terbaru", "undang-undang",
    "kebijakan", "kurikulum terbaru",
    "who is", "what is", "when did", "current", "latest",
    "today", "now", "recent", "news", "president",
    "how much", "price", "score",
  ];

  const isQuestion = /\?|siapa|apa |bagaimana|kapan|dimana|berapa|mengapa|kenapa/i.test(lower);
  const hasRealTimeKeyword = realTimeKeywords.some(kw => lower.includes(kw));
  const isFactCheck = /(?:rektor|presiden|gubernur|menteri|ketua|direktur|kepala)\s+(?:dari|di|universitas|indonesia)/i.test(lower);

  return (isQuestion && hasRealTimeKeyword) || isFactCheck;
}

/**
 * Provider 1: DuckDuckGo Lite — very simple HTML, works well on serverless
 */
async function searchDuckDuckGoLite(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://lite.duckduckgo.com/lite/?q=${encodedQuery}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      },
      body: `q=${encodedQuery}`,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`DDG Lite HTTP ${response.status}`);
    const html = await response.text();
    const results: SearchResult[] = [];

    // DDG Lite uses simple <table> layout with <td> for results
    // Pattern: <a> for link/title, followed by snippet text in next <td>
    // Extract all result links and snippets
    const rows = html.split(/<tr>/gi);
    
    let currentTitle = "";
    let currentUrl = "";
    
    for (const row of rows) {
      // Check for result link (title)
      const linkMatch = row.match(/<a[^>]+href="([^"]+)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) {
        // Alternative pattern — DDG Lite sometimes uses different class
        const altLinkMatch = row.match(/<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        if (altLinkMatch) {
          currentUrl = altLinkMatch[1];
          currentTitle = altLinkMatch[2].replace(/<[^>]*>/g, '').trim();
        }
      } else {
        currentUrl = linkMatch[1];
        currentTitle = linkMatch[2].replace(/<[^>]*>/g, '').trim();
      }

      // Check for snippet text (in <td class="result-snippet">)
      const snippetMatch = row.match(/class="result-snippet"[^>]*>([\s\S]*?)<\/td>/i);
      if (snippetMatch && currentTitle) {
        const snippet = snippetMatch[1].replace(/<[^>]*>/g, '').trim();
        if (snippet.length > 20) {
          results.push({ title: currentTitle, snippet, url: currentUrl });
          currentTitle = "";
          currentUrl = "";
        }
      }
    }

    // Fallback: try to extract ANY meaningful text blocks if above pattern fails
    if (results.length === 0) {
      // Try extracting from <td> elements with substantial text
      const tdBlocks = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      const seen = new Set<string>();
      
      for (const td of tdBlocks) {
        const text = td.replace(/<[^>]*>/g, '').trim();
        // Only grab substantial snippets (likely search results)
        if (text.length > 60 && text.length < 600 && !seen.has(text) && !text.includes('DuckDuckGo')) {
          seen.add(text);
          // Try to extract URL from the same td
          const urlMatch = td.match(/href="(https?:\/\/[^"]+)"/);
          results.push({
            title: text.substring(0, 80) + "...",
            snippet: text,
            url: urlMatch ? urlMatch[1] : ""
          });
        }
      }
    }

    console.log(`[DDG Lite] Found ${results.length} results for "${query}"`);
    return results.slice(0, 6);
  } catch (error) {
    console.error("[DDG Lite] Failed:", error);
    return [];
  }
}

/**
 * Provider 2: DuckDuckGo HTML (full version) — different parsing
 */
async function searchDuckDuckGoHTML(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
      },
      body: `q=${encodedQuery}&b=`,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`DDG HTML HTTP ${response.status}`);
    const html = await response.text();
    const results: SearchResult[] = [];

    // Try multiple regex patterns for DDG HTML results
    // Pattern 1: result__a (title link) + result__snippet
    const titleRegex = /<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    const urlRegex = /<a[^>]*class="result__url"[^>]*href="([^"]*)"[^>]*>/gi;

    const titles: string[] = [];
    const snippets: string[] = [];
    const urls: string[] = [];

    let match;
    while ((match = titleRegex.exec(html)) !== null) {
      titles.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    while ((match = urlRegex.exec(html)) !== null) {
      urls.push(match[1]);
    }

    for (let i = 0; i < Math.min(titles.length, snippets.length, 6); i++) {
      if (titles[i] && snippets[i]) {
        results.push({
          title: titles[i],
          snippet: snippets[i],
          url: urls[i] || ""
        });
      }
    }

    // Pattern 2: Fallback — look for any link + text block pair
    if (results.length === 0) {
      const blockRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>)?/gi;
      while ((match = blockRegex.exec(html)) !== null && results.length < 6) {
        const block = match[1];
        const linkMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
        if (linkMatch) {
          const text = block.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.length > 50) {
            results.push({
              title: linkMatch[2].replace(/<[^>]*>/g, '').trim(),
              snippet: text.substring(0, 300),
              url: linkMatch[1]
            });
          }
        }
      }
    }

    console.log(`[DDG HTML] Found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error("[DDG HTML] Failed:", error);
    return [];
  }
}

/**
 * Provider 3: DuckDuckGo Instant Answer API — good for factual entity queries
 */
async function searchDDGInstant(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`DDG API HTTP ${response.status}`);
    const data = await response.json();
    const results: SearchResult[] = [];

    // Abstract (Wikipedia summary)
    if (data.Abstract && data.Abstract.length > 20) {
      results.push({
        title: data.Heading || "Wikipedia",
        snippet: data.Abstract,
        url: data.AbstractURL || ""
      });
    }

    // Related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.Text.length > 20) {
          results.push({
            title: topic.Text.substring(0, 60),
            snippet: topic.Text,
            url: topic.FirstURL || ""
          });
        }
      }
    }

    // Answer
    if (data.Answer && data.Answer.length > 5) {
      results.unshift({
        title: "Jawaban Langsung",
        snippet: data.Answer,
        url: ""
      });
    }

    console.log(`[DDG Instant] Found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error("[DDG Instant] Failed:", error);
    return [];
  }
}

/**
 * Provider 4: SearXNG Public Instance — metasearch engine with JSON API
 */
async function searchSearXNG(query: string): Promise<SearchResult[]> {
  // List of public SearXNG instances (rotate through if one fails)
  const instances = [
    "https://search.sapti.me",
    "https://searx.be",
    "https://search.ononoki.org",
    "https://paulgo.io",
  ];

  for (const instance of instances) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${instance}/search?q=${encodedQuery}&format=json&language=id-ID&categories=general`;
      
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Dekstorio/1.0",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const results: SearchResult[] = data.results.slice(0, 6).map((r: any) => ({
          title: r.title || "",
          snippet: r.content || "",
          url: r.url || ""
        })).filter((r: SearchResult) => r.snippet.length > 10);

        if (results.length > 0) {
          console.log(`[SearXNG ${instance}] Found ${results.length} results for "${query}"`);
          return results;
        }
      }
    } catch {
      continue; // Try next instance
    }
  }

  console.log(`[SearXNG] All instances failed for "${query}"`);
  return [];
}

/**
 * Provider 5: Wikipedia API — reliable for entity/person lookups
 */
async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    // Search Indonesian Wikipedia first, then English
    for (const lang of ["id", "en"]) {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&srlimit=3&srprop=snippet|size&utf8=`;
      
      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) continue;
      const data = await response.json();
      
      if (data.query?.search?.length > 0) {
        const results: SearchResult[] = data.query.search.map((r: any) => ({
          title: r.title,
          snippet: r.snippet?.replace(/<[^>]*>/g, '').trim() || "",
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}`
        })).filter((r: SearchResult) => r.snippet.length > 20);

        if (results.length > 0) {
          console.log(`[Wikipedia ${lang}] Found ${results.length} results for "${query}"`);
          return results;
        }
      }
    }
    return [];
  } catch (error) {
    console.error("[Wikipedia] Failed:", error);
    return [];
  }
}

/**
 * Main search function — tries multiple providers in order of reliability.
 * Returns as soon as ANY provider returns results.
 */
export async function performWebSearch(query: string): Promise<SearchResponse> {
  const timestamp = new Date().toLocaleString("id-ID", { 
    timeZone: "Asia/Jakarta",
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  console.log(`[WebSearch] Starting search for: "${query}"`);

  // Strategy: Run fast providers in parallel, use first successful result
  // Group 1 (fast): DDG Instant + Wikipedia (parallel)
  // Group 2 (slower): DDG HTML + SearXNG (parallel, only if group 1 fails)
  
  // Group 1: Quick lookups
  const [instantResults, wikiResults] = await Promise.all([
    searchDDGInstant(query),
    searchWikipedia(query),
  ]);

  if (instantResults.length > 0) {
    return { query, results: instantResults, timestamp, provider: "DuckDuckGo" };
  }
  if (wikiResults.length > 0) {
    return { query, results: wikiResults, timestamp, provider: "Wikipedia" };
  }

  // Group 2: Full web search
  const [ddgLiteResults, ddgHtmlResults] = await Promise.all([
    searchDuckDuckGoLite(query),
    searchDuckDuckGoHTML(query),
  ]);

  if (ddgLiteResults.length > 0) {
    return { query, results: ddgLiteResults, timestamp, provider: "DuckDuckGo" };
  }
  if (ddgHtmlResults.length > 0) {
    return { query, results: ddgHtmlResults, timestamp, provider: "DuckDuckGo" };
  }

  // Group 3: Last resort — SearXNG
  const searxResults = await searchSearXNG(query);
  if (searxResults.length > 0) {
    return { query, results: searxResults, timestamp, provider: "SearXNG" };
  }

  console.log(`[WebSearch] All providers failed for: "${query}"`);
  return { query, results: [], timestamp, provider: "none" };
}

/**
 * Format search results into a context string for the LLM system prompt.
 */
export function formatSearchContext(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `[Web Search tidak menemukan hasil untuk: "${searchResponse.query}". Jawab berdasarkan pengetahuan Anda, tapi beri peringatan bahwa informasi mungkin tidak up-to-date.]`;
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
=== HASIL PENCARIAN WEB REAL-TIME (${searchResponse.timestamp}) — via ${searchResponse.provider} ===
Query: "${searchResponse.query}"

${formattedResults}

INSTRUKSI KETAT:
1. Gunakan informasi dari hasil pencarian di atas sebagai SUMBER UTAMA.
2. Jika ada konflik antara pengetahuan bawaan Anda dan hasil pencarian, PRIORITASKAN hasil pencarian karena lebih baru.
3. Kutip sumber (URL/nama website) dalam jawaban Anda.
4. Jawab dengan percaya diri berdasarkan data pencarian — JANGAN katakan "saya tidak dapat menemukan".
===`;
}
