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
      
      PENTING: Jangan menanyakan data administratif dasar (seperti Nama Guru atau Sekolah) di awal. Langsung fokus pada substansi pembuatan ${docType}.

      1. CP (Capaian Pembelajaran):
         - Nama Mata Pelajaran & Fase.
         - Rasionalitas (Mengapa mapel ini penting?).
         - Elemen-elemen utama yang ingin difokuskan.
         - Karakteristik khusus sekolah/peserta didik.

      2. ATP (Alur Tujuan Pembelajaran):
         - Fase & Kelas.
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

      Jika jenis dokumennya adalah "ATP" (Alur Tujuan Pembelajaran), fokuslah pada elemen-elemen berikut:
      1. Fase dan Kelas (Pilih dari Fase A-F, Kelas 1-12).
      2. Elemen Materi atau Domain (Misal: Aljabar, Geometri, Makhluk Hidup, Energi, dll).
      3. Apakah ada Capaian Pembelajaran (CP) tertentu yang ingin dijadikan acuan utama?
      4. Ketersediaan Media/Sumber Belajar di sekolah agar AI bisa menyusun kolom "Media" secara realistis.
      5. Karakteristik khusus peserta didik yang perlu mendapat penyesuaian alur.
      6. Urutan logis: Materi mana yang harus dikuasai siswa lebih dulu?

      Aturan Format:
      - Berikan respons HANYA dalam format JSON array of objects.
      - Gunakan bahasa Indonesia yang santun, profesional, dan berwibawa.
      - "type" bisa berupa "chips" (pilihan tunggal), "multi-chips" (pilihan ganda/multiple select), atau "text".
      - Sediakan opsi "chips" yang mencerminkan istilah teknis Kurikulum Merdeka.

      CONTOH FORMAT AI:
      {
        "questions": [
          { "id": 1, "question": "Untuk Fase dan Kelas berapakah ATP ini akan dirancang?", "type": "chips", "options": ["Fase D (Kelas 7)", "Fase D (Kelas 8)", "Fase D (Kelas 9)", "Fase Lainnya"] },
          { "id": 2, "question": "Apa elemen materi utama yang ingin Anda jabarkan alurnya?", "type": "text", "placeholder": "Misal: Bilangan, Zat dan Perubahannya, atau Budaya Sejarah..." }
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
          { id: 1, question: "Mata Pelajaran apa yang ingin disusun Capaian Pembelajarannya?", type: "text", placeholder: "Misal: Matematika, Bahasa Inggris, atau Informatika..." },
          { id: 2, question: "Untuk Fase manakah CP ini akan dirancang?", type: "chips", options: ["Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"] },
          { id: 3, question: "Apa rasionalitas utama mata pelajaran ini dalam konteks kurikulum sekolah Anda?", type: "text", placeholder: "Uraikan mengapa mapel ini penting bagi murid..." },
          { id: 4, question: "Sebutkan elemen-elemen utama yang menjadi fokus kompetensi:", type: "text", placeholder: "Misal: Menyimak, Berbicara, Membaca, Menulis..." },
          { id: 5, question: "Apakah ada instruksi khusus untuk penyesuaian materi lokal?", type: "text", placeholder: "Misal: Hubungkan dengan potensi wisata daerah, pertanian, dsb..." }
        ]
      });
    }

    if (docType === "LKPD") {
      return NextResponse.json({
        questions: [
          { id: 1, question: "Untuk Fase dan Kelas berapakah LKPD ini dirancang?", type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E (Kls 10)", "Fase F (Kls 11-12)"] },
          { id: 2, question: "Apa topik atau materi spesifik yang ingin diujikan dalam LKPD ini?", type: "text", placeholder: "Misal: Rantai Makanan, Persamaan Kuadrat, atau Teks Prosedur..." },
          { id: 3, question: "Pilih jenis soal yang ingin Anda masukkan (bisa pilih lebih dari satu):", type: "multi-chips", options: ["Pilihan Ganda", "Esai", "Jawaban Singkat"] },
          { id: 4, question: "Berapa jumlah total soal yang Anda butuhkan?", type: "chips", options: ["10 Soal", "20 Soal", "30 Soal"] },
          { id: 5, question: "Apakah ada instruksi khusus untuk tingkat kesulitan atau konteks soal?", type: "text", placeholder: "Misal: Fokus pada soal HOTS, sertakan kunci jawaban, atau gunakan bahasa sehari-hari..." }
        ]
      });
    }

    if (docType === "PROSEM" || docType === "PROTA" || docType === "Program Tahunan" || docType === "Program Semester") {
      return NextResponse.json({
        questions: [
            { id: 1, question: `Untuk Mata Pelajaran apa ${docType} ini dibuat?`, type: "text", placeholder: "Misal: IPA, Matematika, Fiqih, Bahasa Arab, B. Mandarin...", category: "data" },
            { id: 2, question: `Fase dan Kelas berapakah ${docType} ini?`, type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E (Kls 10)", "Fase F (Kls 11-12)"], category: "data" },
            ...(docType === "PROSEM" || docType === "Program Semester" ? [{ id: 3, question: "Pilih Semester yang ingin disusun jadwalnya:", type: "chips", options: ["Ganjil (Juli-Desember)", "Genap (Januari-Juni)"], category: "data" }] : []),
            { id: 4, question: "Berapa Alokasi JP per minggu untuk mata pelajaran ini?", type: "chips", options: ["2 JP", "3 JP", "4 JP", "5 JP"], category: "data" },
            { id: 5, question: "Tuliskan Tahun Pelajaran:", type: "text", placeholder: "Misal: 2024/2025", category: "data" },
        ]
      });
    }

    if (docType === "KKTP") {
      return NextResponse.json({
        questions: [
            { id: 1, question: "Untuk Mata Pelajaran apa KKTP ini dibuat?", type: "text", placeholder: "Misal: IPA, Matematika, Fiqih, Bahasa Arab, B. Mandarin...", category: "data" },
            { id: 2, question: "Fase dan Kelas berapakah KKTP ini?", type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E (Kls 10)", "Fase F (Kls 11-12)"], category: "data" },
            { id: 3, question: "Apa Materi Utama atau Tujuan Pembelajaran yang ingin difokuskan?", type: "text", placeholder: "Misal: Rangkaian Listrik, Thaharah, Hukum Tajwid, Teks Eksplanasi...", category: "data" },
            { id: 4, question: "Metode Penilaian apa yang ingin digunakan?", type: "chips", options: ["Interval Nilai (0-100%)", "Rubrik Deskripsi"], category: "data" },
        ]
      });
    }

    return NextResponse.json({ 
      questions: [
        { id: 1, question: "Untuk Fase dan Kelas berapakah dokumen ini dirancang?", type: "chips", options: ["Fase A (Kls 1-2)", "Fase B (Kls 3-4)", "Fase C (Kls 5-6)", "Fase D (Kls 7-9)", "Fase E/F (SMA)"] },
        { id: 2, question: "Apa elemen materi utama yang menjadi fokus?", type: "text", placeholder: "Misal: Geometri, Menulis, atau Zat dan Perubahannya..." },
        { id: 3, question: "Media pembelajaran apa saja yang tersedia di sekolah Anda?", type: "chips", options: ["Alat Peraga Fisik", "Laboratorium Komputer", "Lingkungan Terbuka", "Buku Teks & Internet"] },
        { id: 4, question: "Berapa total Jam Pelajaran (JP) yang tersedia untuk materi ini?", "type": "chips", "options": ["4 JP", "8 JP", "12 JP", "Sesuai Kurikulum"] }
      ]
    });
  }
}
