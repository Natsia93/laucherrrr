---
description: Aturan baku "Otak AI" Dekstorio — WAJIB dibaca sebelum mengubah apapun di generate-stream/route.ts atau workspace/page.tsx
---

# 🧠 KONTRAK ATURAN OTAK AI DEKSTORIO

> **PERHATIAN**: File ini adalah "source of truth" untuk semua aturan layout dan logika dokumen.
> **DILARANG KERAS** mengubah aturan di bawah ini kecuali USER secara eksplisit meminta perubahan.
> Jika ragu, TANYA USER terlebih dahulu.

---

## 📄 DAFTAR MODUL DOKUMEN

| Modul | Orientasi | Default Zoom | File Prompt | File UI |
|-------|-----------|-------------|-------------|---------|
| **ATP** (Alur Tujuan Pembelajaran) | Portrait | 100% | `route.ts` → `prompts["ATP"]` | `workspace/page.tsx` |
| **CP** (Capaian Pembelajaran) | Portrait | 100% | `route.ts` → `prompts["CP"]` | `workspace/page.tsx` |
| **PROTA** (Program Tahunan) | **Landscape** | **80%** | `route.ts` → `prompts["PROTA"]` | `workspace/page.tsx` |
| **PROSEM** (Program Semester) | **Landscape** | **80%** | `route.ts` → `prompts["PROSEM"]` | `workspace/page.tsx` |
| **KKTP** (Kriteria Ketercapaian TP) | Portrait | 100% | `route.ts` → `prompts["KKTP"]` | `workspace/page.tsx` |
| **LKPD** (Lembar Kerja PD) | Portrait | 100% | `route.ts` → `prompts["LKPD"]` | `workspace/page.tsx` |

---

## 🔒 ATURAN YANG TIDAK BOLEH DIUBAH

### 1. Orientasi Dokumen
- **Landscape**: HANYA `PROSEM` dan `PROTA`.
- **Portrait**: Semua modul lainnya (`ATP`, `CP`, `KKTP`, `LKPD`).
- Deteksi landscape di `workspace/page.tsx` menggunakan `activeDocType` (bukan `docType` dari URL) agar dokumen yang dimuat dari database tetap terdeteksi.

### 2. Header Berwarna (Dual-Row Table)
Semua modul WAJIB menggunakan header tabel 2 baris:
- **Baris 1**: Warna `#C5B4E3` atau `#E1D5E7` (Lavender), berisi nama dokumen.
- **Baris 2**: Warna `#E1D5E7` atau `#F3E5F5` (Lavender Muda), berisi nama mata pelajaran.
- Menggunakan `<table border="1">` agar Word mendeteksi border.

### 3. Identitas Tabel (Borderless)
Semua modul WAJIB memiliki tabel identitas dengan format:
- `<table border="0">` (tanpa border).
- Field: Nama Sekolah (titik-titik), Mata Pelajaran, Kelas/Semester, Tahun Pelajaran.
- Lebar kolom label: 160px, lebar kolom titik dua: 20px.

### 4. Bagian A: Capaian Pembelajaran (CP-First)
Modul `ATP`, `PROTA`, `PROSEM`, dan `KKTP` WAJIB memiliki Bagian A yang membahas CP secara mendalam sebelum masuk ke tabel utama.
- Judul: `"A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025"`.
- Background: `#f2f2f2`, bold, padding 5px.

### 5. Penomoran Reset Per BAB
Untuk modul yang memiliki tabel per-BAB (`ATP`, `PROTA`, `PROSEM`, `KKTP`):
- Kolom `No` WAJIB di-reset ke angka **1** setiap kali masuk BAB baru.
- DILARANG melanjutkan nomor dari BAB sebelumnya.

### 6. Highlight Materi
- **DILARANG** menggunakan highlight kuning (`background-color: yellow`) di semua modul.
- Materi kunci dituliskan dalam format **Bold & Italic** saja.

### 7. KOP Surat
- Semua dokumen WAJIB dimulai dengan KOP surat yang berisi:
  - Logo di kiri (15%), Teks instansi di kanan (85%).
  - Garis double (`border-bottom: 3px double black`).
- [LOGO], [NAMA SEKOLAH], Alamat, Email, Website menggunakan placeholder `[Isi Manual]`.

### 8. Tanda Tangan
- Semua dokumen WAJIB diakhiri dengan tabel tanda tangan 2 kolom:
  - Kolom kiri: Kepala Sekolah.
  - Kolom kanan: Guru Mata Pelajaran.
- DILARANG KERAS mengarang nama orang atau NIP.

