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

// ── KOP SURAT TEMPLATE ──
const KOP_TEMPLATE = `
=== TEMPLATE KOP SURAT (WAJIB DI AWAL DOKUMEN) ===
Buat KOP menggunakan <table> tanpa border (border:none) dengan layout:
- Baris 1: Logo Sekolah (placeholder) | Nama Instansi (PEMERINTAH KABUPATEN/KOTA ..., DINAS PENDIDIKAN, NAMA SEKOLAH)
- Di bawah KOP: garis horizontal tebal (border-bottom: 3px double black)
- Alamat sekolah, telp, dan kode pos (jika diketahui dari konteks)
Jika NAMA SEKOLAH tidak diketahui, tulis "[Nama Sekolah]" sebagai placeholder.
Setelah KOP, tuliskan judul dokumen di tengah (centered, bold, font-size 14pt).
`;

// ── TANDA TANGAN TEMPLATE ──
const SIGNATURE_TEMPLATE = `
=== TEMPLATE TANDA TANGAN (WAJIB DI AKHIR DOKUMEN) ===
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
8. Narasi dan paragraf WAJIB text-align: justify.
9. Heading/judul pada tengah dokumen WAJIB text-align: center; font-weight: bold.
10. DILARANG menggunakan CSS class — gunakan INLINE STYLE saja untuk kompatibilitas export .doc.

=== ANTI-HALLUCINATION RULES ===
1. JANGAN mengarang regulasi atau nomor SK yang tidak ada. Jika tidak tahu, tulis "[Nomor Regulasi]".
2. JANGAN mengarang nama sekolah, guru, atau data yang tidak diberikan user. Gunakan placeholder "[...]".
3. Jika user memberikan daftar BAB/materi, gunakan PERSIS sesuai yang diberikan. JANGAN menambah atau mengarang BAB baru.
4. Alokasi JP harus logis dan konsisten. Total JP di tabel harus sesuai dengan yang dinyatakan user.

${KOP_TEMPLATE}
${SIGNATURE_TEMPLATE}`;

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
4. PILIHAN GANDA (A, B, C, D): Setiap soal pilihan ganda WAJIB memiliki opsi dengan format:
   A. [Opsi]
   B. [Opsi]
   C. [Opsi]
   D. [Opsi]
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
    "ATP": `Anda adalah PAKAR KONSULTAN KURIKULUM MERDEKA SENIOR dengan pengalaman 20 tahun.
Tugas Anda: Menyusun dokumen Alur Tujuan Pembelajaran (ATP) yang KOMPREHENSIF, PROFESIONAL, dan SIAP PAKAI oleh guru.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== STRUKTUR DOKUMEN ATP (WAJIB BERURUTAN) ===

BAGIAN 1 — KOP & IDENTITAS DOKUMEN:
- KOP Surat sekolah (gunakan template standar).
- Judul: "ALUR TUJUAN PEMBELAJARAN (ATP)" — centered, bold, 14pt.
- Tabel identitas (tanpa border): Satuan Pendidikan, Mata Pelajaran, Kelas/Semester, Fase, Tahun Pelajaran.

BAGIAN 2 — ANALISIS CAPAIAN PEMBELAJARAN (CP):
- Sub-judul: "A. Capaian Pembelajaran (CP) Berdasarkan SK BSKAP No. 046/H/KR/2025"
- Uraikan CP secara NARATIF dan MENDALAM minimal 300-400 kata.
- Pisahkan per elemen (misalnya: Pemahaman, Keterampilan Proses, Literasi, dst sesuai mapel).
- Kutip atau parafrasakan CP resmi sesuai fase yang diminta.

BAGIAN 3 — PEMETAAN MATERI:
- Sub-judul: "B. Pemetaan Materi Pembelajaran"
- Jabarkan urutan materi secara LOGIS dari prerequisite (mudah) ke kompleks (sulit).
- Jelaskan rasionalitas mengapa urutan ini dipilih (1-2 kalimat per materi).

BAGIAN 4 — TABEL ATP DETAIL:
- Sub-judul: "C. Tabel Alur Tujuan Pembelajaran"
- Buat tabel dengan kolom:
  | No | Tujuan Pembelajaran (gunakan KKO Bloom yang variatif: Menganalisis, Mengevaluasi, Mengkreasikan, dll) | <span style="background-color: yellow;">Materi Pokok</span> | Dimensi P3 (Profil Pelajar Pancasila) | Alokasi JP |
- Jabarkan minimal 8-12 TP untuk setahun, atau 4-6 TP per semester.
- Setiap TP harus SPESIFIK dan TERUKUR, bukan generik.
- Materi Pokok WAJIB di-highlight kuning.

BAGIAN 5 — GLOSARIUM:
- Definisi istilah-istilah kunci dalam dokumen.

BAGIAN 6 — TANDA TANGAN:
- Gunakan template tanda tangan standar.

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

BAGIAN 1 — KOP FORMAL:
- Buat header dengan border box yang berisi:
  | Logo Sekolah | LEMBAR KERJA PESERTA DIDIK (LKPD) |
  |              | Mata Pelajaran: ...                 |
  |              | Satuan Pendidikan: ...              |
  |              | Tahun Pelajaran: ...                |

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
- Pilihan Ganda: format A. B. C. D. (4 opsi). Soal harus variatif level LOTS-HOTS.
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
    "CP": `Anda adalah STAF AHLI BADAN STANDAR KURIKULUM DAN ASESMEN PENDIDIKAN (BSKAP) Kemendikbudristek.
