---
description: Aturan Baku "Otak AI" Deck Generator Launcher OS — Wajib dibaca sebelum mengubah generator presentasi/slide
---

# Aturan Baku Otak AI: Deck Generator (Launcher OS)

Dokumen ini mendefinisikan aturan dan spesifikasi standar bagaimana **Deck Generator** di Launcher OS memproses materi dan menyusun slide presentation berkualitas executive & premium secara **Fleksibel, Adaptif terhadap Konten, dan Kaya Teks (Content-First & Text-Rich)**.

---

## 1. Prinsip Utama: Content Elevation & Fleksibilitas Visual (Bukan Bagan Monoton)

1. **Intelligent Content Elevation (Diksi & Bobot Eksekutif)**:
   - DILARANG memotong materi berharga pengguna menjadi poin 1–2 kata yang kosong makna.
   - Angkat draft/catatan kasar pengguna menjadi bahasa eksekutif yang percaya diri, tajam, dan berwibawa (menggunakan kata kerja aktif dan struktur problem-solution yang jelas).
   - Pertahankan 100% fakta, istilah teknis, dan esensi materi pengguna.

2. **DILARANG Memaksakan Chart / Pie Chart**:
   - Bagan (Bar Chart, Area Chart) atau Pie/Donut Chart **HANYA** boleh dihasilkan jika materi pengguna secara eksplisit menyebutkan grafik atau memiliki data komparasi angka / persentase numerik nyata.
   - Jangan pernah menyuntikkan angka fiktif (seperti `56.2K`, `Q1-Q4`, `25%/48%/75%`) pada materi yang bersifat konseptual, edukasi, analisis, atau strategi!

3. **Storytelling Arc & Visual Pacing (Anti-Monoton)**:
   - **Slide 1 (Cover / Hook)**: `hero` atau `title` dengan headline otoritatif, badge kategori, dan executive summary description.
   - **Slide 2 (Context / Friction)**: `twoColumn` (Problem vs Solution, Current State vs Target State) atau `bullets` multi-card.
   - **Slide 3..N-1 (Core Framework / Architecture)**: Variasikan layout secara dinamis:
     - `process` / `chevronProcess`: Langkah bertahap, framework SOP, atau pilar strategis.
     - `flowDiagram` / `cycleLoop`: Arsitektur alur kerja atau siklus operasi.
     - `timeline` / `horizontalMilestones`: Roadmap bertahap dan checkpoint linimasa.
     - `tableComparison`: Matriks perbandingan fitur / opsi solusi.
     - `stats` / `splitMetric`: Metrik kuantitatif (hanya jika ada data angka nyata).
   - **Slide N (Impact / Call-to-Action)**: `boldStatement`, `boldImpact`, atau `cta` dengan latar `boldYellow` untuk penutup yang kuat.
   - *Aturan Anti-Monoton*: DILARANG mengulang layout yang sama lebih dari 2 kali berturut-turut dalam satu deck.

4. **Substansi Teks yang Utuh & Informatif (No Truncated Fluff)**:
   - Setiap slide wajib menyajikan teks yang berbobot:
     - `title`: Judul kuat dan spesifik (5–9 kata).
     - `subtitle`: Subjudul pengantar yang memperjelas konteks strategis.
     - `badge`: Tag konteks berhuruf kapital (misal: `STRATEGIC IMPERATIVE`, `OPERATIONAL BLUEPRINT`, `VALUE ARCHITECTURE`, `ACTION PLAN`).
     - `description`: Narasi penjelasan/insight lengkap (1–3 kalimat).
     - `bullets`: 2–4 poin analisis berbobot dengan format *"Konsep Kunci: Rincian penjelasan & dampaknya"*.

---

## 2. Fondasi Tipografi & Sistem Warna (Design System)

### A. Tipografi: SF Pro Display Hierarchy
- **Super Title / Hero Headline**: 32px – 48px (`font-black` / `font-extrabold`), `tracking-tight`, `leading-[1.1]`.
- **Section Title**: 24px – 32px (`font-extrabold`), `tracking-tight`.
- **Stat Metric**: 36px – 56px (`font-black`), `tracking-tight`.
- **Badges & Header Tags**: 10px – 11px (`font-bold`, uppercase), tracking lebar.
- **Body Description**: 12px – 14px (`font-normal` / `font-medium`), kontras tinggi (`neutral-900` atau `neutral-600` dark mode: `neutral-300`).
- **Footer**: 10px (`font-medium`), menampilkan `company.com` di kiri bawah dan nomor slide (`01/05`, `02/05`) di kanan bawah.

### B. Distribusi Background & Palet Warna
- **`white` (60–70% slide)**: Latar putih bersih (`#FFFFFF` / `dark:bg-neutral-950`) untuk slide konten, rincian, perbandingan, dan analisis.
- **`yellowGradient` (15–20% slide)**: Gradasi lembut dari kuning pucat ke putih untuk slide hero pembuka atau transisi fase.
- **`boldYellow` (15–20% slide)**: Warna kuning pekat vibrant (`#FFE500` / `#FFDE3C`) dengan teks hitam pekat (`#111111`) untuk Title Cover, Impact Statement, atau Call to Action penutup.

---

## 3. Format Masukan Standar (Standard Prompt Format .md)

### Format Markdown dengan Pembatas `-----`
Pemisah antar slide menggunakan tepat 5 strip `-----`. Setiap slide menggunakan tag terstruktur:

```markdown
#Headline: [Judul Utama Slide]
#Subheadline: [Subjudul / Konteks Singkat]
#Deskripsi: [Teks Penjelas / Narasi Lengkap]
#Bullet:
- [Poin analisis / langkah 1]
- [Poin analisis / langkah 2]
#Visual: [Key Insights | Two Column | Process | Timeline | Table | Hero | Bold Statement | Bar Chart (khusus data)]
#Stat: [Data angka opsional jika ada]

-----

#Headline: [Judul Slide Berikutnya]
...
```

---

## 4. Aturan Pemrosesan Otak AI (AI Processing Logic)

1. **Preservasi 1-to-1 & Deteksi Jumlah Slide**:
   - Jika pengguna memisahkan materi dengan $N$ blok `-----`, hasilkan **TEPAT $N$ SLIDE**.
   - Jika prompt menyebutkan secara eksplisit (misal *"Create a 5-slide..."*), AI wajib menghasilkan tepat 5 slide.
2. **Pemberian Identitas Visual Adaptif**:
   - Berikan `badge` (misal: `Executive Briefing`, `Strategic Outlook`, `Learning Module`) dan `category`.
   - Tentukan `bgStyle` berdasarkan ritme presentasi.
3. **Ekspor PPTX**:
   - Setiap layout slide memiliki representasi native shape di file `.pptx` (vector shapes, rounded cards, text boxes, and clean typography).

