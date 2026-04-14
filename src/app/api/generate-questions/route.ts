import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  let docType = "Kurikulum";
  try {
    const body = await JSON.parse(await req.text());
    docType = body.docType;
    const prompt = body.prompt;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
      Anda adalah seorang Pakar Kurikulum Merdeka Indonesia. Tugas Anda adalah menyusun 5 hingga 7 pertanyaan teknis dan pedagogis untuk membantu guru merancang dokumen "${docType}" yang sangat spesifik dan akurat untuk topik "${prompt}".
      
      PENTING: JANGAN menanyakan data dasar berikut karena sudah ditanyakan di awal:
      1. Nama Mata Pelajaran
      2. Kelas
      3. Fase (A, B, C, D, E, F)
      4. Semester (Ganjil, Genap, atau Keduanya)
      5. Alokasi Jam Pelajaran (JP)
      
      Fokuslah langsung pada substansi pedagogis, materi spesifik, metode pembelajaran, karakteristik siswa, dan kebutuhan teknis dokumen ${docType}.

      1. CP (Capaian Pembelajaran):
         - Rasionalitas (Mengapa mapel ini penting?).
         - Elemen-elemen utama yang ingin difokuskan.
         - Karakteristik khusus sekolah/peserta didik.

      2. ATP (Alur Tujuan Pembelajaran):
         - Elemen Materi Utama (Geometri, Literasi, dsb).
         - Urutan Logis: Materi mana yang harus dikuasai siswa lebih dulu?
         - Dimensi Profil Pelajar Pancasila yang ingin ditonjolkan.
         - Ketersediaan media/sumber belajar di sekolah.

      3. LKPD (Lembar Kerja Peserta Didik):
         - Materi spesifik yang akan diujikan.
         - Jenis Soal (Pilihan Ganda, Esai, atau Isian).
         - Jumlah butir soal dan tingkat kesukaran (LOTS/HOTS).
         - Apakah butuh kunci jawaban dan rubrik penilaian?

      4. PROSEM (Program Semester):
         - Semester (Ganjil/Genap).
         - Alokasi JP per minggu & Hari efektif KBM.
         - Tahun Pelajaran.
         - Apakah ada jadwal khusus (seperti jeda tengah semester)?

      5. PROTA (Program Tahunan):
         - Total Jam Pelajaran setahun.
         - Daftar Bab/Materi utama yang harus diselesaikan dalam dua semester.
         - Target kompetensi besar siswa di akhir tahun.

      6. KKTP (Kriteria Ketercapaian):
         - Tujuan Pembelajaran (TP) spesifik yang ingin dinilai.
         - Metode Kriteria (Interval Nilai atau Deskripsi Kriteria).
         - Standar ambang batas ketuntasan yang diinginkan sekolah.

      Aturan Format:
      - Berikan respons HANYA dalam format JSON array of objects.
      - Gunakan bahasa Indonesia yang santun, profesional, dan berwibawa.
      - "type" bisa berupa "chips" (pilihan tunggal), "multi-chips" (pilihan ganda/multiple select), atau "text".
      - Sediakan opsi "chips" yang mencerminkan istilah teknis Kurikulum Merdeka.

      CONTOH FORMAT AI:
      {
        "questions": [
          { "id": 4, "question": "Apa elemen materi utama yang ingin Anda jabarkan alurnya?", "type": "text", "placeholder": "Misal: Bilangan, Zat dan Perubahannya, atau Budaya Sejarah..." },
          { "id": 5, "question": "Dimensi Profil Pelajar Pancasila mana yang paling ingin ditonjolkan?", "type": "chips", "options": ["Mandiri", "Gotong Royong", "Kreatif", "Bernalar Kritis"] }
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
          { id: 4, question: "Apa rasionalitas utama mata pelajaran ini dalam konteks kurikulum sekolah Anda?", type: "text", placeholder: "Uraikan mengapa mapel ini penting bagi murid..." },
          { id: 5, question: "Sebutkan elemen-elemen utama yang menjadi fokus kompetensi:", type: "text", placeholder: "Misal: Menyimak, Berbicara, Membaca, Menulis..." },
          { id: 6, question: "Apakah ada instruksi khusus untuk penyesuaian materi lokal?", type: "text", placeholder: "Misal: Hubungkan dengan potensi wisata daerah, pertanian, dsb..." }
        ]
      });
    }

    if (docType === "LKPD") {
      return NextResponse.json({
        questions: [
          { id: 4, question: "Apa topik atau materi spesifik yang ingin diujikan dalam LKPD ini?", type: "text", placeholder: "Misal: Rantai Makanan, Persamaan Kuadrat, atau Teks Prosedur..." },
          { id: 5, question: "Pilih jenis soal yang ingin Anda masukkan (bisa pilih lebih dari satu):", type: "multi-chips", options: ["Pilihan Ganda", "Esai", "Jawaban Singkat"] },
          { id: 6, question: "Berapa jumlah total soal yang Anda butuhkan?", type: "chips", options: ["10 Soal", "20 Soal", "30 Soal"] },
          { id: 7, question: "Apakah ada instruksi khusus untuk tingkat kesulitan atau konteks soal?", type: "text", placeholder: "Misal: Fokus pada soal HOTS, sertakan kunci jawaban, atau gunakan bahasa sehari-hari..." }
        ]
      });
    }

    if (docType === "PROSEM" || docType === "PROTA" || docType === "Program Tahunan" || docType === "Program Semester") {
      return NextResponse.json({
        questions: [
            ...(docType === "PROSEM" || docType === "Program Semester" ? [{ id: 4, question: "Pilih Semester yang ingin disusun jadwalnya:", type: "chips", options: ["Ganjil (Juli-Desember)", "Genap (Januari-Juni)"], category: "data" }] : []),
            { id: 6, question: "Tuliskan Tahun Pelajaran:", type: "text", placeholder: "Misal: 2024/2025", category: "data" },
        ]
      });
    }

    if (docType === "KKTP") {
      return NextResponse.json({
        questions: [
            { id: 4, question: "Apa Materi Utama atau Tujuan Pembelajaran yang ingin difokuskan?", type: "text", placeholder: "Misal: Rangkaian Listrik, Thaharah, Hukum Tajwid, Teks Eksplanasi...", category: "data" },
            { id: 5, question: "Metode Penilaian apa yang ingin digunakan?", type: "chips", options: ["Interval Nilai (0-100%)", "Rubrik Deskripsi"], category: "data" },
        ]
      });
    }

    return NextResponse.json({ 
      questions: [
        { id: 4, question: "Apa elemen materi utama yang menjadi fokus?", type: "text", placeholder: "Misal: Geometri, Menulis, atau Zat dan Perubahannya..." },
        { id: 5, question: "Media pembelajaran apa saja yang tersedia di sekolah Anda?", type: "chips", options: ["Alat Peraga Fisik", "Laboratorium Komputer", "Lingkungan Terbuka", "Buku Teks & Internet"] }
      ]
    });
  }
}
