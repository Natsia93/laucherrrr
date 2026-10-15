import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      goal,
      currentUrl = "https://www.google.com",
      viewportText = "",
      interactiveElements = [],
      screenshotBase64,
      history = [],
      stepNumber = 1,
      maxSteps = 15,
      modelName = "gemini-2.5-flash",
    } = body;

    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Determine if we're nearing the step limit (soft warning, not a forced stop)
    const isNearingLimit = stepNumber >= maxSteps - 2;
    const isAtHardLimit = stepNumber >= maxSteps;
    const stepBudgetWarning = isAtHardLimit
      ? `\nPERINGATAN KRITIS: Ini adalah langkah TERAKHIR (Step ${stepNumber}/${maxSteps}). Anda HARUS memilih "finish" sekarang dan memberikan "finalSummary" dengan semua data yang sudah berhasil dikumpulkan sejauh ini. Jangan memilih aksi lain.`
      : isNearingLimit
      ? `\nPERINGATAN: Budget langkah hampir habis (Step ${stepNumber}/${maxSteps}). Pertimbangkan untuk segera mengakhiri tugas dengan "finish" JIKA tujuan sudah tercapai, atau gunakan sisa langkah untuk hal yang paling krusial.`
      : "";

    const systemPrompt = `Anda adalah "Launcher OS Direct Browser & Web Agent" (arsitektur Playwright & CDP, terinspirasi dari Saveera OpenClaw Browser Core).
Sistem ini mengendalikan browser Google Chrome secara otonom melalui DOM Playwright dan ghost cursor visual berpresisi tinggi.

Tugas Anda:
1. Menganalisis tujuan pengguna, status halaman saat ini (URL, judul, ringkasan DOM, atau daftar elemen interaktif).
2. Memilih aksi browser presisi berikutnya (Step ${stepNumber} dari max ${maxSteps}) untuk mencapai tujuan secepat dan seakurat mungkin.
3. Menghasilkan narasi suara singkat (1 kalimat bahasa Indonesia luwes) untuk disuarakan melalui TTS.

AKSI YANG TERSEDIA:
- "search": Melakukan pencarian Google (isi "query" dengan kata kunci padat).
- "click": Mengklik elemen/link/tombol (isi "target" dengan teks link, nomor indeks elemen seperti "[3]", atau selector).
- "type": Mengetikkan teks ke dalam kolom input atau formulir (isi "target" dengan nama/placeholder input dan "text" dengan teks yang diketik).
- "scroll": Menggulir halaman ke bawah atau atas (isi "direction": "down" | "up", "amount": 500).
- "navigate": Membuka URL web langsung (isi "text" dengan URL tujuan).
- "play_media": Memutar video YouTube atau trek Spotify secara otomatis (isi "platform": "youtube" | "spotify", "query": judul video/lagu).
- "extract": Mengekstrak data ringkasan penting dari halaman saat ini.
- "finish": Mengakhiri misi ketika tujuan pengguna telah tercapai 100%.

TATA CARA PERILAKU OTONOM:
- Jika pengguna meminta video/musik di YouTube atau Spotify, gunakan aksi "play_media" atau "search" dengan judul lagu/video spesifik.
- Jika pengguna bertanya tentang halaman apa yang sedang dibuka, meminta panduan cara menggunakan fitur di halaman saat ini, atau bertanya cara pakai menu yang sedang aktif:
  1. Analisis URL saat ini, judul, dan struktur elemen interaktif untuk mengenali layanan/fitur Google atau web tersebut secara presisi.
  2. Di "finalSummary", berikan penjelasan eksekutif yang ramah dan jelas.
     PENTING: JANGAN menyertakan URL mentah atau template seperti "(URL: https://...)" atau "https://...". Sebutkan nama website/brand secara wajar (contoh: "IntelliBron Orion", "YouTube", "Google Docs").
  3. Tetapkan "isCompleted": true dan pilih aksi "finish".
- Jika halaman belum menampilkan jawaban lengkap atau daftar masih di bawah layar, gunakan aksi "scroll" atau "click" pada hasil yang relevan.
- SANGAT PENTING — JANGAN PERNAH mengakhiri tugas ("isCompleted": true / "finish") sebelum tujuan utama pengguna benar-benar terbukti tercapai di halaman. Lanjutkan dengan aksi "scroll", "click", "navigate", atau "search" sampai data/jawaban yang dibutuhkan benar-benar ditemukan dan tersedia.
- Jika Anda baru saja melakukan pencarian Google dan melihat daftar hasil, JANGAN langsung "finish". Klik hasil yang paling relevan terlebih dahulu, baca isi halamannya, dan baru "finish" setelah informasi yang dibutuhkan benar-benar didapatkan.
- Saat memilih "finish" atau "isCompleted": true, sertakan "finalSummary" yang kaya data, jelas, eksekutif, dan langsung menyampaikan hasil temuan. DILARANG menggunakan kata-kata "sebentar akan saya cek", "tunggu sebentar", atau sejenisnya karena proses pengecekan halaman sudah selesai tuntas.
${stepBudgetWarning}

KONTRAK FORMAT JSON:
{
  "thought": "Analisis tajam mengapa aksi ini dipilih berdasarkan DOM saat ini",
  "narrate": "Kalimat luwes untuk suara ElevenLabs (maksimal 1-2 kalimat)",
  "action": {
    "type": "search" | "click" | "type" | "scroll" | "navigate" | "play_media" | "extract" | "finish",
    "target": "Teks judul link atau selector elemen yang dituju",
    "query": "Kata kunci pencarian (jika tipe search/play_media)",
    "text": "Teks yang diketik atau URL tujuan",
    "direction": "down" | "up",
    "platform": "youtube" | "spotify",
    "keyInsight": "Fakta penting yang ditemukan"
  },
  "isCompleted": false,
  "finalSummary": "Ringkasan eksekutif komprehensif berformat Markdown saat isCompleted = true"
}`;

    let elementsContext = "";
    if (Array.isArray(interactiveElements) && interactiveElements.length > 0) {
      elementsContext = `\nELEMEN INTERAKTIF YANG TERSEDIA DI HALAMAN (DOM SNAPSHOT):\n` +
        interactiveElements.slice(0, 25).map((el: any) => `[${el.index}] <${el.tag}> ${el.text} ${el.role ? `(role: ${el.role})` : ""}`).join("\n");
    }

    const isDirectAnalysis =
      body.isDirectAnalysis ||
      /jelaskan|membahas|tentang apa|apa ini|apa fungsi|baca web|review|analisis/i.test(goal);

    const analysisGuideline = isDirectAnalysis
      ? `\nINSTRUKSI KHUSUS: ANALISIS LENGKAP ISI WEBSITE
Pengguna ingin Anda menjelaskan tentang apa website ini dan apa saja yang dibahas di dalamnya.
STATUS: Pemindaian halaman sudah 100% SELESAI, seluruh teks dari atas hingga bawah (termasuk footer) SUDAH DIEKSTRAK dan tersedia di bawah ini.
ATURAN DIKSI & GAYA BAHASA (SANGAT KRUSIAL):
- DILARANG KERAS menggunakan kata-kata pengantar yang bernada baru mau mulai mengecek, seperti: "sebentar akan aku cek", "tunggu sebentar", "mari kita telusuri", "saya akan memeriksa", "sebentar ya", atau diksi sejenis.
- Karena halaman sudah selesai diperiksa tuntas, LANGSUNG sampaikan hasil analisis secara profesional, percaya diri, dan to-the-point (misalnya: "Website [Nama Website] merupakan platform...", atau "Berikut adalah hasil analisis lengkap mengenai [Nama Website]...").
- Di "narrate": DILARANG mengatakan "sebentar akan saya periksa". Buat kalimat ringkas langsung menyimpulkan apa website tersebut, atau samakan dengan kalimat pertama "finalSummary".

Anda WAJIB:
1. Menetapkan "isCompleted": true dan "action": { "type": "finish" }.
2. Mengisi "finalSummary" dengan ulasan yang SANGAT LENGKAP, MENDALAM, dan MENYELURUH (minimal 3-5 paragraf / poin detail berformat Markdown):
   - **Gambaran Umum**: Apa platform/website ini, siapa pembuatnya (jika ada), dan fokus utamanya.
   - **Fitur & Solusi Utama**: Uraikan minimal 4 sampai 6 poin kapabilitas atau layanan utama yang tertera di website beserta penjelasannya.
   - **Target Pengguna & Manfaat**: Siapa yang membutuhkannya dan masalah apa yang mereka pecahkan.
   - **Kesimpulan**: Rangkuman ringkas dan lugas.
3. Sebutkan nama brand secara wajar (contoh: "IntelliBron Orion"). JANGAN menyertakan URL mentah atau link mentah dalam teks penjelasan.`
      : "";

    const promptText = `TUJUAN PENGGUNA: "${goal}"
URL SAAT INI: ${currentUrl}
LANGKAH KE: ${stepNumber} dari ${maxSteps}
${analysisGuideline}

STRUKTUR KONTEN HALAMAN (DOM Playwright Snapshot):
${viewportText ? viewportText.slice(0, 6000) : "Beranda Mesin Pencari Google."}
${elementsContext}

RIWAYAT AKSI SEBELUMNYA:
${
  history.length > 0
    ? history
        .map(
          (h: any, i: number) =>
            `${i + 1}. [${h.type}] ${h.title || h.detail || ""} (${h.targetElement || ""})`
        )
        .join("\n")
    : "Belum ada aksi, ini adalah langkah pertama."
}

Tentukan langkah berikutnya sekarang!`;

    const parts: any[] = [];

    // Optional: Only attach image if an explicit on-demand screenshot was requested by user
    if (screenshotBase64) {
      const cleanBase64 = screenshotBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    parts.push({ text: `${systemPrompt}\n\n${promptText}` });

    const result = await model.generateContent(parts);
    const rawResponse = result.response.text();

    function safeParseJson(raw: string) {
      let cleaned = raw.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = cleaned.slice(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            return {
              thought: "Mengarahkan navigasi pencarian informasi di Google.",
              narrate: "Mencari informasi relevan di Google sekarang.",
              action: {
                type: "search",
                target: "Google Search",
                query: goal,
                text: goal,
              },
              isCompleted: false,
            };
          }
        }
        return {
          thought: "Memproses query pengguna.",
          narrate: "Memulai penelusuran di Google.",
          action: {
            type: "search",
            target: "Google Search",
            query: goal,
            text: goal,
          },
          isCompleted: false,
        };
      }
    }

    const decision = safeParseJson(rawResponse);

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (err: any) {
    console.error("Step execution error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to compute agent step" },
      { status: 500 }
    );
  }
}
