import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  let docType = "Kurikulum";
  try {
    const body = await req.json();
    docType = body.docType;
    const prompt = body.prompt;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
      Anda adalah seorang Pakar Kurikulum Merdeka Indonesia (Regulasi 046/H/KR/2025). Tugas Anda adalah menyusun 5 hingga 7 pertanyaan teknis dan pedagogis untuk membantu guru merancang dokumen "${docType}" yang sangat spesifik untuk topik "${prompt}".
      
      PENTING: JANGAN menanyakan data dasar berikut karena sudah ditanyakan sebelumnya:
      1. Nama Mata Pelajaran
      2. Kelas & Fase (A, B, C, D, E, F)
      3. Semester
      4. Alokasi Jam Pelajaran (KHUSUS CP & KKTP - JP jangan ditanyakan).
      
      PANDUAN KHUSUS TIAP DOKUMEN:

      1. CP (Capaian Pembelajaran) - Fokus pada Kompetensi & Visi:
         - Rasionalitas Kontekstual: Mengapa mapel ini penting di sekolah Anda (visi/misi)?
         - Karakteristik Pembelajaran: Pendekatan apa yang diutamakan?
         - Pembagian Elemen: Kompetensi spesifik pada elemen mana yang ingin ditonjolkan?
         - *JANGAN TANYAKAN JP.*

      2. ATP (Alur Tujuan Pembelajaran):
         - Urutan Logis, Estimasi JP per TP, dan Profil Pelajar Pancasila.

      3. KKTP (Kriteria Ketercapaian):
         - Metode Penilaian: 'Interval Nilai' (0-40%, 41-65%, dst seperti template) atau 'Deskripsi Kriteria'?
         - Referensi Regulasi: Apakah butuh mencantumkan Kode SK CP (misal: No 046/2025)?
         - Fokus TP: BAB atau materi apa yang ingin ditentukan kriterianya?
         - *JANGAN TANYAKAN JP.*

      4. PROSEM (Program Semester):
         - Alokasi Beban: Berapa JP per minggu yang tersedia?
         - Referensi CP: Apakah butuh nomor regulasi (No 046/2025) di kop?
         - Distribusi Materi: Daftar BAB/ATP yang harus dipetakan per bulan.
         - Jadwal Khusus: Waktu pelaksanaan STS (Tengah Semester) dan SAS (Akhir Semester).

      5. PROTA (Program Tahunan):
         - Fokus pada total alokasi JP dalam satu tahun pelajaran (dua semester).
         - Pembagian materi antara Semester Ganjil dan Genap.
         - Target kompetensi besar di akhir tahun pelajaran.

      Aturan Format:
      - Berikan respons HANYA dalam format JSON array of objects.
      - Gunakan bahasa Indonesia yang santun, profesional, dan berwibawa.
      - "type" bisa berupa "chips", "multi-chips", atau "text".

      CONTOH FORMAT AI:
      {
        "questions": [
          { "id": 4, "question": "Metode kriteria apa yang ingin digunakan?", "type": "chips", "options": ["Interval Nilai", "Rubrik Deskripsi"] },
          { "id": 5, "question": "Apa visi sekolah yang ingin diintegrasikan?", "type": "text" }
        ]
      }
    `;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    const questions = JSON.parse(jsonStr);

    return NextResponse.json(questions);
  } catch (err) {
    console.error("Failed to generate questions:", err);
    if (docType === "CP") {
      return NextResponse.json({
        questions: [
          { id: 4, question: "Apa konteks khusus atau visi sekolah yang ingin diintegrasikan dalam bagian Rasional?", type: "text", placeholder: "Misal: Keunggulan lokal, visi digital, atau karakter religius..." },
          { id: 5, question: "Pilih elemen kompetensi yang ingin diutamakan pembahasannya:", type: "multi-chips", options: ["Pemahaman Konsep", "Keterampilan Proses", "Literasi", "Numerasi"] },
          { id: 6, question: "Metode pembelajaran apa yang paling ditekankan dalam karakteristik CP ini?", type: "chips", options: ["Unit of Inquiry", "Project-Based Learning", "Problem-Based", "Discovery Learning"] },
          { id: 7, question: "Sebutkan Dimensi Profil Pelajar Pancasila yang ingin diintegrasikan:", type: "multi-chips", options: ["Bernalar Kritis", "Kreatif", "Mandiri", "Gotong Royong", "Kebhinekaan Global"] }
        ]
      });
    }

    if (docType === "ATP") {
      return NextResponse.json({
        questions: [
          { id: 4, question: "Materi apa yang menjadi prasyarat utama sebelum memulai alur ini?", type: "text", placeholder: "Misal: Dasar bilangan, konsep dasar materi, dsb..." },
          { id: 5, question: "Pilih dimensi profil pelajar pancasila yang ingin diintegrasikan per alur:", type: "multi-chips", options: ["Kreatif", "Bernalar Kritis", "Mandiri", "Gotong Royong"] },
          { id: 6, question: "Tentukan estimasi alokasi JP per Tujuan Pembelajaran:", type: "chips", options: ["2 JP", "4 JP", "6 JP", "8 JP"] }
        ]
      });
    }

    if (docType === "LKPD") {
      return NextResponse.json({
        questions: [
          { id: 4, question: "Apa topik materi spesifik yang ingin diujikan dalam LKPD ini?", type: "text", placeholder: "Misal: Rantai Makanan, Persamaan Kuadrat..." },
          { id: 5, question: "Pilih jenis soal yang ingin Anda masukkan:", type: "multi-chips", options: ["Pilihan Ganda", "Esai", "Jawaban Singkat"] },
          { id: 6, question: "Berapa jumlah total soal yang Anda butuhkan?", type: "chips", options: ["10 Soal", "20 Soal", "30 Soal"] }
        ]
      });
    }

    if (docType === "PROSEM" || docType === "Program Semester") {
      return NextResponse.json({
        questions: [
            { id: 4, question: "Berapa alokasi JP (Jam Pelajaran) per minggu?", type: "chips", options: ["2 JP", "3 JP", "4 JP", "5 JP"], category: "data" },
            { id: 5, question: "Pilih Semester yang ingin disusun jadwalnya:", type: "chips", options: ["Ganjil (Juli-Desember)", "Genap (Januari-Juni)"], category: "data" },
            { id: 6, question: "Sebutkan daftar BAB atau ATP yang ingin didistribusikan:", type: "text", placeholder: "Misal: BAB I Sel, BAB II Klasifikasi Makhluk Hidup...", category: "data" },
            { id: 7, question: "Tuliskan nomor/tahun regulasi CP untuk referensi kop:", type: "text", placeholder: "Misal: 046 Tahun 2025", category: "data" }
        ]
      });
    }

    if (docType === "KKTP") {
      return NextResponse.json({
        questions: [
            { id: 4, question: "Metode Kriteria apa yang ingin Anda gunakan?", type: "chips", options: ["Skala/Interval Nilai (0-100%)", "Rubrik Deskripsi"], category: "data" },
            { id: 5, question: "Tuliskan nomor/tahun regulasi CP sebagai referensi:", type: "text", placeholder: "Misal: 046 Tahun 2025", category: "data" },
            { id: 6, question: "Sebutkan Tujuan Pembelajaran (TP) atau BAB yang ingin ditentukan kriterianya:", type: "text", placeholder: "Misal: BAB I Hakikat Ilmu Sains, dsb...", category: "data" },
            { id: 7, question: "Berapa ambang batas (passing grade) ketuntasan yang ditetapkan sekolah?", type: "chips", options: ["65", "70", "75", "80"], category: "data" }
        ]
      });
    }

    if (docType === "PROTA" || docType === "Program Tahunan") {
      return NextResponse.json({
        questions: [
            { id: 4, question: "Berapa total alokasi JP (Jam Pelajaran) selama satu tahun?", type: "chips", options: ["72 JP", "108 JP", "144 JP", "180 JP"], category: "data" },
            { id: 5, question: "Tuliskan Tahun Pelajaran Berjalan:", type: "text", placeholder: "Misal: 2024/2025", category: "data" },
            { id: 6, question: "Sebutkan daftar BAB/Materi utama untuk Semester 1 (Ganjil) dan 2 (Genap):", type: "text", placeholder: "Smt 1: BAB 1-3, Smt 2: BAB 4-6...", category: "data" },
            { id: 7, question: "Apakah ingin menyertakan rincian Capaian Pembelajaran (CP) sesuai Regulasi 046/2025?", type: "chips", options: ["Ya, Sertakan Lengkap", "Tidak, Hanya Tabel"], category: "data" }
        ]
      });
    }

    return NextResponse.json({ 
      questions: [
        { id: 4, question: "Apa elemen materi utama yang menjadi fokus?", type: "text", placeholder: "Misal: Geometri, Menulis, atau Zat dan Perubahannya..." },
        { id: 5, question: "Media pembelajaran apa saja yang tersedia di sekolah Anda?", type: "multi-chips", options: ["Alat Peraga Fisik", "Laboratorium Komputer", "Buku Teks & Internet"] }
      ]
    });
  }
}
