---
description: Aturan Baku "Otak AI" Deck Generator Launcher OS — Wajib dibaca sebelum mengubah generator presentasi/slide
---

# Aturan Baku Otak AI: Deck Generator (Launcher OS)

Dokumen ini mendefinisikan aturan dan spesifikasi standar bagaimana **Deck Generator** di Launcher OS memproses materi dan menyusun slide presentation berkualitas executive, academic, & corporate consulting secara **Fleksibel, Adaptif terhadap Konten, dan Kaya Teks (Content-First & Text-Rich)**.

Aturan ini dirancang agar kompatibel 100% dan dapat dijalankan secara konsisten oleh model AI frontier manapun (**Anthropic Claude, DeepSeek, OpenAI GPT-4o, Google Gemini**).

---

## 1. Prinsip Utama: Content Elevation & Fleksibilitas Visual (Bukan Bagan Monoton)

1. **Intelligent Content Elevation (Diksi & Bobot Eksekutif)**:
   - DILARANG memotong materi berharga pengguna menjadi poin 1–2 kata yang kosong makna.
   - Angkat draft/catatan kasar pengguna menjadi bahasa eksekutif yang percaya diri, tajam, dan berwibawa (menggunakan kata kerja aktif dan struktur problem-solution yang jelas).
   - Pertahankan 100% fakta, istilah teknis, dan esensi materi pengguna.

2. **Action Titles (Kesimpulan Utama sebagai Judul)**:
   - **WAJIB** menulis judul sebagai **Action Title** — satu kalimat lengkap yang menyatakan kesimpulan/insight utama dari slide tersebut, BUKAN sekadar label topik.
     - ❌ *Dilarang:* "ITB Architecture", "Profitability Overview", "AI Governance"
     - ✅ *Wajib:* "Arsitektur Keputusan Berbasis AI Memangkas Waktu Validasi Hingga 60%"
   - Judul selalu **rata kiri** dan **TIDAK diakhiri tanda titik**.

3. **DILARANG Memaksakan Chart / Pie Chart Fiktif**:
   - Bagan (Bar Chart, Area Chart) atau Pie/Donut Chart **HANYA** boleh dihasilkan jika materi pengguna secara eksplisit menyebutkan grafik atau memiliki data komparasi angka / persentase numerik nyata.
   - Jangan pernah menyuntikkan angka fiktif (seperti `56.2K`, `Q1-Q4`, `25%/48%/75%`) pada materi yang bersifat konseptual, edukasi, analisis, atau strategi!
   - Gunakan placeholder transparan jika data belum tersedia: `[INSTRUCTOR TO CONFIRM]`, `[X]-minute`, `[__]%`.

4. **Executive Speaker Notes (Catatan Pembicara Terintegrasi)**:
   - Setiap slide yang digenerate **WAJIB menyertakan `speakerNotes`** (2–4 kalimat narasi verbal).
   - Catatan pembicara harus memuat:
     - Maksud dan tujuan pedagogis slide (*intent*).
     - Poin paling krusial yang harus disampaikan ke audiens.
     - Jebakan / miskonsepsi umum yang sering terjadi (*common student pitfalls*).
     - Durasi alokasi waktu dan instruksi fasilitator jika slide bersifat latihan/hands-on.

5. **Storytelling Arc & Visual Pacing (Anti-Monoton)**:
   - **Slide 1 (Cover / Hook)**: `hero` atau `title` dengan headline otoritatif, badge kategori, dan executive summary description.
   - **Slide 2 (Context / Friction)**: `twoColumn` (Problem vs Solution, Current State vs Target State) atau `bullets` multi-card.
   - **Slide 3..N-1 (Core Framework / Architecture)**: Variasikan layout secara dinamis:
     - `process` / `chevronProcess`: Langkah bertahap, framework SOP, atau pilar strategis.
     - `flowDiagram` / `cycleLoop`: Arsitektur alur kerja atau siklus operasi.
     - `timeline` / `horizontalMilestones`: Roadmap bertahap dan checkpoint linimasa.
     - `tableComparison`: Matriks perbandingan fitur / opsi solusi.
     - `stats` / `splitMetric`: Metrik kuantitatif (hanya jika ada data angka nyata).
   - **Slide N (Impact / Call-to-Action)**: `boldStatement`, `boldImpact`, atau `cta` untuk penutup yang kuat.
   - *Aturan Anti-Monoton*: DILARANG mengulang layout yang sama lebih dari 2 kali berturut-turut dalam satu deck.

---

## 2. Pilihan Gaya Institusi (Institutional Templates)

