# Panduan Baku Format Prompt Markdown Deck Generator (.md) — Launcher OS

Dokumen ini adalah **Panduan Universal & Fleksibel** untuk menyusun prompt dan outline presentasi di Deck Generator Launcher OS. Format ini mendukung berbagai jenis topik presentasi (Strategi Bisnis, Pitch Deck, Edukasi & Pelatihan, Metodologi/Proses, hingga Laporan Kinerja) tanpa memaksakan bagan atau pie chart jika tidak diperlukan.

---

## 1. Hirarki Tag Markdown (.md)

Deck Generator Launcher OS mengenali tag terstruktur berikut untuk memetakan konten ke kartu slide 16:9 secara presisi:

| Tag Markdown | Komponen Slide | Penjelasan & Tips |
|---|---|---|
| `#Headline:` | **Judul Utama Slide** | Wajib ada di setiap slide. Singkat, padat, dan kuat (5–9 kata). |
| `#Subheadline:` | **Subjudul / Konteks** | Kalimat pengantar ringkas untuk memperjelas konteks slide. |
| `#Deskripsi:` | **Narasi / Penjelasan / Insight** | Paragraf penjelasan (1–3 kalimat). Memberikan substansi teks yang kaya agar slide tidak kosong. |
| `#Bullet:` | **Poin Rincian / Solusi / Pilar** | Poin-poin penting (pisahkan dengan baris baru `- ` atau pipa `\|`). |
| `#Visual:` | **Rekomendasi Layout (Opsional)** | Menentukan tata letak visual yang sesuai dengan materi (lihat daftar di bawah). |
| `#Stat:` | **Data Angka / Metrik (Opsional)** | Hanya digunakan jika slide memiliki angka nyata (misal: `Pertumbuhan: +45% \| Retensi: 92%`). |
| `#Tabel:` | **Tabel Komparasi (Opsional)** | Perbandingan matriks fitur/opsi (misal: `Fitur \| Opsi A \| Opsi B`). |
| `-----` | **Pemisah Antar Slide** | Tepat 5 strip (`-----`) untuk memisahkan satu slide dengan slide berikutnya. |

---

## 2. Pilihan Layout Visual (#Visual:) Sesuai Jenis Konten

Pilih layout yang paling cocok dengan tipe pesan Anda. **Jangan paksakan chart jika materi adalah konsep/narasi!**

| Rekomendasi `#Visual:` | Kapan Digunakan? | Elemen yang Ditampilkan |
|---|---|---|
| `Title / Hero` | Slide pembuka / cover modul / presentasi utama | Judul besar, subjudul, badge kategori, dan rangkuman pengantar. |
| `Key Insights / Bullets` | Konsep, analisis, pilar strategi, rincian solusi | Kartu rincian dengan icon check, judul pilar, dan teks penjelasan. |
| `Two Column / Comparison` | Problem vs Solution, Sebelum vs Sesudah, 2 Pilar | 2 kolom seimbang kiri-kanan dengan kartu penjelasan. |
| `Process / Workflow` | Langkah bertahap (Langkah 1, 2, 3), SOP, framework | Kartu alur horizontal/vertikal bernomor urut dengan deskripsi. |
| `Roadmap / Timeline` | Rencana kuartal, milestone proyek, tahapan peluncuran | Garis linimasa fase (Phase 01, Phase 02, ...) dengan status. |
| `Comparison Table` | Matriks fitur, evaluasi opsi vs kompetitor | Tabel komparasi terstruktur dengan baris fitur. |
| `Metrics Grid / Key Stats` | Slide data angka & KPI pencapaian nyata | Kartu angka besar yang didukung deskripsi penjelasan konteks. |
| `Bar Chart Comparison` | **Hanya jika ada data perbandingan kuartal / volume** | Grafik batang perbandingan numerik + narasi insight takeaway. |
| `Pie / Donut Breakdown` | **Hanya jika ada data proporsi / porsi persentase** | Donut chart persentase segmen + narasi insight takeaway. |
| `Bold Statement / CTA` | Slide penutup, kesimpulan akhir, call-to-action | Background kontras tinggi (kuning/aksen), headline takeaway, dan tombol CTA. |

---

## 3. Contoh Template Prompt Siap Pakai

### A. Template 1: Strategi Bisnis & Solusi (Text-First, Fleksibel, Tanpa Bagan Monoton)

