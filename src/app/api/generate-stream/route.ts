import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { documents } from "@/db/schema";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// ============================================
// SYSTEM PROMPT FACTORY — "OTAK AI" MAKSIMAL
// ============================================

const SHARED_RULES = `
=== STANDAR KUALITAS PEDAGOGIS (WAJIB) ===
1. Kedalaman Materi: Pastikan konten mencakup konsep inti sesuai standar Kurikulum Merdeka (BSKAP 046/2025).
2. Diferensiasi: Berikan variasi aktivitas atau soal yang mencakup level LOTS hingga HOTS.
3. Kontekstual: Hubungkan materi dengan kehidupan sehari-hari siswa di Indonesia.
4. Profil Pelajar Pancasila: Integrasikan nilai-nilai karakter (Mandiri, Kreatif, Bernalar Kritis, dll) secara implisit maupun eksplisit.

=== ATURAN TEKNIS WAJIB ===
1. DILARANG KERAS menggunakan markdown code blocks (\`\`\`html). LANGSUNG MULAI DENGAN <div>.
2. DILARANG menyertakan teks pembuka atau penutup ("Berikut adalah...", "Semoga bermanfaat").
3. SEMUA tabel WAJIB border "1px solid black" dengan padding yang nyaman.
4. Gunakan Bahasa Indonesia formal, kecuali untuk konten khusus Bahasa Arab/Inggris.
5. Gunakan font serif (Times New Roman style) untuk kesan dokumen resmi.
6. TOTAL KONTEN: Minimal 1500 - 2000 kata untuk dokumen perencanaan (ATP, CP, PROTA, PROSEM), namun untuk dokumen seperti LKPD, SESUAIKAN dengan jumlah soal yang diminta user (Jangan bertele-tele jika user meminta soal sedikit).

=== TEMPLATE TANDA TANGAN (WAJIB DI AKHIR) ===
<table style="width: 100%; border: none; margin-top: 50px; font-family: serif; border-collapse: collapse;">
  <tr>
    <td style="width: 50%; text-align: center; border:none; padding: 10px;">
      <p>Mengetahui,</p>
      <p style="font-weight: bold; margin-bottom: 60px;">Kepala Sekolah</p>
      <p style="border-bottom: 1px solid black; display: inline-block; min-width: 180px;">(...................................)</p>
      <p style="margin-top: 5px;">NIP. ................................</p>
    </td>
    <td style="width: 50%; text-align: center; border:none; padding: 10px;">
      <p>.................., .................. 20....</p>
      <p style="font-weight: bold; margin-bottom: 60px;">Guru Mata Pelajaran</p>
      <p style="border-bottom: 1px solid black; display: inline-block; min-width: 180px;">(...................................)</p>
      <p style="margin-top: 5px;">NIP. ................................</p>
    </td>
  </tr>
</table>`;

const MATH_RULES = `
=== ATURAN KHUSUS MATEMATIKA (WAJIB) ===
1. FORMAT PANGKAT: DILARANG menggunakan tanda "^". Gunakan tag HTML <sup> (contoh: x<sup>2</sup>).
2. FORMAT SIMBOL: 
   - Gunakan simbol "≤" untuk kurang dari sama dengan, bukan "\\leq".
   - Gunakan simbol "≥" untuk lebih dari sama dengan, bukan "\\geq".
   - Gunakan simbol "√" untuk akar, jangan gunakan kode "sqrt".
3. DILARANG KERAS menggunakan format LaTeX seperti \\( ... \\) atau \\[ ... \\]. Gunakan teks biasa dan tag HTML.
4. PILIHAN GANDA (A, B, C, D): Setiap soal pilihan ganda WAJIB memiliki opsi yang jelas dengan format:
   A. [Opsi]
   B. [Opsi]
   C. [Opsi]
   D. [Opsi]
   (Jangan hanya menuliskan angkanya saja, harus ada huruf A, B, C, D).
5. DILARANG menyertakan tanda backslash (\\) atau delimiters LaTeX di akhir kalimat atau rumus.
6. FORMAT PECAHAN: Gunakan format mendatar (contoh: 3/4).

=== DAFTAR KESALAHAN YANG HARUS DIHINDARI (REFLEKSI DIRI) ===
- JANGAN menuliskan \\( x^2 \\) -> SALAH. 
- TULISKAN x<sup>2</sup> -> BENAR.
- JANGAN menuliskan \\leq atau \\geq -> SALAH.
- TULISKAN ≤ atau ≥ -> BENAR.
- JANGAN membiarkan soal matematika tanpa label A, B, C, D -> SALAH.
`;


