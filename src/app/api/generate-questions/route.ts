import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt, docType } = await JSON.parse(await req.text());

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
      Anda adalah seorang Pakar Kurikulum Merdeka Indonesia. Tugas Anda adalah menyusun 5 hingga 7 pertanyaan teknis dan pedagogis untuk membantu guru merancang dokumen "${docType}" yang sangat spesifik dan akurat untuk topik "${prompt}".
      
      PENTING: Jangan menanyakan data administratif dasar (seperti Nama Guru atau Sekolah) di awal. Langsung fokus pada substansi pembuatan ${docType}.

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
      - "type" bisa berupa "chips" (pilihan cepat) atau "text".
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