### A. Template ITB — Decision Leadership (RevoU × ITB)
- **Karakter:** Analitis, teknis, arsitektur keputusan, AI prompt engineering, dan kepemimpinan sistem.
- **Font:** **Red Hat Display** (Single font untuk seluruh elemen).
- **Palet Warna Baku:**
  - Primary: **Deep Blue** (`#005AAB`) — Untuk judul, kartu kesimpulan/aturan utama, header tabel.
  - Secondary: **Golden Yellow** (`#FFDD3C`) — Kartu pendamping setara, badge `HANDS-ON`, call-to-action.
  - Soft Notes: **Soft Yellow** (`#FFEC8E`) — Kotak catatan khusus (*Note Box*).
  - Backgrounds: Putih (`#FFFFFF`), Light Blue (`#EAF2FB`), Light Grey (`#F1F1F1`).
  - Text: Dark Slate (`#272525`).
- **Aturan Ritme:** Komponen bernomor atau bertahap menggunakan warna berselang-seling: **Kuning → Biru → Kuning**.
- **Komponen Khas:**
  - `Prompt Card`: Kartu khusus instruksi prompt AI dengan placeholder bold `[VARIABEL]`.
  - `Insight Bar`: Kartu biru dengan garis aksen kuning di sisi kiri tebal (14px).
  - Status dalam kata: `OK` / `Risk` / `Wrong`, bukan emoji dan bukan lampu warna saja.

### B. Template UI — Strategic Finance (RevoU × UI)
- **Karakter:** Keuangan korporat, board pack eksekutif, ketat, format investasi.
- **Font:** **Red Hat Display** / SF Pro.
- **Palet Warna Baku:**
  - Primary: **Kuning Makara** (`#FEDE3B` / `#FFC401`).
  - Panels: Hitam Pekat (`#000000`), Cream Fills (`#FFFADF`).
  - Text: Hitam (`#000000`) dan Dark Grey (`#3D3D3D`).
- **Konvensi Finansial:**
  - Angka negatif wajib di dalam kurung: `(1.2)`, dilarang `-1.2` atau warna merah.
  - Satuan dinyatakan di header (*"IDR Billion"*).
  - Strip *"So What:"* di bawah slide analitis.

### C. Template Launcher OS — Executive Core
- **Font:** SF Pro Display / Plus Jakarta Sans.
- **Palet Warna:** Kuning Vibrant (`#FFDE3C` / `#FFE500`) + Deep Obsidian (`#121212`) + White (`#FFFFFF`).

---

## 3. Format Masukan Standar (Standard Prompt Format .md)

Format pemisah antar slide menggunakan tepat 5 strip `-----`. Setiap slide menggunakan tag terstruktur:

```markdown
#Headline: [Action Title — Kalimat Kesimpulan Lengkap]
#Subheadline: [Subjudul / Konteks Strategis Singkat]
#Deskripsi: [Teks Penjelas / Narasi Lengkap 1-2 Kalimat]
#Notes: [Catatan Pembicara / Speaker Notes untuk Presenter View]
#Bullet:
- [Konsep Kunci 1: Rincian penjelasan dan dampaknya]
- [Konsep Kunci 2: Rincian penjelasan dan dampaknya]
#Visual: [Key Insights | Two Column | Process | Timeline | Table | Hero | Bold Statement | Prompt Card]
#Stat: [Data angka opsional jika ada]

-----

#Headline: [Judul Action Title Slide Berikutnya]
...
```

---

## 4. Universal AI Model Contract (Claude, DeepSeek, GPT, Gemini)

Untuk menjaga kompatibilitas mutlak antar model AI penyedia BYOK:
1. **JSON Only:** Semua output API wajib berupa array JSON valid tanpa backticks markdown.
2. **Schema Kontrak Slide:**
```typescript
interface SlideData {
  id: string;
  layout: string;
  title: string;          // Action Title (5-9 kata, no period)
  subtitle?: string;       // Strategic context
  description?: string;    // Thorough narrative
  badge?: string;          // Category badge (uppercase)
  bgStyle?: "white" | "yellowGradient" | "boldYellow";
  speakerNotes?: string;   // 2-4 sentences executive notes
  bullets?: string[];      // 2-4 substantive points
  processSteps?: Array<{ title: string; description: string }>;
  timelineMilestones?: Array<{ quarter: string; title: string; description: string }>;
  tableHeaders?: string[];
  tableRows?: Array<{ feature: string; current: string; proposed: string }>;
  promptBox?: { label: string; prompt: string };
  calloutBox?: { title?: string; text: string };
}
```
3. **Ekspor PPTX Berstandar OOXML:**
   - Menggunakan `isTextBox: true` untuk semua elemen teks.
   - Mengisi `slide.addNotes(slide.speakerNotes)` untuk catatan presenter.
   - Memetakan font ke **Red Hat Display** (tersedia lokal di sistem Launcher OS).