function buildSystemPrompt(type: string, rawPrompt: string): string {
  // Check for Arabic context
  const isArabic = /bahasa\s*arab|pondok|tasykil|harokat/i.test(rawPrompt);
  const langRule = isArabic 
    ? "WAJIB menggunakan Bahasa Arab ber-Harokat (Full Tasykil) pada bagian materi inti. Gunakan direction RTL (dir='rtl') dan font-family: 'Noto Naskh Arabic', serif."
    : "Gunakan Bahasa Indonesia formal sesuai EYD V.";

  const prompts: Record<string, string> = {
    // ──────────── ATP ────────────
    "ATP": `Anda adalah PAKAR KONSULTAN KURIKULUM SENIOR. Tugas Anda: Menyusun Alur Tujuan Pembelajaran (ATP) yang komprehensif.
    
KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== STRUKTUR DOKUMEN ATP ===
1. HEADER FORMAL: Identitas sekolah, Mapel, Kelas, Fase, Semester, Tahun Pelajaran.
2. ANALISIS CP: Uraikan Capaian Pembelajaran (CP) berdasarkan BSKAP 046/2025 minimal 300 kata.
3. PEMETAAN MATERI: Jabarkan urutan materi secara logis dari mudah ke sulit.
4. TABEL ATP DETAIL:
   - Kolom: No, Alur Tujuan Pembelajaran (Gunakan KKO Bloom), Materi Pokok (Warna Kuning), Dimensi P3, Alokasi JP.
   - Jabarkan minimal 8-10 BAB untuk setahun, atau 4-5 BAB untuk satu semester.
5. GLOSARIUM & DAFTAR PUSTAKA: Relevan dengan materi.

${SHARED_RULES}`,

    // ──────────── LKPD ────────────
    "LKPD": `Anda adalah DESAINER INSTRUKSIONAL yang handal. Tugas Anda: Membuat LKPD yang interaktif dan menantang bagi siswa.

KONTEKS DATA GURU (UTAMAKAN DATA INI):
${rawPrompt}

${langRule}

=== ATURAN PRIORITAS INPUT USER (SANGAT KETAT) ===
1. JUMLAH SOAL: Perhatikan jumlah soal untuk masing-masing tipe:
   - Pilihan Ganda (PG): Jika user meminta X soal, buatlah TEPAT X soal.
   - Jawaban Singkat: Jika user meminta Y soal, buatlah TEPAT Y soal.
   - Esai: Jika user meminta Z soal, buatlah TEPAT Z soal.
   (Cek KONTEKS DATA GURU untuk angka-angka ini).
2. DILARANG KERAS melebihkan atau mengurangi jumlah soal yang diminta user. User adalah Raja.
3. TIPE SOAL: Hanya buat tipe soal yang memiliki jumlah > 0 di input user.

=== STRUKTUR DOKUMEN LKPD ===
1. KOP FORMAL & IDENTITAS SISWA (Nama, Kelas, No Absen).
2. JUDUL LKPD & TUJUAN PEMBELAJARAN.
3. PETUNJUK KERJA: Langkah-langkah eksplorasi untuk siswa.
4. RINGKASAN MATERI: Materi singkat namun padat sebagai bekal siswa menjawab.
5. KEGIATAN SISWA:
   - Buat soal berdasarkan preferensi di KONTEKS DATA GURU. 
   - Gunakan format Pilihan Ganda A, B, C, D jika diminta.
6. KUNCI JAWABAN & RUBRIK (Wajib disediakan).

${SHARED_RULES}`,

    // ──────────── CP ────────────
    "CP": `Anda adalah STAF AHLI KEMENDIKBUDRISTEK. Tugas Anda: Menjabarkan Capaian Pembelajaran (CP) menjadi instrumen siap pakai.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== STRUKTUR DOKUMEN CP ===
1. RASIONALITAS: Mengapa mata pelajaran ini penting bagi siswa? (Uraikan panjang lebar minimal 400 kata).
2. TUJUAN MATA PELAJARAN: Kompetensi apa yang ingin dicapai setelah belajar mapel ini?
3. KARAKTERISTIK: Penjelasan elemen-elemen dalam mata pelajaran.
4. TABEL CAPAIAN PER ELEMEN (DENGAN INDIKATOR): Jabarkan secara mendalam indikator ketercapaian untuk setiap elemen.

${SHARED_RULES}`,

    // ──────────── PROTA ────────────
    "PROTA": `Anda adalah WAKIL KEPALA SEKOLAH BIDANG KURIKULUM yang sangat detail. Tugas Anda: Menyusun Program Tahunan (PROTA) yang PROFESIONAL dan sesuai Regulasi BSKAP 046/2025.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN PROTA (WAJIB SESUAI GAMBAR STANDAR) ===
1. JUDUL UTAMA: "PROGRAM TAHUNAN (PROTA)" (Centered, Bold, Font Size 14pt, Background light gray jika memungkinkan).
2. SUB-JUDUL: "MATA PELAJARAN : [NAMA MAPEL]" (Centered, Bold, Underlined, Font Size 12pt).
3. IDENTITAS (Rata Kiri, Margin Atas 20px, Gunakan Tabel Tanpa Border untuk layout):
   - Nama Sekolah : [Isi dari Nama Sekolah yang diberikan user]
   - Mata Pelajaran : [Isi Mapel]
   - Kelas / Semester : [Isi Kelas] / Ganjil & Genap
   - Tahun Pelajaran : [Tahun Pelajaran Berjalan]
4. BAGIAN A: "CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025" (Background light gray, Bold, Margin Atas 20px).
   - Teks Pengantar: "Pada akhir Fase [Fase], murid memiliki kemampuan sebagai berikut:"
   - PEMBAGIAN ELEMEN (DIBUAT POIN NOMOR): 
     1. Pemahaman [Mapel]: Jabarkan narasi CP elemen pemahaman secara mendalam sesuai regulasi.
     2. Keterampilan Proses: Wajib jabarkan poin-poin (Mengamati, Mempertanyakan, dll) secara lengkap seperti standar 046/2025.
5. BAGIAN B: "PROGRAM TAHUNAN" (Background light gray, Bold, Margin Atas 20px).
   - Buat TABEL dengan kolom: No, Alur Tujuan Pembelajaran (ATP), Materi, Alokasi Waktu, Semester.
   - Kolom ATP wajib berisi kalimat aksi (Misal: "Melalui diskusi, siswa dapat menganalisis...").
   - Materi pokok WAJIB diberi highlight warna kuning (<span style="background-color: yellow;">Materi</span>).
   - Alokasi Waktu harus logis (Misal: 2 JP, 4 JP, dst).
   - Semester diisi "I (Ganjil)" atau "II (Genap)".
   - TOTAL JP: Tambahkan baris paling bawah di tabel yang menggabungkan kolom 1-3 untuk teks "Total Jam Pelajaran" dan isi total JP di kolom 4.
6. FOOTER (Tabel Tanda Tangan): Gunakan template SHARED_RULES untuk menyisipkan Nama Guru yang diberikan user.

${SHARED_RULES}`,

    // ──────────── PROSEM ────────────
    "PROSEM": `Anda adalah PAKAR MANAJEMEN KBM. Tugas Anda: Menyusun Program Semester (PROSEM) dengan distribusi mingguan yang presisi.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN PROSEM ===
1. DISTRIBUSI BULAN & MINGGU: Buat tabel lebar yang mencakup 6 bulan (Juli-Des atau Jan-Jun).
2. TANDA "V" PADA MINGGU EFEKTIF: Tentukan kapan suatu materi diajarkan di minggu ke-berapa.
3. AGENDA KHUSUS: Masukkan STS (Sumatif Tengah Semester) dan SAS (Sumatif Akhir Semester) dalam jadwal.

${SHARED_RULES}`,

    // ──────────── KKTP ────────────
    "KKTP": `Anda adalah PAKAR EVALUASI PENDIDIKAN. Tugas Anda: Menyusun Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN KKTP ===
1. TABEL INTERVAL NILAI: 
   - Deskripsikan kriteria untuk 0-40%, 41-65%, 66-85%, dan 86-100%.
2. RUBRIK DESKRIPTIF: Penjelasan naratif tentang level kompetensi siswa untuk setiap Tujuan Pembelajaran (TP).
3. TINDAK LANJUT: Rekomendasi apa yang harus dilakukan guru jika siswa berada di interval tertentu.

${SHARED_RULES}`,
  };

  const isType = (t: string) => type.includes(t) || t.includes(type);
  const isMath = /matematika|math|hitung|angka/i.test(rawPrompt) || /matematika|math/i.test(type);

  let finalPrompt = "";
  if (isType("Program Semester") || isType("PROSEM")) finalPrompt = prompts["PROSEM"];
  else if (isType("Program Tahunan") || isType("PROTA")) finalPrompt = prompts["PROTA"];
  else if (isType("KKTP")) finalPrompt = prompts["KKTP"];
  else if (isType("Capaian Pembelajaran") || type === "CP") finalPrompt = prompts["CP"];
  else if (isType("LKPD")) finalPrompt = prompts["LKPD"];
  else finalPrompt = prompts["ATP"];

  if (isMath) {
    finalPrompt = finalPrompt.replace("${SHARED_RULES}", `${MATH_RULES}\n\n\${SHARED_RULES}`);
  }

  return finalPrompt;
}

