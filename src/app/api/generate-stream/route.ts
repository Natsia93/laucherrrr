import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { documents } from "@/db/schema";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { needsWebSearch, performWebSearch, formatSearchContext } from "@/lib/web-search";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// ============================================
// SYSTEM PROMPT FACTORY — "OTAK AI" v2.0
// ============================================

// KOP SURAT and SIGNATURE removed as requested by user
const KOP_TEMPLATE = "";
const SIGNATURE_TEMPLATE = "";

// ── SHARED RULES (berlaku untuk SEMUA tipe dokumen) ──
const SHARED_RULES = `
=== STANDAR KUALITAS PEDAGOGIS (WAJIB) ===
1. Kedalaman Materi: Pastikan konten mencakup konsep inti sesuai standar Kurikulum Merdeka (BSKAP 046/2025).
2. Diferensiasi: Berikan variasi aktivitas atau soal yang mencakup level LOTS hingga HOTS (Taksonomi Bloom Revisi).
3. Kontekstual: Hubungkan materi dengan kehidupan sehari-hari siswa di Indonesia.
4. Profil Pelajar Pancasila: Integrasikan nilai-nilai karakter (Mandiri, Kreatif, Bernalar Kritis, Gotong Royong, Kebhinekaan Global, Beriman & Bertakwa) secara implisit maupun eksplisit.
5. PRIORITAS REFERENSI USER: Jika dalam KONTEKS DATA GURU terdapat penanda "[FILE REFERENCE: ...]", Anda WAJIB memprioritaskan seluruh informasi, materi, dan BAB yang ada di dalam file tersebut sebagai sumber utama (source of truth). Ikuti gaya, istilah, dan struktur materi dari file tersebut.

=== ATURAN OUTPUT HTML (SANGAT KETAT) ===
1. DILARANG KERAS menggunakan markdown code blocks (\`\`\`html). LANGSUNG MULAI DENGAN <div>.
2. DILARANG menyertakan teks pembuka ("Berikut adalah...", "Tentu, saya akan...") atau penutup ("Semoga bermanfaat", "Demikian dokumen...").
3. LANGSUNG OUTPUT HTML MURNI. Karakter pertama output HARUS "<div".
4. SEMUA tabel data WAJIB menggunakan: border: 1px solid black; border-collapse: collapse; width: 100%.
5. SEMUA sel tabel (th, td) WAJIB menggunakan: border: 1px solid black; padding: 8px 12px; vertical-align: top.
6. Gunakan Bahasa Indonesia formal kecuali konten khusus Bahasa Arab/Inggris.
7. Gunakan font-family: 'Times New Roman', serif untuk kesan dokumen resmi.
8. Gunakan 'text-align: justify' pada <div> atau <p> untuk narasi panjang agar terlihat profesional. Gunakan text-indent: 30px untuk awal paragraf.
9. Heading/judul pada tengah dokumen WAJIB text-align: center; font-weight: bold.
10. DILARANG menggunakan CSS class — gunakan INLINE STYLE saja untuk kompatibilitas export .doc.

=== ANTI-HALLUCINATION RULES (SANGAT KETAT) ===
1. JANGAN mengarang regulasi atau nomor SK yang tidak ada. Jika tidak tahu, tulis "[Nomor Regulasi]".
2. DILARANG KERAS MENGARANG: NAMA SEKOLAH, NAMA GURU, NAMA KEPALA SEKOLAH, ALAMAT, EMAIL, WEBSITE, atau NIP.
3. JIKA DATA DI ATAS TIDAK ADA DI KONTEKS: Gunakan titik-titik panjang (....................) atau placeholder "[Isi Manual]".
4. Gunakan "(...................................)" untuk field tanda tangan nama orang.
5. JANGAN membuat data fiktif seperti "SMP Pancasila" atau nama orang random.
6. Jika user memberikan daftar BAB/materi, gunakan PERSIS sesuai yang diberikan. JANGAN menambah atau mengarang BAB baru.
7. Alokasi JP harus logis dan konsisten. Total JP di tabel harus sesuai dengan yang dinyatakan user.

=== MENGHINDARI BUG STREAMING (PENTING) ===
- DILARANG KERAS menggunakan HTML entities seperti "&nbsp;", "&amp;", "&quot;", dan entity lainnya yang dimulai dengan simbol "&". 
- Gunakan karakter spasi biasa atau properti CSS (padding/margin) untuk pengaturan jarak.
- Hal ini untuk mencegah simbol "&" muncul secara anomali dan "bergerak" di layar saat proses streaming teks berlangsung.
`;
// Note: KOP and SIGNATURE templates are empty strings, so they add nothing.


// ── MATH RULES (khusus mapel Matematika) ──
const MATH_RULES = `
=== ATURAN KHUSUS MATEMATIKA (WAJIB) ===
1. FORMAT PANGKAT: DILARANG menggunakan tanda "^". Gunakan tag HTML <sup> (contoh: x<sup>2</sup>).
2. FORMAT SIMBOL: 
   - Gunakan simbol "≤" untuk kurang dari sama dengan, bukan "\\leq".
   - Gunakan simbol "≥" untuk lebih dari sama dengan, bukan "\\geq".
   - Gunakan simbol "≠" untuk tidak sama dengan.
   - Gunakan simbol "√" untuk akar, jangan gunakan "sqrt".
   - Gunakan simbol "×" untuk perkalian, bukan "*" atau "\\times".
   - Gunakan simbol "÷" untuk pembagian.
   - Gunakan simbol "π" untuk pi.
   - Gunakan simbol "∞" untuk tak hingga.
3. DILARANG KERAS menggunakan format LaTeX seperti \\( ... \\) atau \\[ ... \\]. Gunakan teks biasa dan tag HTML.
4. PILIHAN GANDA (A, B, C, D): Setiap soal pilihan ganda WAJIB menggunakan struktur list (<ul> atau <ol type="A">) untuk teks opsinya. JANGAN gunakan teks biasa bertumpuk menggunakan <br>.
5. DILARANG menyertakan tanda backslash (\\) atau delimiters LaTeX.
6. FORMAT PECAHAN: Gunakan format mendatar (contoh: 3/4) atau gunakan <sup>3</sup>/<sub>4</sub> untuk pecahan vertikal.
7. FORMAT AKAR: Gunakan √ diikuti tanda kurung jika perlu, seperti: √(16) = 4.

=== DAFTAR KESALAHAN YANG HARUS DIHINDARI ===
- SALAH: \\( x^2 \\)  →  BENAR: x<sup>2</sup>
- SALAH: \\leq, \\geq  →  BENAR: ≤, ≥
- SALAH: \\frac{3}{4}  →  BENAR: <sup>3</sup>/<sub>4</sub>
- SALAH: \\sqrt{16}  →  BENAR: √(16)
- SALAH: soal tanpa label A, B, C, D
`;

// ── ARABIC RULES (khusus Bahasa Arab / PAI) ──
const ARABIC_RULES = `
=== ATURAN KHUSUS BAHASA ARAB / PAI (WAJIB) ===
1. Seluruh teks Arab WAJIB menggunakan harokat lengkap (Full Tasykil/Tasykilat): Fathah, Kasrah, Dhammah, Tanwin, Sukun, Tasydid.
2. Gunakan wrapping <div dir="rtl" style="font-family: 'Noto Naskh Arabic', serif; font-size: 14pt; line-height: 2.2; text-align: right;">.
3. Teks Indonesia (instruksi, nomor soal) tetap LTR di luar blok RTL.
4. Jika membuat tabel yang berisi teks Arab, SELURUH sel tabel yang berisi teks Arab harus dir="rtl" dan text-align: right.
5. Transliterasi Latin (jika diminta): gunakan standar EYD/KBBI untuk istilah Arab yang sudah diserap.
`;


