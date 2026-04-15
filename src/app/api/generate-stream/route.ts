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

=== ATURAN PRIORITAS INPUT USER ===
1. JUMLAH SOAL: Jika dalam KONTEKS DATA GURU tertulis jumlah soal tertentu (misal: 7 soal, 10 soal), Anda WAJIB membuat soal persis sesuai jumlah tersebut. DILARANG melebihkan.
2. TIPE SOAL: Hanya buat tipe soal yang diminta di KONTEKS DATA GURU. Jika user hanya meminta Pilihan Ganda, JANGAN buat Isian Singkat atau Esai.

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
    "PROTA": `Anda adalah WAKIL KEPALA SEKOLAH BIDANG KURIKULUM. Tugas Anda: Menyusun Program Tahunan (PROTA) yang efisien.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN PROTA ===
1. HEADER LOGO & IDENTITAS SEKOLAH.
2. TABEL PROTA TAHUNAN (Dikonversi ke tampilan tabel Word yang rapi):
   - Kolom: Semester, No, BAB / Materi Pokok, Alokasi JP, Keterangan.
   - Pisahkan antara Semester Ganjing dan Genap.
3. ANALISIS ALOKASI WAKTU: Hitung total JP efektif dalam 1 tahun pelajaran.

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

  // 1. Process Mapel (Cleaning from any instructional leftovers)
  const mapelPart = parts.find(p => p.toLowerCase().includes("mata pelajaran") || p.toLowerCase().includes("mapel"));
  if (mapelPart) {
    const split = mapelPart.split(":");
    mapel = split[split.length - 1].trim();
    
    // Hard cleaning for subject
    mapel = mapel
      .replace(/^(?:apa yang ingin Anda rancang\?|rancangan|masukkan|tuliskan|mapel|mata pelajaran)\s*/i, "")
      .replace(/^(?:isi manual|lewati|buatkan dokumen|lengkap)\s*/i, "")
      .replace(/[?:]/g, "")
      .replace(/[:\s\-]+$/, "")
      .replace(/^[:\s\-]+/, "")
      .trim();
  }

  // 2. Process Kelas (Cleaning grade redundancy)
  const kelasPart = parts.find(p => p.toLowerCase().includes("kelas"));
  if (kelasPart) {
    const split = kelasPart.split(":");
    let val = split[split.length - 1].trim();
    val = val
      .replace(/^(?:kelas|fase|lewati|isi manual)\s*/i, "")
      .replace(/[?:]/g, "")
      .trim();
    kelas = val;
  }

  // Final sanitization for empty or "junk" values
  const finalMapel = (!mapel || mapel.toLowerCase().includes("lewati")) ? "Umum" : mapel;
  const finalKelas = (!kelas || kelas.toLowerCase().includes("lewati")) ? "-" : kelas;

  // Standard Template: [TIPE] - Kelas [X] - [MAPEL]
  return `${type} - Kelas ${finalKelas} - ${finalMapel}`;
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
    const { rawPrompt, type, model: requestedModel = "deepseek" } = body;

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
               title: extractTitle(type, rawPrompt),
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