function extractTitle(type: string, rawPrompt: string): string {
  const parts = rawPrompt.split("|").map(p => p.trim());
  
  let mapel = "";
  let kelas = "";

  // 1. Parsing by Precise IDs from questionnaire (1001: Subject, 1002: Grade, 2001: Specific Material)
  const getAnswerById = (id: string) => {
    const part = parts.find(p => p.startsWith(`${id}.`));
    if (!part) return "";
    const split = part.split(":");
    return split[split.length - 1].trim();
  };

  mapel = getAnswerById("1001") || getAnswerById("2001");
  kelas = getAnswerById("1002");

  // 2. Fallback to substring search if IDs are not found
  if (!mapel) {
    const mp = parts.find(p => p.toLowerCase().includes("mata pelajaran") || p.toLowerCase().includes("mapel"));
    if (mp) mapel = mp.split(":").pop()?.trim() || "";
  }
  if (!kelas) {
    const kp = parts.find(p => p.toLowerCase().includes("kelas"));
    if (kp) kelas = kp.split(":").pop()?.trim() || "";
  }

  // 3. EXTREMELY AGGRESSIVE CLEANING
  const clean = (text: string) => {
    return text
      .replace(/\(isi manual\)/gi, "")
      .replace(/Buatkan dokumen LKPD LENGKAP/gi, "")
      .replace(/^(?:apa yang ingin Anda rancang\?|rancangan|masukkan|tuliskan|mapel|mata pelajaran|kelas|fase|lewati|isi manual|buatkan|dokumen|lengkap)\s*/i, "")
      .replace(/[?:]/g, "")
      // Remove all leading/trailing non-alphanumeric junk characters (like dots, dashes, spaces)
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      .trim();
  };

  mapel = clean(mapel);
  kelas = clean(kelas);
  const materi = clean(getAnswerById("2001"));

  // Final sanitization with rigorous junk detection
  const isMeaningless = (v: string) => {
    const t = v.trim();
    if (!t) return true;
    if (t.length < 2 && !/^\d+$/.test(t)) return true;
    const lower = t.toLowerCase();
    if (lower.includes("lewati") || lower.includes("manual") || lower.includes("rancangan")) return true;
    if (/^[.\-\s]+$/.test(t)) return true;
    return false;
  };

  const finalMapel = isMeaningless(mapel) ? "Umum" : mapel;
  const finalKelas = isMeaningless(kelas) ? "-" : kelas;
  const finalMateri = isMeaningless(materi) ? "" : materi;

  // New Detailed Template: [TIPE] - Kelas [X] - Mapel [MAPEL] - [MATERI]
  let title = `${type} - Kelas ${finalKelas} - Mapel ${finalMapel}`;
  if (finalMateri) title += ` - ${finalMateri}`;
  
  return title;
}