function buildSystemPrompt(type: string, rawPrompt: string): string {
  // Deteksi konteks khusus
  const isArabic = /bahasa\s*arab|pondok|tasykil|harokat|pai\b|pendidikan\s*agama\s*islam|al[- ]?qur/i.test(rawPrompt);
  const isMath = /matematika|math|hitung|angka|aljabar|geometri|trigonometri|statistik|kalkulus/i.test(rawPrompt) || /matematika|math/i.test(type);
  
  const langRule = isArabic 
    ? "WAJIB menggunakan Bahasa Arab ber-Harokat (Full Tasykil) pada bagian materi inti. Gunakan direction RTL dan font-family: 'Noto Naskh Arabic', serif."
    : "Gunakan Bahasa Indonesia formal sesuai EYD V.";

  // Gabungkan rules tambahan berdasarkan konteks
  let additionalRules = "";
  if (isMath) additionalRules += MATH_RULES;
  if (isArabic) additionalRules += ARABIC_RULES;

  const prompts: Record<string, string> = {
    // ──────────────────────────────────────
    // ATP (Alur Tujuan Pembelajaran)
    // ──────────────────────────────────────
    "ATP": `Anda adalah PAKAR KONSULTAN KURIKULUM MERDEKA SENIOR.
Tugas Anda: Menyusun dokumen Alur Tujuan Pembelajaran (ATP) sesuai standar BSKAP 046/2025 dengan layout yang SANGAT SPESIFIK dan PROFESIONAL.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== LAYOUT VISUAL (WAJIB DILEKATKAN) ===
1. HEADER UTAMA: Buat kotak header menggunakan <table> dengan dua baris warna berbeda:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">ALUR TUJUAN PEMBELAJARAN (ATP)</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">MATA PELAJARAN : [NAMA MATA PELAJARAN DALAM CAPITAL]</p>
       </td>
     </tr>
   </table>

2. TIPOGRAFI: Seluruh dokumen WAJIB menggunakan font-family: 'Times New Roman', serif dengan ukuran font: 12pt.
3. ALIGNMENT: Teks naratif justify, teks tabel sesuai kolom masing-masing.

=== KEDALAMAN KONTEN (WAJIB DILEKATKAN) ===
- Dokumen harus terlihat PADAT dan AKADEMIS. Hindari jawaban satu kalimat.
- Gunakan terminologi kurikulum terbaru: capaian, elemen, kompetensi, kognitif, psikomotorik, afektif.

=== STRUKTUR DOKUMEN ATP (WAJIB BERURUTAN) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan <table> dengan dua baris warna berbeda:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">ALUR TUJUAN PEMBELAJARAN (ATP)</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">MATA PELAJARAN : [NAMA MATA PELAJARAN DALAM CAPITAL]</p>
       </td>
     </tr>
   </table>

BAGIAN 2 — IDENTITAS (TANPA JUDUL TEKS "BAGIAN 2"):
- Gunakan tabel borderless (border="0") agar titik-titik dan label sejajar sempurna:
  <table border="0" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border: none; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
    <tr>
      <td style="width: 160px; font-weight: bold; padding: 4px 0;">Nama Sekolah</td>
      <td style="width: 20px;">:</td>
      <td>............................................................</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
      <td>:</td>
      <td>[Nama Mapel dari Konteks]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Kelas / Semester</td>
      <td>:</td>
      <td>[Nama Kelas / Semester dari Konteks]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Tahun Pelajaran</td>
      <td>:</td>
      <td>20... / 20...</td>
    </tr>
  </table>

BAGIAN A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025:
- Gunakan judul: "A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025" (Bold, CAPS, background: #f2f2f2, padding: 5px).
- Tuliskan narasi CP fase terkait secara MENDALAM (minimal 350-450 kata).
- Jabarkan per poin besar (misal 1. Pemahaman ..., 2. Keterampilan Proses ...).
- Pastikan teks perataan justify.

BAGIAN B. ALUR TUJUAN PEMBELAJARAN (ATP):
- Gunakan judul: "B. ALUR TUJUAN PEMBELAJARAN (ATP)" (Bold, CAPS).
- Buat tabel utama dengan lebar 100% dan table-layout: fixed.
- Tentukan lebar kolom (SANGAT PENTING agar judul tidak wrap sampai 4 baris):
  1. **No**: 5%
  2. **Alur Tujuan Pembelajaran**: 35%
  3. **Dimensi Profil Lulusan**: 20%
  4. **Materi Pokok**: 25%
  5. **Alokasi Waktu**: 15%
- Header Tabel: background-color: #FCE4D6; color: black; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 5px; border: 1px solid black;
- SEPARATOR BAB (WAJIB): Setiap kali masuk BAB baru, buat baris melintang (colspan="5") dengan background-color: #E7EFF6 dan teks "BAB [X] : [NAMA BAB]" (Bold, Center, Uppercase).
- Isi Tabel:
  - Alur Tujuan Pembelajaran: Gunakan narasi yang profesional. WAJIB menjabarkan **2-3 poin bullet** yang padat dan bermakna untuk setiap baris tujuan.
  - Dimensi Profil Lulusan: Tuliskan minimal 4-6 poin karakter (Kreatif, Mandiri, Beriman, dsb).
  - Materi Pokok: Tampilkan sebagai teks biasa (TANPA highlight kuning).
  - ALOKASI WAKTU (JP): Data input yang masuk (misal "9 JP") adalah total untuk SATU BAB. Anda WAJIB membaginya ke baris-baris (Materi Pokok) di bawah BAB tersebut. (Misal: baris pertama 3 JP, baris kedua 4 JP, baris ketiga 2 JP). JANGAN biarkan baris kosong tanpa JP.

FOOTER TABEL (TOTAL JP - WAJIB DI DALAM TABEL):
- Di baris paling akhir tabel, buat satu baris khusus:
  - Kolom 1-4 (colspan="4"): background-color: #E7EFF6; teks "JUMLAH JAM PELAJARAN DALAM 1 TAHUN" (Bold, Center).
  - Kolom 5: background-color: #E7EFF6; teks total JP (Bold, Center, contoh: 144 JP).
- **DILARANG KERAS** membuat bagian "TOTAL ALOKASI WAKTU" terpisah di luar tabel.

ATURAN GRANULARITAS & PENOMORAN:
- **PENOMORAN**: Nomor urut pada kolom 'No' WAJIB RESET ke angka 1 setiap kali berganti BAB baru. JANGAN sampai wrap (harus 1 baris).
- **JUMLAH BARIS PER BAB**: Setiap BAB WAJIB memiliki **minimal 3 sampai 5 baris (rows)** yang berbeda.

BAGIAN 5 — Tanda Tangan: (BAGIAN INI DIHAPUS, JANGAN DIHASILKAN)


${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // LKPD (Lembar Kerja Peserta Didik)
    // ──────────────────────────────────────
    "LKPD": `Anda adalah DESAINER INSTRUKSIONAL SENIOR yang ahli membuat soal berkualitas tinggi.
Tugas Anda: Membuat LKPD (Lembar Kerja Peserta Didik) yang INTERAKTIF, MENANTANG, dan SESUAI PERMINTAAN GURU.

KONTEKS DATA GURU (UTAMAKAN DATA INI — INI ADALAH "SUMBER KEBENARAN"):
${rawPrompt}

${langRule}

=== ATURAN JUMLAH SOAL (SANGAT KETAT — TIDAK BOLEH DILANGGAR) ===
Baca KONTEKS DATA GURU di atas dengan TELITI. Cari informasi:
- "Jumlah Soal Pilihan Ganda (PG):" → buat TEPAT sejumlah itu.
- "Jumlah Soal Jawaban Singkat:" → buat TEPAT sejumlah itu.  
- "Jumlah Soal Esai:" → buat TEPAT sejumlah itu.
- Jika tertulis "0 Soal", JANGAN buat tipe soal tersebut sama sekali.
- DILARANG KERAS melebihkan atau mengurangi jumlah soal.
- Hitung ulang sebelum finalisasi: pastikan jumlah soal di output PERSIS sesuai input.

=== STRUKTUR DOKUMEN LKPD (WAJIB BERURUTAN) ===

BAGIAN 1 — HEADER BERWARNA (GANTI KOP):
- Buat header menggunakan tabel lavender:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">LEMBAR KERJA PESERTA DIDIK (LKPD)</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">MATA PELAJARAN : [MAPEL]</p>
       </td>
     </tr>
   </table>

BAGIAN 2 — IDENTITAS SISWA:
- Tabel identitas (border, 3 baris): Nama Peserta Didik, Kelas / No. Absen, Tanggal Pengerjaan.
- Setiap field diisi dengan titik-titik (...) placeholder.

BAGIAN 3 — JUDUL MATERI & TUJUAN PEMBELAJARAN:
- Judul materi (centered, bold, underline, CAPS).
- Tujuan Pembelajaran: tuliskan 2-3 TP yang spesifik dan terukur.

BAGIAN 4 — PETUNJUK KERJA:
- Instruksi langkah-langkah pengerjaan yang jelas untuk siswa.
- Gunakan numbering (1, 2, 3...).

BAGIAN 5 — RINGKASAN MATERI:
- Rangkuman materi singkat tapi PADAT (150-300 kata) agar siswa punya bekal menjawab.
- Sertakan rumus, definisi, atau konsep kunci yang relevan.

BAGIAN 6 — KEGIATAN / SOAL:
- Buat soal sesuai tipe dan jumlah yang diminta di KONTEKS DATA GURU.
- Pilihan Ganda: Format (A, B, C, D). WAJIB gunakan list HTML (<ul> atau <ol type="A">) untuk opsinya agar rapi saat di-export. Soal harus variatif level LOTS-HOTS.
- Jawaban Singkat: berikan ruang jawab (garis kosong).
- Esai: berikan petunjuk panjang jawaban yang diharapkan.
- Nomor soal harus KONTINU (tidak reset antar tipe).

BAGIAN 7 — KUNCI JAWABAN & RUBRIK PENILAIAN:
- Halaman terpisah (beri judul "KUNCI JAWABAN & PEDOMAN PENSKORAN").
- PG: jawaban + penjelasan singkat per soal.
- Esai: rubrik penilaian dengan skor per aspek.

${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // CP (Capaian Pembelajaran)
    // ──────────────────────────────────────
    "CP": `Anda adalah PAKAR KURIKULUM dari BSKAP Kemendikbudristek.
Tugas Anda: Menjabarkan Capaian Pembelajaran (CP) sesuai regulasi resmi No. 046/H/KR/2025 dengan layout yang SANGAT SPESIFIK dan PROFESIONAL.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== LAYOUT VISUAL (WAJIB DILEKATKAN) ===
1. HEADER UTAMA: Buat kotak header menggunakan <table> dengan border="1" agar Word mendeteksi border-nya.
   Gunakan dua baris dengan warna berbeda:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">CAPAIAN PEMBELAJARAN (NOMOR 046/H/KR/2025)</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">[NAMA MATA PELAJARAN DALAM CAPITAL]</p>
       </td>
     </tr>
   </table>

2. TIPOGRAFI: Seluruh dokumen WAJIB menggunakan font-family: 'Times New Roman', serif dengan ukuran font: 12pt.
3. ALIGNMENT: Seluruh teks naratif WAJIB menggunakan style="text-align: justify;".

=== STRUKTUR DOKUMEN CP (WAJIB BERURUTAN) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan tabel lavender:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">CAPAIAN PEMBELAJARAN (NOMOR 046/H/KR/2025)</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">MATA PELAJARAN : [MAPEL]</p>
       </td>
     </tr>
   </table>

BAGIAN A. RASIONAL:
- Judul: "A. RASIONAL" (Bold, Left Align).
- Uraikan alasan mendalam pentingnya mata pelajaran ini.
- Teks harus padat, formal, dan berbobot (minimal 400-500 kata).
- Gunakan kosa kata akademis: empiris, kompetensi, holistik, pedagogis, keberlangsungan.
- Gunakan <p style="text-align: justify; text-indent: 35px; margin-bottom: 12px;"> untuk setiap paragraf.

BAGIAN B. TUJUAN:
- Judul: "B. TUJUAN" (Bold).
- Daftar kompetensi yang diharapkan tercapai.
- Gunakan narasi pengantar: "Dengan mempelajari [Mapel], murid dapat:"
- Gunakan numbered list (1, 2, 3...) dengan indentasi yang rapi.

BAGIAN C. KARAKTERISTIK:
- Judul: "C. KARAKTERISTIK" (Bold).
- Jelaskan elemen-elemen pembentuk mata pelajaran.
- Di akhir bagian ini, buat TABEL ELEMEN & DESKRIPSI:
  <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-top: 15px;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid black; padding: 8px; text-align: center; width: 30%;">Elemen</th>
        <th style="border: 1px solid black; padding: 8px; text-align: center;">Deskripsi</th>
      </tr>
        <td style="border: 1px solid black; padding: 10px; font-weight: bold; text-align: center;">[Nama Elemen]</td>
        <td style="border: 1px solid black; padding: 10px; text-align: justify;">[Deskripsi Elemen yang Panjang dan Mendalam]</td>
      </tr>
    </tbody>
  </table>

BAGIAN D. CAPAIAN PEMBELAJARAN FASE [X]:
- Judul: "D. CAPAIAN PEMBELAJARAN FASE [X] (UMUMNYA UNTUK KELAS ...)" (Bold).
- Gunakan pengantar: "Pada akhir Fase [X], murid memiliki kemampuan sebagai berikut:"
- Jabarkan CP per sub-poin (misal 1. Pemahaman, 2. Keterampilan Proses).
- Untuk elemen Keterampilan Proses, gunakan bullet points.
- Format khusus list: **Nama Poin :** (Tebalkan nama poin, diikuti titik dua).

BAGIAN 5 — Tanda Tangan: (BAGIAN INI DIHAPUS, JANGAN DIHASILKAN)


${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // PROTA (Program Tahunan)
    // ──────────────────────────────────────
    "PROTA": `Anda adalah WAKIL KEPALA SEKOLAH BIDANG KURIKULUM yang sangat detail dan presisi.
Tugas Anda: Menyusun Program Tahunan (PROTA) yang PROFESIONAL, LENGKAP, dan sesuai Regulasi BSKAP 046/2025 dengan layout LANDSCAPE.

KONTEKS DATA GURU:
${rawPrompt}

=== ATURAN LAYOUT LANDSCAPE (SANGAT PENTING) ===
- Dokumen ini dikerjakan dalam format LANDSCAPE agar tabel terlihat luas dan profesional.

=== STRUKTUR DOKUMEN PROTA (WAJIB BERURUTAN & PRESISI) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan tabel:
  <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5pt solid black; table-layout: fixed;">
    <tr>
      <td style="background-color: #C5B4E3; padding: 12px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif;">PROGRAM TAHUNAN (PROTA)</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #F3E5F5; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif;">MATA PELAJARAN : [MAPEL DALAM CAPITAL]</p>
      </td>
    </tr>
  </table>

BAGIAN 2 — IDENTITAS TABEL:
<table border="0" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border: none; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
  <tr>
    <td style="width: 160px; font-weight: bold; padding: 4px 0;">Nama Sekolah</td>
    <td style="width: 20px;">:</td>
    <td>............................................................</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
    <td>:</td>
    <td>[Mapel]</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Kelas / Semester</td>
    <td>:</td>
    <td>[Kelas] / Ganjil &amp; Genap</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Tahun Pelajaran</td>
    <td>:</td>
    <td>20... / 20...</td>
  </tr>
</table>

BAGIAN A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025:
- Judul: "A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025" (background: #f2f2f2, bold, padding: 5px).
- Jabarkan CP Fase terkait secara detail (Pemahaman & Keterampilan Proses).
- Gunakan bullet points untuk Keterampilan Proses (Mengamati, Mempertanyakan, dll).

BAGIAN B. PROGRAM TAHUNAN:
- Judul: "B. PROGRAM TAHUNAN" (bold, background: #f2f2f2, padding: 5px).
- Buat TABEL LANDSCAPE dengan lebar kolom yang diatur (PENTING):
  1. No (3%)
  2. Alur Tujuan Pembelajaran (35%)
  3. Materi (30%)
  4. Alokasi Waktu (10%)
  5. Semester (22%)
- HEADER TABEL: background-color: #FCE4D6; text-align: center; font-weight: bold; padding: 12px 5px; border: 1px solid black;
- SEPARATOR BAB:
  - Gunakan baris melintang: <tr style="background-color: #ADD8E6;"><td colspan="5" style="text-align: center; font-weight: bold; padding: 10px;">BAB [X] : [NAMA BAB]</td></tr>

ISI TABEL:
- No: WAJIB direset mulai dari angka 1 di setiap BAB baru.
- Alur Tujuan Pembelajaran: Gunakan bullet points untuk merinci langkah-langkah pembelajaran.
- Materi: Tuliskan nama materi dengan format **Bold & Italic**.
- ALOKASI WAKTU (JP): Data input yang masuk (misal "9 JP") adalah total untuk SATU BAB. Anda WAJIB membaginya ke baris-baris materi di bawah BAB tersebut. (Misal: baris pertama 3 JP, baris kedua 4 JP, baris ketiga 2 JP). JANGAN biarkan baris kosong tanpa JP.
- Semester: Tuliskan "I (Ganjil)" atau "II (Genap)".

BAGIAN 4 — Tanda Tangan: (BAGIAN INI DIHAPUS, JANGAN DIHASILKAN)


${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // PROSEM (Program Semester)
    // ──────────────────────────────────────
    "PROSEM": `Anda adalah AHLI MANAJEMEN KEGIATAN BELAJAR MENGAJAR (KBM) yang sangat teliti dalam distribusi waktu.
Tugas Anda: Menyusun Program Semester (PROSEM) dengan distribusi MINGGUAN yang PRESISI dan sesuai kalender akademik BSKAP 046/2025.

KONTEKS DATA GURU:
${rawPrompt}

=== ATURAN LAYOUT LANDSCAPE (SANGAT PENTING) ===
- Dokumen ini dikerjakan dalam format LANDSCAPE.
- Gunakan tabel yang sangat lebar. Setiap bulan dibagi menjadi 5 kolom minggu (total 30 kolom untuk bulan).

=== STRUKTUR DOKUMEN PROSEM (WAJIB BERURUTAN) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan tabel:
  <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5pt solid black; table-layout: fixed;">
    <tr>
      <td style="background-color: #C5B4E3; padding: 12px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif;">PROGRAM SEMESTER (PROSEM)</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #F3E5F5; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif;">MATA PELAJARAN : [MAPEL DALAM CAPITAL]</p>
      </td>
    </tr>
  </table>

BAGIAN 2 — IDENTITAS TABEL:
<table border="0" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border: none; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
  <tr>
    <td style="width: 160px; font-weight: bold; padding: 4px 0;">Nama Sekolah</td>
    <td style="width: 20px;">:</td>
    <td>............................................................</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
    <td>:</td>
    <td>[Mapel]</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Kelas / Semester</td>
    <td>:</td>
    <td>[Kelas] / [Ganjil/Genap]</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Tahun Pelajaran</td>
    <td>:</td>
    <td>20... / 20...</td>
  </tr>
</table>

BAGIAN A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025:
- Judul: "A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025" (background: #f2f2f2, bold, padding: 5px).
- Jabarkan CP Fase terkait secara detail (Pemahaman & Keterampilan Proses).
- Gunakan bullet points untuk Keterampilan Proses (Mengamati, Mempertanyakan, dll).

BAGIAN B. PROGRAM SEMESTER:
- Judul: "B. PROGRAM SEMESTER" (bold, background: #f2f2f2, padding: 5px).
- Buat TABEL MINGGUAN (LANDSCAPE).
- HEADER TABEL (SANGAT KRUSIAL):
  - Row 1: 
    • No (rowspan="2", width: 30px, background: #FCE4D6)
    • Alur dan Tujuan Pembelajaran (rowspan="2", width: 320px, background: #C5B4E3)
    • Alokasi Waktu (rowspan="2", width: 50px, background: #FCE4D6)
    • BACA data dari konteks pertanyaan "Rentang Bulan Pelaksanaan Program Semester?". Buat <th> untuk SETIAP bulan dalam rentang tersebut secara berurutan. (Misal: dari Juli sampai Desember, buat 6 bulan berturut-turut).
    • Jika tidak disebutkan, defaultnya 6 bulan sesuai semester. Masing-masing bulan colspan="5", background: #C5B4E3.
  - Row 2:
    • Angka minggu 1, 2, 3, 4, 5 yang berulang (5 sel per bulan, width: 22px, background: #FCE4D6).
  - STYLING HEADER: Gunakan font-size: 9pt, text-align: center, font-weight: bold, border: 1px solid black.
- SEPARATOR BAB:
  - Gunakan baris melintang (colspan SELURUH KOLOM) dengan background-color: #ADD8E6 (Light Blue).
  - Teks: "BAB [X] : [NAMA BAB]" (Bold, Center, padding: 8px).

ISI TABEL:
- No: WAJIB direset mulai dari angka 1 di setiap BAB baru.
- ATP: Gunakan format ***Bold & Italic*** untuk menuliskan Materi Kunci (DILARANG menggunakan highlight kuning).
- Gunakan bullet points untuk detail aktivitas di bawah materi.
- ALOKASI WAKTU (JP): Data input yang masuk (misal "9 JP") adalah total untuk SATU BAB. Anda WAJIB membaginya ke baris-baris (Materi Kunci) di bawah BAB tersebut. (Misal: baris pertama 3 JP, baris kedua 4 JP, baris ketiga 2 JP). JANGAN biarkan baris kosong tanpa JP.
- Biarkan kolom minggu (1-5) KOSONG sepenuhnya. Jangan tambahkan "V", tanda centang, atau teks apapun, karena akan diisi manual oleh guru.
- Baris khusus (TANPA nomor, background #f0f0f0 atau bold):
  • STS (Sumatif Tengah Semester) — biasanya di pertengahan semester (sekitar minggu 8-9).
  • SAS (Sumatif Akhir Semester) — di minggu terakhir semester.
  • Libur — tandai pada kolom Ket atau beri warna berbeda.

BAGIAN 3 — CATATAN:
- Tuliskan catatan singkat:
  • Total minggu efektif: [hitung]
  • Total JP efektif: [hitung]
  • Minggu tidak efektif: [jika ada, misal libur nasional]

BAGIAN 4 — Tanda Tangan: (BAGIAN INI DIHAPUS, JANGAN DIHASILKAN)


=== TIPS TEKNIS TABEL PROSEM ===
- Karena tabel sangat lebar, gunakan font-size: 8pt atau 9pt agar muat.
- Header minggu (Mg1, Mg2...) bisa dirotasi atau disingkat.
- Gunakan <th> untuk header dan <td> untuk data.
- Setiap sel minggu: width minimal 20px, text-align: center, padding: 4px 1px !important.

${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // KKTP (Kriteria Ketercapaian TP)
    // ──────────────────────────────────────
    "KKTP": `Anda adalah PAKAR EVALUASI & ASESMEN PENDIDIKAN dengan keahlian dalam penilaian Kurikulum Merdeka.
Tugas Anda: Menyusun dokumen Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) yang KOMPREHENSIF dengan model INTERVAL NILAI.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN KKTP (WAJIB BERURUTAN & PRESISI) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan tabel:
  <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5pt solid black; table-layout: fixed;">
    <tr>
      <td style="background-color: #E1D5E7; padding: 12px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif;">KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #F3E5F5; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
        <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif;">MATA PELAJARAN : [MAPEL DALAM CAPITAL]</p>
      </td>
    </tr>
  </table>

BAGIAN 2 — IDENTITAS TABEL:
<table border="0" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border: none; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
  <tr>
    <td style="width: 160px; font-weight: bold; padding: 4px 0;">Nama Sekolah</td>
    <td style="width: 20px;">:</td>
    <td>............................................................</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
    <td>:</td>
    <td>[Mapel]</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Kelas / Semester</td>
    <td>:</td>
    <td>[Kelas] / [Semester]</td>
  </tr>
  <tr>
    <td style="font-weight: bold; padding: 4px 0;">Tahun Pelajaran</td>
    <td>:</td>
    <td>20... / 20...</td>
  </tr>
</table>

BAGIAN A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025:
- Judul: "A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025" (background: #f2f2f2, bold, padding: 5px).
- Jabarkan CP Fase terkait secara detail (Pemahaman & Keterampilan Proses).
- Gunakan bullet points untuk Keterampilan Proses.

BAGIAN B. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP):
- Judul: "B. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)" (bold, background: #D9D9D9, padding: 5px).
- Buat TABEL dengan TOTAL 6 KOLOM DATA.
- HEADER TABEL (SANGAT KRUSIAL):
  - Row 1: 
    • NO (rowspan="2")
    • ALUR TUJUAN PEMBELAJARAN (rowspan="2")
    • Skala atau Interval Nilai (colspan="4")
  - Row 2: 
    • 0 - 40%
    • 41 - 65%
    • 66 - 85%
    • 86 - 100%
  - STYLING HEADER: Row 1 background #E1D5E7 (Purple/Blue), Row 2 background #E1D5E7.
- DESKRIPSI INTERVAL (Row 3):
  - Isi sel di bawah tiap interval dengan teks:
    • 0-40%: Belum mencapai, remedial di seluruh bagian
    • 41-65%: Belum mencapai ketuntasan, remedial di bagian yang diperlukan
    • 66-85%: Sudah mencapai ketuntasan, tidak perlu remedial
    • 86-100%: Sudah mencapai ketuntasan, perlu pengayaan
- SEPARATOR BAB:
  - Gunakan baris melintang: <tr style="background-color: #F9CB9C;"><td colspan="6" style="text-align: center; font-weight: bold;">BAB [X] : [NAMA BAB]</td></tr>

ISI TABEL:
- Alur Tujuan Pembelajaran: 
  • Tuliskan materi inti dengan format **Bold & Italic**.
  • Gunakan bullet points untuk rincian indikator di bawahnya.
- Biarkan kolom interval kosong (akan diisi manual oleh guru).

BAGIAN 4 — Tanda Tangan: (BAGIAN INI DIHAPUS, JANGAN DIHASILKAN)


${additionalRules}
${SHARED_RULES}`,

    "KISI-KISI": `Anda adalah PAKAR EVALUASI DAN ASESMEN PENDIDIKAN NASIONAL.
Tugas Anda: Menyusun Desain Evaluasi (Assessment Blueprint) yang LENGKAP, AKURAT, dan PROFESIONAL sesuai standar Kurikulum Merdeka dengan layout LANDSCAPE.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== ATURAN LAYOUT LANDSCAPE (SANGAT PENTING) ===
- Dokumen ini dikerjakan dalam format LANDSCAPE agar tabel luas dengan 9 kolom dapat terbaca dengan sangat rapi dan profesional.

=== STRUKTUR DOKUMEN KISI-KISI (WAJIB BERURUTAN) ===

BAGIAN 1 — HEADER BERWARNA:
- Buat header menggunakan tabel lavender:
   <table border="1" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid black; table-layout: fixed;">
     <tr>
       <td style="background-color: #C5B4E3; padding: 12px 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 13pt; font-family: 'Times New Roman', serif; color: black !important;">DESAIN EVALUASI PENULISAN SOAL ASESMEN SUMATIF</p>
       </td>
     </tr>
     <tr>
       <td style="background-color: #E1D5E7; padding: 10px; text-align: center; border: 1pt solid black; vertical-align: middle;">
         <p style="font-weight: bold; margin: 0; font-size: 11pt; font-family: 'Times New Roman', serif; color: black !important;">MATA PELAJARAN : [MAPEL DALAM CAPITAL]</p>
       </td>
     </tr>
   </table>

BAGIAN 2 — IDENTITAS (TANPA JUDUL):
- Gunakan tabel borderless (border="0"):
  <table border="0" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border: none; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
    <tr>
      <td style="width: 160px; font-weight: bold; padding: 4px 0;">Mata Pelajaran</td>
      <td style="width: 20px;">:</td>
      <td>[Mapel]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Kelas / Semester</td>
      <td>:</td>
      <td>[Kelas] / [Semester]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Kurikulum</td>
      <td>:</td>
      <td>[Kurikulum dari Konteks atau Kurikulum Merdeka]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 4px 0;">Alokasi Waktu</td>
      <td>:</td>
      <td>.................... Menit</td>
    </tr>
  </table>

BAGIAN 3 — REKAPITULASI JUMLAH SOAL (OPSIONAL):
- Tampilkan ringkasan jumlah soal berdasarkan tipe (PG, PG Kompleks, Uraian) jika datanya tersedia.

BAGIAN 4 — TABEL UTAMA KISI-KISI:
- Buat tabel utama dengan 9 kolom:
  1. No (4%)
  2. Capaian Pembelajaran (18%)
  3. Kompetensi (12%)
  4. Materi Pokok (12%)
  5. Indikator Soal (28%)
  6. Taksonomi (8%)
  7. Bentuk Soal (8%)
  8. Jumlah Soal (5%)
  9. Nomor Soal (5%)
- Header Tabel: background-color: #E1D5E7; font-weight: bold; text-align: center; border: 1px solid black; padding: 10px 5px;

=== KETENTUAN ISI TABEL (WAJIB) ===
1. **Indikator Soal**: Harus spesifik mengikuti format: "Disajikan [stimulus], siswa dapat [kata kerja operasional] [materi] dengan tepat."
2. **Taksonomi**: Gunakan level kognitif (C2, C3, atau C4) sesuai standar.
3. **Kompetensi**: Jabarkan kemampuan spesifik yang diuji (misal: Menganalisis, Menyebutkan).
4. **Bentuk Soal**: Gunakan singkatan PG, PGK, atau Uraian.
5. **Materi Pokok**: Tuliskan dalam format **Bold & Italic** (Tanpa highlight kuning).
6. **Penomoran**: Lanjutkan nomor soal secara kontinu.

${additionalRules}
${SHARED_RULES}`,
  };

  // ── MATCHING LOGIC ──
  const isType = (t: string) => type.includes(t) || t.includes(type);

  let finalPrompt = "";
  if (isType("Program Semester") || isType("PROSEM")) finalPrompt = prompts["PROSEM"];
  else if (isType("Program Tahunan") || isType("PROTA")) finalPrompt = prompts["PROTA"];
  else if (isType("KKTP")) finalPrompt = prompts["KKTP"];
  else if (isType("Capaian Pembelajaran") || type === "CP") finalPrompt = prompts["CP"];
  else if (isType("LKPD")) finalPrompt = prompts["LKPD"];
  else if (isType("KISI-KISI") || isType("Desain Evaluasi")) finalPrompt = prompts["KISI-KISI"];
  else finalPrompt = prompts["ATP"];

  return finalPrompt;
}

function extractTitle(type: string, rawPrompt: string): string {
  const parts = rawPrompt.split(" _||_ ").map(p => p.trim());
  
  let mapel = "";
  let kelas = "";

  const getAnswerById = (id: string) => {
    const part = parts.find(p => p.startsWith(`${id}.`));
    if (!part) return "";
    const split = part.split(":");
    return split[split.length - 1].trim();
  };

  mapel = getAnswerById("1001") || getAnswerById("2001");
  kelas = getAnswerById("1002");

  if (!mapel) {
    const mp = parts.find(p => p.toLowerCase().includes("mata pelajaran") || p.toLowerCase().includes("mapel"));
    if (mp) mapel = mp.split(":").pop()?.trim() || "";
  }
  if (!kelas) {
    const kp = parts.find(p => p.toLowerCase().includes("kelas"));
    if (kp) kelas = kp.split(":").pop()?.trim() || "";
  }

  const clean = (text: string) => {
    return text
      .replace(/\(isi manual\)/gi, "")
      .replace(/Buatkan dokumen LKPD LENGKAP/gi, "")
      .replace(/^(?:apa yang ingin Anda rancang\?|rancangan|masukkan|tuliskan|mapel|mata pelajaran|kelas|fase|lewati|isi manual|buatkan|dokumen|lengkap)\s*/i, "")
      .replace(/[?:]/g, "")
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      .trim();
  };

  mapel = clean(mapel);
  kelas = clean(kelas);
  const materi = clean(getAnswerById("2001"));

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

  let displayType = type;
  if (type.includes("KISI-KISI") || type.includes("Desain Evaluasi")) {
    displayType = "ASESMEN";
  }

  let title = `${displayType} - Kelas ${finalKelas} - Mapel ${finalMapel}`;
  if (finalMateri) title += ` - ${finalMateri}`;
  
  return title;
}

function cleanAIOutput(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code blocks wrapping
  cleaned = cleaned.replace(/^```html\s*/, "").replace(/```\s*$/, "");
  cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  
  // Remove any preamble text before the first HTML tag
  if (!cleaned.startsWith("<")) {
    const firstTag = cleaned.indexOf("<div");
    const firstTable = cleaned.indexOf("<table");
    const firstP = cleaned.indexOf("<p");
    
    // Find the earliest HTML tag
    const positions = [firstTag, firstTable, firstP].filter(p => p !== -1);
    if (positions.length > 0) {
      cleaned = cleaned.substring(Math.min(...positions));
    }
  }
  
  // Remove trailing conversational text after the last closing tag
  const lastDivClose = cleaned.lastIndexOf("</div>");
  const lastTableClose = cleaned.lastIndexOf("</table>");
  const lastPos = Math.max(lastDivClose, lastTableClose);
  
  if (lastPos !== -1) {
    const closeTagLen = lastDivClose > lastTableClose ? 6 : 8; // length of </div> vs </table>
    const afterHtml = cleaned.substring(lastPos + closeTagLen).trim();
    // If there's significant non-HTML text after the last tag, remove it
    if (afterHtml.length > 10 && !afterHtml.startsWith("<")) {
      cleaned = cleaned.substring(0, lastPos + closeTagLen);
    }
  }
  
  return cleaned;
}

// Check if a generated document is structurally complete
// A complete curriculum document MUST have a signature section at the end
function isDocumentStructurallyComplete(content: string): boolean {
  if (!content || content.length < 500) return false;
  const trimmed = content.trim();
  const hasProperEnding = trimmed.endsWith('</table>') || trimmed.endsWith('</div>');
  return hasProperEnding;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const { rawPrompt, type, model: requestedModel = "deepseek", rawContext, messages = [], isAssistant = false } = body;

    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          let systemPrompt = "";
          let chatMessages: {role: 'system' | 'user' | 'assistant', content: string}[] = [];
          let willEditDocument = false;
          let isMajorMismatch = false;

          if (isAssistant) {
            const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            // === INTELLIGENT INTENT DETECTION (Manual Override) ===
            const mode = body.mode || 'chat';
            const isContinue = body.isContinue || false;
            // Force edit routing if continuing, so output goes to document chunk, not chat
            willEditDocument = mode === 'edit' || isContinue;
            isMajorMismatch = false;

            // === WEB SEARCH GROUNDING ===
            let webSearchContext = "";
            // FORCE: Skip search entirely if mode is 'edit' or it's a continuation
            if (mode === 'chat' && needsWebSearch(rawPrompt) && !isContinue) {
              send({ type: "chat", text: "🔍 *Mencari informasi terbaru untuk menjawab pertanyaan Anda...*\n\n" });
              try {
                const searchResults = await performWebSearch(rawPrompt);
                webSearchContext = formatSearchContext(searchResults);
              } catch (err) {
                console.error("[Web Search] Failed:", err);
                webSearchContext = "[Web Search gagal.]";
              }
            }

            // === SMART CONTINUATION CONTEXT PROCESSING ===
            let continuationBlock = "";
            if (isContinue) {
              const fullDoc = rawContext || rawPrompt;
              let structuralAnalysis = "";
              let smartContext = fullDoc;
              
              let columnCount = 0;
              if (fullDoc && fullDoc.length > 0) {
                const babMatches = [...fullDoc.matchAll(/BAB\s+[\dIVXivx]+\s*[:\s]*([^<\n]{3,60})/gi)];
                const lastBab = babMatches.length > 0 ? babMatches[babMatches.length - 1][0].trim() : "tidak terdeteksi";
                
                // Extract ALL header rows to understand table structure
                const allHeaderRows = fullDoc.match(/<tr[^>]*>(?:\s*<t[hd][^>]*>[\s\S]*?<\/t[hd]>\s*)+<\/tr>/gi) || [];
                let headerColumnNames: string[] = [];
                
                // Calculate total columns accounting for colspan
                if (allHeaderRows.length > 0) {
                  // Use first header row to count total columns (with colspan)
                  const firstRow = allHeaderRows[0];
                  const cellsInRow = [...firstRow.matchAll(/<t[hd][^>]*(?:colspan="(\d+)")?[^>]*>([\s\S]*?)<\/t[hd]>/gi)];
                  for (const cell of cellsInRow) {
                    const colspan = cell[1] ? parseInt(cell[1]) : 1;
                    columnCount += colspan;
                    // Extract text content for column name
                    const textContent = cell[2].replace(/<[^>]+>/g, '').trim();
                    if (textContent) headerColumnNames.push(textContent);
                  }
                }
                
                // Fallback: check colspan hints
                const colspanMatches = [...fullDoc.matchAll(/colspan="(\d+)"/gi)];
                const maxColspan = colspanMatches.length > 0 ? Math.max(...colspanMatches.map((m: any) => parseInt(m[1]))) : 0;
                if (maxColspan > columnCount) columnCount = maxColspan;
                
                // Extract month headers specifically for PROSEM
                let monthHeaders = "";
                if (type === 'PROSEM') {
                  const monthMatches = fullDoc.match(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/gi) || [];
                  const uniqueMonths = [...new Set(monthMatches.map((m: any) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()))];
                  if (uniqueMonths.length > 0) {
                    monthHeaders = `\n- Bulan yang ada di header: ${uniqueMonths.join(', ')}`;
                  }
                }
                
                const tail100 = fullDoc.trim().slice(-100);
                const hasOpenTag = /<[^/][^>]*$/.test(tail100);
                
                const lastTableMatch = fullDoc.match(/<table[\s\S]*$/i);
                const rowCount = lastTableMatch ? (lastTableMatch[0].match(/<tr/gi) || []).length : 0;
                
                structuralAnalysis = `ANALISIS STRUKTURAL OTOMATIS:
- Jenis Dokumen: ${type}
- Total karakter dokumen: ${fullDoc.length}
- BAB terdeteksi (${babMatches.length}): ${babMatches.map((m: any) => m[0].trim()).slice(-5).join(' | ') || 'tidak ada'}
- BAB terakhir: ${lastBab}
- Jumlah kolom tabel utama: ${columnCount || 'tidak terdeteksi'}
- Header kolom: ${headerColumnNames.slice(0, 10).join(' | ') || 'tidak terdeteksi'}${monthHeaders}
- Jumlah baris di tabel terakhir: ${rowCount}
- Ada tag HTML yang belum ditutup: ${hasOpenTag ? 'YA - TUTUP DULU!' : 'Tidak'}
- 100 karakter terakhir: """${tail100}"""`;

                if (fullDoc.length > 7000) {
                  const head = fullDoc.substring(0, 1500);
                  const tailDoc = fullDoc.substring(fullDoc.length - 5000);
                  smartContext = `${head}\n\n<!-- ... ${fullDoc.length - 6500} karakter konten tengah dipotong ... -->\n\n${tailDoc}`;
                }
              }
              
              const isAsesmen = type.includes("KISI-KISI") || type.includes("Desain Evaluasi");
              
              const layoutGuide = isAsesmen ? `
- LANJUTKAN TABEL ASESMEN:
  1. Hubungkan langsung ke baris terakhir (<tr>) dari tabel yang sudah ada. JANGAN membuat <table> baru.
  2. LANGSUNG buat baris baru (<tr>...</tr>).
  3. LANJUTKAN PENOMORAN: Jika nomor soal terakhir adalah X (lihat di dokumen draf), mulai baris baru dengan nomor soal X+1.
  4. Selesaikan hingga total soal mencapai target (misal: 20 soal).`
                : type === 'PROSEM' ? `- PROSEM: tabel LANDSCAPE dengan JUMLAH KOLOM TETAP sesuai header.
  - LIHAT "Jumlah kolom tabel utama" dan "Header kolom" di ANALISIS STRUKTURAL — ini adalah jumlah kolom FINAL.
  - Setiap baris <tr> WAJIB memiliki TEPAT ${columnCount || 33} <td> (atau colspan yang setara). TIDAK KURANG, TIDAK LEBIH.
  - DILARANG KERAS menambahkan kolom bulan baru yang TIDAK ADA di header tabel.
  - DILARANG KERAS mengubah struktur tabel atau menambah kolom baru. Hanya ISI BARIS BARU.
  - Font 8-9pt. Separator BAB: colspan sesuai total kolom, bg #ADD8E6.
  - Biarkan kolom minggu KOSONG sepenuhnya (<td style="..."></td>).`
                : type === 'PROTA' ? `- PROTA: tabel LANDSCAPE 5 KOLOM. Setiap <tr> WAJIB 5 <td>. Header: bg #FCE4D6. Separator BAB: bg #ADD8E6, colspan="5". No RESET per BAB.`
                : type === 'ATP' ? `- ATP: tabel 5 KOLOM. Setiap <tr> WAJIB 5 <td>. Header: bg #FCE4D6. Separator BAB: bg #E7EFF6, colspan="5". No RESET per BAB.`
                : type === 'KKTP' ? `- KKTP: tabel 6 KOLOM. Setiap <tr> WAJIB 6 <td>. Header: bg #E1D5E7. Separator BAB: bg #F9CB9C, colspan="6". No RESET per BAB.`
                : type === 'LKPD' ? `- LKPD: Format soal numbered list, PG dengan <ol type="A">. Lanjutkan dari nomor soal terakhir.`
                : type === 'CP' ? `- CP: Format naratif <p> dengan text-align: justify. Lanjutkan fase/elemen yang belum selesai.`
                : `- Pertahankan format dan gaya yang sudah ada. Pastikan konsistensi kolom.`;

              continuationBlock = `
=== MODE: LANJUTKAN PENULISAN (DIRECT APPEND) ===
TUGAS ANDA: LANJUTKAN isi dokumen HTML yang terpotong. Output Anda akan LANGSUNG DITEMPELKAN ke akhir dokumen.

${structuralAnalysis}

DOKUMEN YANG SUDAH DITULIS (AWAL + AKHIR):
"""
${smartContext}
"""

ATURAN WAJIB KONTINUASI:
1. BACA ANALISIS STRUKTURAL di atas. Ini menunjukkan kondisi dokumen saat ini.
2. LIHAT "100 karakter terakhir" - ini titik PERSIS di mana Anda harus melanjutkan.
3. Jika ada tag HTML terbuka (misal: <tr> tanpa </tr>), TUTUP DULU tag tersebut sebelum menulis konten baru.
4. JANGAN gunakan format [SMART_PATCH] atau [PATCH_START]. 
5. JANGAN menulis ulang dari awal. LANGSUNG keluarkan lanjutan kode HTML.
6. JANGAN gunakan markdown code blocks ( \`\`\` ). LANGSUNG kode HTML.
7. JANGAN berikan penjelasan atau teks pembuka/penutup. Karakter pertama output HARUS berupa tag HTML.

${layoutGuide}
`;
            }

            systemPrompt = `Anda adalah Dekstorio AI Assistant — asisten cerdas premium untuk pendidik Indonesia.
WAKTU SAAT INI: ${currentDate}.

${webSearchContext ? `${webSearchContext}\n` : ""}
DOKUMEN SAAT INI DI EDITOR:
Jenis: ${type}
Konten: ${rawContext || "Kosong"}

${isContinue ? continuationBlock : isMajorMismatch ? `
=== PERINGATAN: MISMATCH KONTEKS (PENTING) ===
TUGAS ANDA: Peringatkan user di sidebar bahwa materi/tipe berbeda. JANGAN edit dokumen. 
` : willEditDocument ? `
=== MODE: REVISI DOKUMEN (SMART PARTIAL EDIT) ===
INSTRUKSI REVISI DARI USER: "${rawPrompt}"

TUGAS ANDA:
Pilih salah satu metode output berdasarkan kerumitan revisi:

1. JIKA REVISI MINOR (Ganti kata, tambah baris tabel, tambah kolom, perbarui informasi spesifik, perbaiki typo):
   - TUGAS ANDA: Gunakan format [SMART_PATCH] untuk melakukan revisi atau penambahan materi. JANGAN menulis ulang seluruh dokumen.
   - ATURAN [SMART_PATCH]:
     1. Gunakan [PATCH_START] SEARCH: <teks_lama> REPLACE: <teks_baru> [PATCH_END].
     2. SEARCH harus UNIK dan PERSIS sama dengan draf. Jika ingin menambah di akhir, SEARCH bagian akhir draf.
     3. JIKA SEARCH gagal ditemukan karena teks draf terlalu panjang, COBA gunakan satu paragraf atau satu baris unik saja sebagai SEARCH.
   - Anda boleh mengirimkan lebih dari satu [SMART_PATCH] jika ada beberapa titik yang diubah.
   - JANGAN berikan penjelasan apapun di luar blok ini.

2. JIKA REVISI MAJOR (Struktur berubah total, ganti tipe dokumen, atau revisi yang mencakup >50% dokumen):
   - Hasilkan kembali SELURUH kode HTML dari awal (Header Dokumen) sampai akhir.
   - Langsung mulai dengan <div>.
   - Tanpa markdown code blocks.

PENTING (KEDISIPLINAN OUTPUT):
- DILARANG KERAS menyertakan teks pembuka (seperti "Tentu", "Ini revisinya") atau teks penutup di dalam mode REVISI ini.
- Hasil output harus MURNI diawali dengan <div> (untuk Major) atau [SMART_PATCH_START] (untuk Minor).
- Jika Anda menulis teks biasa, itu akan merusak dokumen user.

PENTING (STRUKTURAL AWARENESS): 
- JIKA REVISI MINOR: Anda HANYA BOLEH mengeluarkan format [PATCH_START] ... [PATCH_END].
- DILARANG menulis ulang header dokumen atau teks apapun di luar tag tersebut.
- SEARCH: Ambil potongan teks unik (seperti judul).
- REPLACE: Konten baru (termasuk KOP jika diminta).
- PILIHAN GANDA: Selalu gunakan <ul> atau <ol> untuk opsi A, B, C, D agar perataan teks di Word tetap rapi (rata kiri).
` : `
=== MODE: CHAT ASISTEN (AKTIF) ===
TUGAS ANDA:
1. Jawab dengan ramah menggunakan Markdown di sidebar.
2. Gunakan konteks dokumen hanya sebagai referensi jawaban.
3. DILARANG menghasilkan kode HTML dokumen lengkap di sini.
`}

=== ATURAN OTAK AI ===
- Prioritas: Web Search (jika ada) > Konteks Dokumen > Pengetahuan Bawaan.
- Anti-Halusinasi: Jika benar-benar tidak tahu, jangan mengarang.
- Sopan dan profesional.`;

            chatMessages = [
              ...messages.map((m: any) => ({
                role: m.role === "ai" ? "assistant" as const : "user" as const,
                content: m.text
              })).filter((m: any) => m.content && m.content.trim().length > 0),
              { role: "user", content: rawPrompt }
            ];
          } else {
            systemPrompt = buildSystemPrompt(type, rawPrompt);
            chatMessages = [{ role: "system", content: systemPrompt }];
          }

          send({ type: "stage", stage: 0, label: isAssistant ? "Menganalisis Permintaan..." : "Menganalisis Konteks..." });

          const attemptDeepSeek = async () => {
             const dsMessages = isAssistant 
              ? [{ role: "system", content: systemPrompt }, ...chatMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))]
              : [{ role: "system", content: systemPrompt }];

             const completion = await deepseek.chat.completions.create({
                messages: dsMessages as any,
                model: "deepseek-chat",
                stream: true,
                temperature: isAssistant ? 0.7 : 0.4,
             });
             let lastFinishReason = "";
             for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || "";
                lastFinishReason = (chunk as any).choices[0]?.finish_reason || "";
                if (text) { 
                  fullText += text; 
                  const finalType = (isAssistant && willEditDocument && !isMajorMismatch) ? "chunk" : (isAssistant ? "chat" : "chunk");
                  send({ type: finalType, text }); 
                }
             }
             if (lastFinishReason === "length") {
               send({ type: "status", isCutOff: true });
             } else if (!isAssistant && !isDocumentStructurallyComplete(fullText)) {
               // AI stopped but document is incomplete (no signature section)
               send({ type: "status", isCutOff: true });
             }
             return true;
          };

          const attemptGemini = async (modelName: string) => {
             const model = genAI.getGenerativeModel({ model: modelName });
             
             if (isAssistant) {
               const geminiHistory: any[] = [];
               let lastRole = "";
               const historyToProcess = chatMessages.slice(0, -1).slice(-5);
               
               for (const m of historyToProcess) {
                 const role = m.role === "assistant" ? "model" : "user";
                 if (role !== lastRole) {
                   geminiHistory.push({ role, parts: [{ text: m.content }] });
                   lastRole = role;
                 }
               }
               
               const chat = model.startChat({
                 history: geminiHistory,
                 systemInstruction: systemPrompt,
                 generationConfig: { temperature: 0.7 }
               });
               
               const userPrompt = chatMessages[chatMessages.length - 1].content;
               
               if (willEditDocument && !isMajorMismatch) {
                 send({ type: "chat", text: "✍️ *Sedang melakukan revisi pada dokumen Anda...*\n\n" });
               }

                const result = await chat.sendMessageStream(userPrompt);
                for await (const chunk of result.stream) {
                  const text = chunk.text();
                  if (text) { 
                    fullText += text; 
                    const finalType = (willEditDocument && !isMajorMismatch) ? "chunk" : "chat";
                    send({ type: finalType, text }); 
                  }
                }
                 try {
                   const finalResp = await result.response;
                   const reason = finalResp.candidates?.[0]?.finishReason as string;
                   if (reason === "LENGTH" || reason === "MAX_TOKENS" || !isDocumentStructurallyComplete(fullText)) {
                     send({ type: "status", isCutOff: true });
                   }
                 } catch (e) { console.error("Gemini sync err:", e); }
             } else {
               const result = await model.generateContentStream(systemPrompt + "\n\nUser Instructions: " + rawPrompt);
               for await (const chunk of result.stream) {
                 const text = chunk.text();
                 if (text) { fullText += text; send({ type: "chunk", text }); }
               }
               if (!isDocumentStructurallyComplete(fullText)) {
                 send({ type: "status", isCutOff: true });
               }
             }
             return true;
          };

          let finalProvider = requestedModel === "deepseek" ? "DeepSeek V3" : "Gemini 1.5 Flash";
          
          try {
             send({ type: "stage", stage: 1, label: `${isAssistant ? 'Membalas Chat' : 'Menyusun Konten'} dengan ${finalProvider}...` });
             if (requestedModel === "deepseek") await attemptDeepSeek();
             else await attemptGemini("gemini-1.5-flash-latest");
          } catch (e: any) {
             console.error("Primary model failed:", e.message);
             fullText = "";
             try {
                finalProvider = "Gemini 1.5 Flash (Fallback)";
                send({ type: "stage", stage: 2, label: "Mencoba Jalur Alternatif..." });
                await attemptGemini("gemini-1.5-flash-latest");
             } catch (e2) {
                console.error("Secondary fallback failed...");
                send({ type: "error", message: "Sistem AI sedang sibuk. Silakan coba lagi." });
             }
          }

          if (fullText) {
             if (!isAssistant) {
               send({ type: "stage", stage: 3, label: "Finalisasi..." });
               const cleaned = cleanAIOutput(fullText);
               const [newDoc] = await db.insert(documents).values({
                 title: extractTitle(type, rawContext || rawPrompt),
                 type: type,
                 content: cleaned,
                 userId: session.user.id,
                 status: "Selesai",
                 size: `${(cleaned.length / 1024).toFixed(1)} KB`,
               }).returning();
               send({ type: "done", docId: newDoc.id, title: newDoc.title, provider: finalProvider });
             } else {
               send({ type: "done", provider: finalProvider });
             }
          } else {
             send({ type: "error", message: "Gagal memproses permintaan AI." });
          }
          controller.close();
        } catch (error: any) {
          console.error("Stream error root:", error);
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Error" }), { status: 500 });
  }
}