```markdown
#Headline: Transformasi Digital & Efisiensi Operasional 2025
#Subheadline: Peta Jalan Strategis Menuju Keunggulan Operasional dan Pertumbuhan Berkelanjutan
#Deskripsi: Inisiatif menyeluruh untuk mengintegrasikan otomatisasi sistem kerja modern, mempercepat kolaborasi lintas divisi, dan memaksimalkan nilai bagi klien.
#Visual: Title / Hero

-----

#Headline: Tantangan Utama & Hambatan Operasional
#Subheadline: Mengidentifikasi friksi dalam alur kerja konvensional saat ini
#Deskripsi: Analisis internal menemukan 3 bottleneck utama yang memperlambat kecepatan eksekusi dan meningkatkan biaya operasional.
#Bullet:
- Proses persetujuan manual yang memakan waktu rata-rata 5-7 hari kerja
- Fragmentasi data antar divisi yang menyebabkan duplikasi pekerjaan
- Kurangnya visibilitas metrik kerja secara real-time untuk pengambilan keputusan
#Visual: Key Insights / Bullets

-----

#Headline: Solusi Terpadu: Pendekatan Dua Pilar
#Subheadline: Perbandingan pendekatan lama versus arsitektur baru berbasis AI
#Deskripsi: Mengganti alur kerja terfragmentasi dengan sistem terpadu yang memangkas waktu proses hingga 70%.
#Bullet:
- Pilar 1: Otomatisasi Dokumen & Alur Kerja Mandiri
- Pilar 2: Pusat Data Terpadu & Dashboard Eksekutif Real-Time
#Visual: Two Column / Comparison

-----

#Headline: Tahapan Implementasi & Rollout 4 Fase
#Subheadline: Framework eksekusi bertahap untuk memastikan adopsi tanpa gangguan
#Deskripsi: Pendekatan sistematis 4 kuartal yang memastikan pelatihan tim dan migrasi data berjalan mulus.
#Bullet:
- Fase 1: Audit Sistem & Penyusunan Standar Operasional Baru
- Fase 2: Integrasi Platform Inti & Uji Coba Pilot Project
- Fase 3: Pelatihan Menyeluruh & Implementasi Skala Penuh
- Fase 4: Optimasi Berkelanjutan & Review Kinerja Triwulanan
#Visual: Process / Workflow

-----

#Headline: Komitmen Eksekusi & Langkah Selanjutnya
#Subheadline: Bersama membangun masa depan organisasi yang lebih tangkas dan produktif
#Deskripsi: Tim kepemimpinan siap memulai fase audit perdana minggu depan dengan target penyelesaian pilot project dalam 30 hari.
#Visual: Bold Statement / CTA
```

---

### B. Template 2: Modul Pelatihan & Konsep Edukasi (Framework & Learning Objectives)

```markdown
#Headline: Masterclass: Prinsip Dasar Desain Sistem Modern
#Subheadline: Memahami Fondasi, Pola Arsitektur, dan Standar Kualitas Industri
#Deskripsi: Modul pembelajaran interaktif yang dirancang untuk membekali praktisi dengan pemahaman menyeluruh tentang perancangan sistem yang skalabel.
#Visual: Title / Hero

-----

#Headline: 3 Pilar Utama Sistem yang Tangguh
#Subheadline: Prinsip dasar yang wajib dipenuhi sebelum masuk ke tahap deployment
#Deskripsi: Setiap sistem berkualitas tinggi harus dibangun di atas 3 pondasi fundamental berikut.
#Bullet:
- Keandalan (Reliability): Sistem tetap berfungsi optimal meskipun terjadi kegagalan parsial
- Skalabilitas (Scalability): Mampu menangani lonjakan beban kerja secara elastis
- Kemudahan Pemeliharaan (Maintainability): Struktur kode yang bersih dan dokumentasi yang jelas
#Visual: Key Insights / Bullets

-----

#Headline: Framework Kerja: Siklus 4 Langkah
#Subheadline: Metodologi kerja dari ideasi hingga rilis produksi
#Deskripsi: Praktik terbaik industri dalam mengeksekusi inisiatif teknologi dari awal hingga akhir.
#Bullet:
- Langkah 01: Analisis Kebutuhan & Pemetaan Risiko
- Langkah 02: Perancangan Arsitektur & Prototyping
- Langkah 03: Pengujian Otomatis & Penjaminan Mutu
- Langkah 04: Rilis Produksi & Pemantauan Performa
#Visual: Process / Workflow

-----

#Headline: Kesimpulan & Rencana Aksi Praktis
#Subheadline: Terapkan prinsip pembelajaran ini pada proyek Anda sekarang
#Deskripsi: Mulai dari audit sistem sederhana dan terapkan standardisasi arsitektur secara bertahap.
#Visual: Bold Statement / CTA
```

---

### C. Template 3: Laporan Kinerja & Data Keuangan (Hanya Ketika Ada Data Angka Nyata)

```markdown
#Headline: Laporan Kinerja Finansial & Pertumbuhan Q3
#Subheadline: Tinjauan Eksekutif Mengenai Pendapatan, Margin, dan Efisiensi Modal
#Deskripsi: Ringkasan komprehensif kinerja keuangan kuartal ketiga yang menunjukkan percepatan profitabilitas di seluruh lini bisnis.
#Visual: Title / Hero

-----

#Headline: Pertumbuhan Pendapatan Kuartalan 2024
#Subheadline: Pertumbuhan konsisten didorong oleh ekspansi segmen enterprise
#Stat: Q1: $1.20M | Q2: $1.45M | Q3: $1.78M | Q4 Target: $2.10M
#Deskripsi: Pendapatan meningkat 22.8% QoQ berkat penambahan kontrak korporasi baru dan efisiensi rantai pasok.
#Visual: Bar Chart Comparison

-----

#Headline: Kontribusi Pendapatan per Lini Bisnis
#Subheadline: Layanan enterprise menjadi mesin utama pendapatan berulang
#Stat: Solusi Enterprise: 45% | Produk Konsumen: 30% | Jasa Konsultasi: 15% | Lainnya: 10%
#Deskripsi: Diversifikasi produk melindungi kestabilan kas perusahaan dari fluktuasi musiman.
#Visual: Pie / Donut Breakdown

-----

#Headline: Prioritas Strategis Q4 & Target 2025
#Subheadline: Fokus utama untuk memaksimalkan pangsa pasar dan efisiensi modal
#Bullet:
- Memperluas jaringan kemitraan strategis di kawasan regional
- Meningkatkan retensi pelanggan melalui optimalisasi layanan purna jual
- Mempertahankan disiplin anggaran untuk menjaga margin laba operasional
#Visual: Key Insights / Bullets
```
