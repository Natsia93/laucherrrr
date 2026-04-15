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
      4. Alokasi Jam Pelajaran (KHUSUS UNTUK CP SAJA - JP jangan ditanyakan di CP).
      
      PANDUAN KHUSUS TIAP DOKUMEN:

      1. CP (Capaian Pembelajaran) - Fokus pada Kompetensi & Visi:
         - Rasionalitas Kontekstual: Mengapa mapel ini penting di sekolah Anda (hubungkan dengan visi/misi sekolah atau konteks lokal)?
         - Karakteristik Pembelajaran: Pendekatan apa yang diutamakan (Inquiry, Project-based, STEAM)?
         - Pembagian Elemen: Kompetensi spesifik pada elemen mana yang ingin ditonjolkan (misal: Pemahaman vs Keterampilan Proses)?
         - Dimensi Profil Pelajar Pancasila yang ingin diintegrasikan dalam narasi rasional.
         - *CATATAN: JANGAN TANYAKAN JP.*

      2. ATP (Alur Tujuan Pembelajaran) - Fokus pada Urutan & Alokasi Waktu:
         - Urutan Logis: Materi mana yang menjadi prasyarat?
         - Estimasi JP: Berapa alokasi waktu ideal untuk tiap Tujuan Pembelajaran (TP)?
         - Dimensi Profil Pelajar Pancasila per alur materi.

      3. LKPD (Lembar Kerja Peserta Didik):
         - Materi spesifik, Jenis Soal (PG/Esai), Tingkat Kesukaran (HOTS).

      4. PROSEM & PROTA:
         - Fokus pada kalender pendidikan, alokasi JP per minggu, dan target penyelesaian materi.

      Aturan Format:
      - Berikan respons HANYA dalam format JSON array of objects.
      - Gunakan bahasa Indonesia yang santun, profesional, dan berwibawa.
      - "type" bisa berupa "chips", "multi-chips", atau "text".

      CONTOH FORMAT AI:
      {
        "questions": [
          { "id": 4, "question": "Apa visi/konteks sekolah yang ingin dimasukkan dalam bagian Rasional?", "type": "text", "placeholder": "Misal: Sekolah berbasis digital, budaya lokal, dll..." },
          { "id": 5, "question": "Dimensi Profil Pelajar Pancasila mana yang paling dominan?", "type": "chips", "options": ["Mandiri", "Gotong Royong", "Kreatif", "Bernalar Kritis"] }
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

    if (docType === "PROSEM" || docType === "PROTA" || docType === "Program Tahunan" || docType === "Program Semester") {
      return NextResponse.json({
        questions: [
            ...(docType === "PROSEM" || docType === "Program Semester" ? [{ id: 4, question: "Pilih Semester yang ingin disusun jadwalnya:", type: "chips", options: ["Ganjil (Juli-Desember)", "Genap (Januari-Juni)"], category: "data" }] : []),
            { id: 5, question: "Berapa alokasi JP per minggu untuk mata pelajaran ini?", type: "chips", options: ["2 JP", "3 JP", "4 JP", "5 JP"], category: "data" },
            { id: 6, question: "Tuliskan Tahun Pelajaran Berjalan:", type: "text", placeholder: "Misal: 2024/2025", category: "data" },
        ]
      });
    }

    if (docType === "KKTP") {
      return NextResponse.json({
        questions: [
            { id: 4, question: "Apa Materi Utama atau Tujuan Pembelajaran yang ingin difokuskan?", type: "text", placeholder: "Misal: Rangkaian Listrik, Teks Eksplanasi...", category: "data" },
            { id: 5, question: "Metode Penilaian apa yang ingin digunakan?", type: "chips", options: ["Interval Nilai (0-100%)", "Rubrik Deskripsi"], category: "data" },
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