function cleanAIOutput(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```html\s*/, "").replace(/```\s*$/, "");
  cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  
  if (!cleaned.startsWith("<")) {
    const firstTag = cleaned.indexOf("<div");
    if (firstTag !== -1) cleaned = cleaned.substring(firstTag);
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const { rawPrompt, type, model: requestedModel = "deepseek", rawContext } = body;

    const systemPrompt = buildSystemPrompt(type, rawPrompt);
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          send({ type: "stage", stage: 0, label: "Menganalisis Konteks..." });

          const attemptDeepSeek = async () => {
             const completion = await deepseek.chat.completions.create({
                messages: [{ role: "system", content: systemPrompt }],
                model: "deepseek-chat",
                stream: true,
                temperature: 0.7,
                max_tokens: 8192,
             });
             for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || "";
                if (text) { fullText += text; send({ type: "chunk", text }); }
             }
             return true;
          };

          const attemptGemini = async (modelName: string) => {
             const model = genAI.getGenerativeModel({ model: modelName });
             const result = await model.generateContentStream(systemPrompt);
             for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) { fullText += text; send({ type: "chunk", text }); }
             }
             return true;
          };

          let finalProvider = requestedModel === "deepseek" ? "DeepSeek V3" : "Gemini 2.0 Flash";
          
          try {
             send({ type: "stage", stage: 1, label: `Menyusun Konten dengan ${finalProvider}...` });
             if (requestedModel === "deepseek") await attemptDeepSeek();
             else await attemptGemini("gemini-2.0-flash");
          } catch (e) {
             console.error("Primary model failed, falling back...");
             fullText = "";
             try {
                finalProvider = requestedModel === "deepseek" ? "Gemini 2.0 Flash (Fallback)" : "DeepSeek V3 (Fallback)";
                send({ type: "stage", stage: 2, label: "Mencoba Jalur Alternatif..." });
                if (requestedModel === "deepseek") await attemptGemini("gemini-2.0-flash");
                else await attemptDeepSeek();
             } catch (e2) {
                console.error("Secondary fallback failed...");
                fullText = "";
                finalProvider = "Gemini 1.5 Flash (Safety Net)";
                send({ type: "stage", stage: 2, label: "Menggunakan Model Cadangan..." });
                await attemptGemini("gemini-1.5-flash");
             }
          }

          if (fullText) {
             send({ type: "stage", stage: 3, label: "Finalisasi & Penyimpanan..." });
             const cleaned = cleanAIOutput(fullText);
             const [newDoc] = await db.insert(documents).values({
               title: extractTitle(type, rawContext || rawPrompt),
               type: type,
               content: cleaned,
               userId: session.user.id,
               status: "Selesai",
               size: `${(cleaned.length / 1024).toFixed(1)} KB`,
             }).returning();
             send({ type: "done", docId: newDoc.id, provider: finalProvider });
          } else {
             send({ type: "error", message: "Gagal men-generate konten. Coba lagi." });
          }
          controller.close();
        } catch (error) {
          send({ type: "error", message: "Sistem sibuk, silakan coba beberapa saat lagi." });
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Error" }), { status: 500 });
  }
}