Tugas Anda: Menjabarkan Capaian Pembelajaran (CP) berdasarkan regulasi resmi menjadi instrumen yang SIAP PAKAI oleh guru.

KONTEKS DATA GURU:
${rawPrompt}

${langRule}

=== STRUKTUR DOKUMEN CP (WAJIB BERURUTAN) ===

BAGIAN 1 — KOP & IDENTITAS:
- KOP Surat sekolah.
- Judul: "CAPAIAN PEMBELAJARAN (CP)" — centered, bold, 14pt.
- Sub-judul: "Berdasarkan Keputusan BSKAP No. 046/H/KR/2025"
- Tabel identitas: Satuan Pendidikan, Mata Pelajaran, Fase, Kelas.

BAGIAN 2 — RASIONALITAS (A):
- Sub-judul: "A. Rasionalitas"
- Uraikan MENGAPA mata pelajaran ini penting bagi peserta didik secara MENDALAM.
- Jumlah minimal: 400-500 kata.
- Bahas aspek: relevansi kontekstual, keterkaitan dengan kebutuhan abad 21, hubungan dengan Profil Pelajar Pancasila.
- Jika ada visi/misi sekolah dari konteks, integrasikan di sini.

BAGIAN 3 — TUJUAN MATA PELAJARAN (B):
- Sub-judul: "B. Tujuan Mata Pelajaran"
- Daftar kompetensi yang diharapkan tercapai setelah mempelajari mapel ini.
- Gunakan format numbered list dengan KKO (Kata Kerja Operasional) yang spesifik.

BAGIAN 4 — KARAKTERISTIK MATA PELAJARAN (C):
- Sub-judul: "C. Karakteristik Mata Pelajaran"
- Jelaskan elemen-elemen pembentuk mata pelajaran ini.
- Deskripsikan pendekatan pembelajaran yang khas (inquiry, PBL, dll).

BAGIAN 5 — CAPAIAN PEMBELAJARAN PER ELEMEN (D):
- Sub-judul: "D. Capaian Pembelajaran Per Elemen"
- Buat TABEL DETAIL dengan kolom:
  | No | Elemen | Capaian Pembelajaran (Narasi CP Resmi) | Indikator Ketercapaian (Uraian Detail) |
- Setiap elemen harus dijabarkan dengan indikator yang TERUKUR dan OBSERVABLE.
- Minimal 3-5 indikator per elemen.

BAGIAN 6 — TANDA TANGAN:
- Gunakan template tanda tangan standar.