### 9. Anti-Hallucination
- DILARANG mengarang: Nama Sekolah, Nama Guru, Nama Kepala Sekolah, Alamat, Email, Website, NIP.
- Gunakan titik-titik panjang atau `[Isi Manual]`.
- Jika user memberikan daftar BAB, gunakan PERSIS sesuai yang diberikan.

### 10. Output HTML
- DILARANG menggunakan markdown code blocks. Langsung mulai dengan `<div>`.
- DILARANG menggunakan CSS class — gunakan INLINE STYLE saja.
- DILARANG menggunakan HTML entities (`&nbsp;`, `&amp;`, dll).
- Font: `'Times New Roman', serif`, ukuran 12pt.
- Alignment narasi: `text-align: justify`.

---

## 📐 ATURAN SPESIFIK PER MODUL

### ATP
- Tabel utama: 5 kolom (No 5%, ATP 35%, Dimensi 20%, Materi 25%, Alokasi 15%).
- Header tabel: `background-color: #FCE4D6` (Reddish-Peach).
- Separator BAB: `background-color: #E7EFF6` (Biru Muda).
- Footer tabel TOTAL JP wajib di DALAM tabel (colspan="4" + 1 kolom JP).
- Minimal 3-5 baris per BAB.

### CP
- Struktur: A. Rasional (400-500 kata), B. Tujuan, C. Karakteristik (+ Tabel Elemen & Deskripsi), D. CP Fase [X].
- Header: `#C5B4E3` dan `#E1D5E7`.

### PROTA (Landscape)
- Tabel: 5 kolom (No, ATP, Materi, Alokasi Waktu, Semester).
- Header tabel: `background-color: #9FC5E8` (Biru).
- Separator BAB: `background-color: #ADD8E6` (Light Blue).
- Semester: "I (Ganjil)" atau "II (Genap)".

### PROSEM (Landscape)
- Tabel: 33 kolom (No, ATP, Alokasi Waktu + 6 bulan × 5 minggu).
- Header Row 1: `background-color: #D9D9D9`, Header Row 2: `background-color: #FCE4D6`.
- Separator BAB: `background-color: #ADD8E6` (Light Blue), colspan="33".
- Font tabel: 8-9pt karena tabel sangat lebar.
- Baris khusus: STS, SAS, Libur.

### KKTP (Portrait)
- Tabel: 6 kolom (No, ATP, 4 interval nilai).
- Header: `background-color: #E1D5E7`.
- Interval: 0-40%, 41-65%, 66-85%, 86-100%.
- Row 3 deskripsi interval (remedial/pengayaan).
- Separator BAB: `background-color: #F9CB9C` (Orange/Peach).
- Kolom interval DIBIARKAN KOSONG (diisi guru manual).

### LKPD
- Struktur: KOP Formal, Identitas Siswa, Judul Materi, Petunjuk Kerja, Ringkasan Materi, Soal, Kunci Jawaban.
- Jumlah soal WAJIB TEPAT sesuai input user (PG, Jawaban Singkat, Esai).
- Nomor soal KONTINU (tidak reset antar tipe soal).
- PG: Gunakan `<ol type="A">` untuk opsi.

---

## 🖥️ ATURAN UI WORKSPACE

### Landscape Detection (workspace/page.tsx)
```
Deteksi menggunakan `activeDocType` (state yang diupdate dari database):
- activeDocType.includes("Program Semester") || "PROSEM"
- activeDocType.includes("Program Tahunan") || "PROTA"
```

### Zoom Default
- Landscape (PROSEM, PROTA): **80%**
- Portrait (semua lainnya): **100%**

### Word Export
- Menggunakan `activeDocType` (bukan `docType`) untuk deteksi landscape.
- `@page { size: A4 landscape }` untuk PROSEM/PROTA.
- `@page { size: A4 }` untuk lainnya.

### Preloader
- Preloader HANYA muncul saat hard reload atau kunjungan pertama.
- Navigasi internal (Dashboard → Landing Page, Workspace → Landing Page) TIDAK memicu preloader.
- Deteksi menggunakan `(window as any).__HAS_ENTERED_APP__`.

---

## ⚠️ CHECKLIST SEBELUM MENGUBAH OTAK AI

Sebelum mengedit `generate-stream/route.ts` atau `workspace/page.tsx`, pastikan:

- [ ] Apakah USER secara eksplisit meminta perubahan ini?
- [ ] Apakah perubahan ini melanggar salah satu aturan di atas?
- [ ] Apakah orientasi dokumen masih benar? (Landscape hanya PROSEM & PROTA)
- [ ] Apakah penomoran masih reset per BAB?
- [ ] Apakah highlight kuning masih tidak digunakan?
- [ ] Apakah header warna masih konsisten?
- [ ] Apakah data fiktif tidak dihasilkan?
- [ ] Sudah test export ke Word?