${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // PROTA (Program Tahunan)
    // ──────────────────────────────────────
    "PROTA": `Anda adalah WAKIL KEPALA SEKOLAH BIDANG KURIKULUM yang sangat detail dan presisi.
Tugas Anda: Menyusun Program Tahunan (PROTA) yang PROFESIONAL, LENGKAP, dan sesuai Regulasi BSKAP 046/2025.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN PROTA (WAJIB BERURUTAN & PRESISI) ===

BAGIAN 1 — JUDUL & IDENTITAS:
- Judul: "PROGRAM TAHUNAN (PROTA)" — centered, bold, 14pt, background: #f0f0f0.
- Sub-judul: Nama mata pelajaran (centered, bold, underline, 12pt).
- Tabel Identitas (tanpa border, rata kiri):
  Nama Sekolah      : [dari konteks atau placeholder]
  Mata Pelajaran    : [dari konteks]
  Kelas / Semester  : [dari konteks] / Ganjil & Genap
  Tahun Pelajaran   : [dari konteks atau tahun berjalan]

BAGIAN 2 — CAPAIAN PEMBELAJARAN (BAGIAN A):
- Header section: "A. CAPAIAN PEMBELAJARAN (CP) — SK BSKAP No. 046/H/KR/2025" (background: #f0f0f0, bold).
- Teks Pengantar: "Pada akhir Fase [X], peserta didik memiliki kemampuan sebagai berikut:"
- Jabarkan CP per ELEMEN dengan penomoran:
  1. [Nama Elemen 1 — misal: Pemahaman]: Narasi CP lengkap untuk elemen ini.
  2. [Nama Elemen 2 — misal: Keterampilan Proses]: Narasi CP lengkap.
     Poin-poin detail: Mengamati, Mempertanyakan, Merencanakan, Memproses, Menganalisis, Menyimpulkan, Mengkomunikasikan.
- SETIAP elemen harus dijabarkan MENDALAM, bukan hanya 1 kalimat.

BAGIAN 3 — TABEL PROGRAM TAHUNAN (BAGIAN B):
- Header section: "B. PROGRAM TAHUNAN" (background: #f0f0f0, bold).
- Buat TABEL dengan kolom:
  | No | Alur Tujuan Pembelajaran (ATP) | <span style="background-color: yellow;">Materi</span> | Alokasi Waktu (JP) | Semester |
- ATURAN ISI TABEL:
  a. Kolom ATP: WAJIB berisi kalimat aksi lengkap menggunakan KKO Bloom.
     Contoh: "Melalui pengamatan dan diskusi, peserta didik dapat menganalisis struktur dan fungsi sel pada makhluk hidup."
  b. Kolom Materi: WAJIB di-highlight kuning (<span style="background-color: yellow;">Materi</span>).
  c. Kolom Alokasi Waktu: harus LOGIS (2 JP, 4 JP, 6 JP, 8 JP). Total harus sesuai dengan total JP yang diberikan user.
  d. Kolom Semester: "I (Ganjil)" atau "II (Genap)".
  e. Jika user memberikan daftar BAB, gunakan PERSIS BAB tersebut. Jangan mengarang BAB baru.
  f. Baris TERAKHIR tabel: gabungkan kolom 1-3 menjadi "TOTAL JAM PELAJARAN" dan isi total JP di kolom 4.

BAGIAN 4 — TANDA TANGAN:
- Gunakan template tanda tangan standar.
- Jika ada nama guru dari konteks, ISI di tempat tanda tangan Guru Mata Pelajaran.

${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // PROSEM (Program Semester)
    // ──────────────────────────────────────
    "PROSEM": `Anda adalah AHLI MANAJEMEN KEGIATAN BELAJAR MENGAJAR (KBM) yang sangat teliti dalam distribusi waktu.
Tugas Anda: Menyusun Program Semester (PROSEM) dengan distribusi MINGGUAN yang PRESISI dan sesuai kalender akademik.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN PROSEM (WAJIB BERURUTAN & PRESISI) ===

BAGIAN 1 — KOP & IDENTITAS:
- KOP Surat sekolah.
- Judul: "PROGRAM SEMESTER (PROSEM)" — centered, bold, 14pt.
- Tabel Identitas (tanpa border):
  Satuan Pendidikan, Mata Pelajaran, Kelas/Semester, Fase, Tahun Pelajaran.
  Alokasi JP per Minggu: [dari konteks].

BAGIAN 2 — TABEL DISTRIBUSI PROSEM:
Ini adalah INTI dokumen. Buat tabel LEBAR (landscape-style) dengan struktur:

KOLOM TABEL:
| No | Materi / ATP | JP | Bulan 1 (4-5 minggu) | Bulan 2 (4-5 minggu) | ... sampai Bulan 6 | Ket |

DETAIL KOLOM BULAN:
- Setiap kolom "Bulan" dipecah menjadi sub-kolom MINGGU (Mg 1, Mg 2, Mg 3, Mg 4, [Mg 5 jika ada]).
- Contoh header untuk Semester Ganjil:
  | No | Materi/ATP | JP | Juli (Mg1-Mg4) | Agustus (Mg1-Mg4) | September (Mg1-Mg4) | Oktober (Mg1-Mg5) | November (Mg1-Mg4) | Desember (Mg1-Mg4) | Ket |
- Contoh header untuk Semester Genap:
  | No | Materi/ATP | JP | Januari (Mg1-Mg4) | Februari (Mg1-Mg4) | Maret (Mg1-Mg5) | April (Mg1-Mg4) | Mei (Mg1-Mg4) | Juni (Mg1-Mg4) | Ket |

ISI TABEL:
- Tandai dengan "V" (atau "✓") pada sel minggu di mana materi tersebut diajarkan.
- Setiap materi harus menempati jumlah minggu yang KONSISTEN dengan alokasi JP-nya.
  Rumus: Jumlah Minggu = JP Materi ÷ JP per Minggu.
- Baris khusus (TANPA nomor, background #f0f0f0 atau bold):
  • STS (Sumatif Tengah Semester) — biasanya di pertengahan semester (sekitar minggu 8-9).
  • SAS (Sumatif Akhir Semester) — di minggu terakhir semester.
  • Libur — tandai pada kolom Ket atau beri warna berbeda.

BAGIAN 3 — CATATAN:
- Tuliskan catatan singkat:
  • Total minggu efektif: [hitung]
  • Total JP efektif: [hitung]
  • Minggu tidak efektif: [jika ada, misal libur nasional]

BAGIAN 4 — TANDA TANGAN:
- Gunakan template tanda tangan standar.

=== TIPS TEKNIS TABEL PROSEM ===
- Karena tabel sangat lebar, gunakan font-size: 8pt atau 9pt agar muat.
- Header minggu (Mg1, Mg2...) bisa dirotasi atau disingkat.
- Gunakan <th> untuk header dan <td> untuk data.
- Setiap sel minggu: width minimal 20px, text-align: center.

${additionalRules}
${SHARED_RULES}`,

    // ──────────────────────────────────────
    // KKTP (Kriteria Ketercapaian TP)
    // ──────────────────────────────────────
    "KKTP": `Anda adalah PAKAR EVALUASI & ASESMEN PENDIDIKAN dengan keahlian dalam penilaian formatif dan sumatif Kurikulum Merdeka.
Tugas Anda: Menyusun dokumen Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) yang KOMPREHENSIF dan OPERASIONAL.

KONTEKS DATA GURU:
${rawPrompt}

=== STRUKTUR DOKUMEN KKTP (WAJIB BERURUTAN) ===

BAGIAN 1 — KOP & IDENTITAS:
- KOP Surat sekolah.
- Judul: "KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)" — centered, bold, 14pt.
- Sub-judul: "Berdasarkan Kurikulum Merdeka — SK BSKAP No. 046/H/KR/2025"
- Tabel Identitas: Satuan Pendidikan, Mata Pelajaran, Kelas/Semester, Fase, Tahun Pelajaran.

BAGIAN 2 — PENDAHULUAN:
- Penjelasan singkat (150-200 kata) tentang apa itu KKTP dan mengapa penting.
- Sebutkan dasar hukum: Permendikbudristek tentang Standar Penilaian, SK BSKAP 046/2025.
- Ambang batas ketuntasan yang ditetapkan sekolah (jika ada dari konteks).

BAGIAN 3 — TABEL INTERVAL NILAI (A):
- Sub-judul: "A. Interval Konversi Nilai"
- Buat tabel:
  | Interval Nilai | Kategori | Predikat | Deskripsi Capaian |
  | 86 - 100       | Sangat Baik | A | Peserta didik menguasai seluruh TP dengan sangat baik... |
  | 66 - 85        | Baik        | B | Peserta didik menguasai sebagian besar TP... |
  | 41 - 65        | Cukup       | C | Peserta didik menguasai sebagian TP... |
  | 0 - 40         | Perlu Bimbingan | D | Peserta didik belum menguasai TP... |
- Deskripsi harus SPESIFIK sesuai mata pelajaran, bukan generik.

BAGIAN 4 — RUBRIK DESKRIPTIF PER TP (B):
- Sub-judul: "B. Rubrik Deskriptif Per Tujuan Pembelajaran"
- Untuk SETIAP Tujuan Pembelajaran (minimal 4-6 TP), buat tabel:
  | Tujuan Pembelajaran | Kriteria | Sangat Baik (A) | Baik (B) | Cukup (C) | Perlu Bimbingan (D) |
- Setiap kolom level harus berisi DESKRIPSI PERILAKU yang OBSERVABLE dan TERUKUR.
- Gunakan kata kerja yang bisa diamati: "mampu menjelaskan", "dapat menghitung", "mengidentifikasi dengan benar", dll.

BAGIAN 5 — TINDAK LANJUT (C):
- Sub-judul: "C. Rencana Tindak Lanjut"
- Buat tabel rekomendasi:
  | Kategori | Tindak Lanjut |
  | Sangat Baik | Program pengayaan, tutor sebaya, proyek lanjutan... |
  | Baik | Penguatan, latihan mandiri... |
  | Cukup | Remedial teaching, pendampingan kelompok kecil... |
  | Perlu Bimbingan | Remedial intensif, konsultasi orang tua, modifikasi pembelajaran... |

BAGIAN 6 — TANDA TANGAN:
- Gunakan template tanda tangan standar.

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

  let title = `${type} - Kelas ${finalKelas} - Mapel ${finalMapel}`;
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
            willEditDocument = mode === 'edit';
            isMajorMismatch = false; // Mismatch protection handled by manual mode choice now

            // If user is in EDIT mode but didn't provide enough context, 
            // the system prompt will guide the AI to handle it.

            // === WEB SEARCH GROUNDING ===
            let webSearchContext = "";
            // Only search in CHAT mode
            if (needsWebSearch(rawPrompt) && mode === 'chat') {
              send({ type: "chat", text: "🔍 *Mencari informasi terbaru untuk menjawab pertanyaan Anda...*\n\n" });
              try {
                const searchResults = await performWebSearch(rawPrompt);
                webSearchContext = formatSearchContext(searchResults);
              } catch (err) {
                console.error("[Web Search] Failed:", err);
                webSearchContext = "[Web Search gagal. Jawab berdasarkan pengetahuan terbaik Anda.]";
              }
            }

            systemPrompt = `Anda adalah Dekstorio AI Assistant — asisten cerdas premium untuk pendidik Indonesia.
WAKTU SAAT INI: ${currentDate}.

${webSearchContext ? `${webSearchContext}\n` : ""}
DOKUMEN SAAT INI DI EDITOR:
Jenis: ${type}
Konten: ${rawContext || "Kosong"}

${isMajorMismatch ? `
=== PERINGATAN: MISMATCH KONTEKS (PENTING) ===
User meminta revisi yang sangat berbeda dengan dokumen saat ini (misal: ganti mapel atau ganti jenis dokumen).
TUGAS ANDA:
1. JANGAN lakukan revisi dulu. 
2. Berikan PERINGATAN kepada user di Chat Sidebar bahwa ini akan menghapus data lama mereka.
3. Jelaskan apa perbedaannya (Contoh: "Anda meminta LKPD, tapi dokumen ini adalah Prosem").
4. Tanya konfirmasi: "Apakah Anda yakin ingin merombak total dokumen ini?"
` : willEditDocument ? `
=== MODE: REVISI DOKUMEN (AKTIF) ===
User meminta Anda untuk MEMPERBAIKI/MENGUBAH dokumen yang sedang terbuka.
TUGAS ANDA:
1. Identifikasi bagian mana yang harus diubah berdasarkan instruksi: "${rawPrompt}".
2. HASILKAN ULANG KESELURUHAN DOKUMEN HTML (Full Document) yang sudah diperbaiki.
3. Tetap gunakan struktur KOP SURAT dan TANDA TANGAN yang resmi jika ada.
4. JANGAN menyertakan penjelasan "Ini adalah perbaikan..." di dalam output HTML.
5. LANGSUNG MULAI DENGAN <div>. JANGAN gunakan markdown code blocks.
` : `
=== MODE: CHAT ASISTEN (AKTIF) ===
User bertanya tentang sesuatu atau ingin berdiskusi.
TUGAS ANDA:
1. Jawab dengan ramah menggunakan Markdown.
2. Gunakan konteks dokumen jika relevan untuk menjawab.
3. JANGAN menghasilkan kode HTML dokumen lengkap di sini.
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
             for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || "";
                if (text) { 
                  fullText += text; 
                  // Use standardized logic: update editor ONLY if it's a valid revision without mismatch
                  const finalType = (isAssistant && willEditDocument && !isMajorMismatch) ? "chunk" : (isAssistant ? "chat" : "chunk");
                  send({ type: finalType, text }); 
                }
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
             } else {
               const result = await model.generateContentStream(systemPrompt + "\n\nUser Instructions: " + rawPrompt);
               for await (const chunk of result.stream) {
                 const text = chunk.text();
                 if (text) { fullText += text; send({ type: "chunk", text }); }
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
               send({ type: "done", docId: newDoc.id, provider: finalProvider });
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