import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages, type = "Modul Ajar" } = await req.json();
    
    const lastMessage = messages[messages.length - 1].text;
    
    const systemPrompt = `Anda adalah asisten kurikulum yang membantu guru menyiapkan data untuk membuat dokumen ${type}.
    Tugas Anda adalah menanyakan detail yang HANYA diperlukan untuk membuat ${type} tersebut.
    
    Percakapan saat ini: ${messages.map((m: { role: string; text: string }) => `${m.role}: ${m.text}`).join("\n")}
    
    Aturan:
    1. Jadilah formal namun ramah.
    2. Tanyakan HANYA SATU pertanyaan spesifik per pesan.
    3. Jika pengguna menjawab topik, tanyakan fase/kelas. Jika sudah, tanyakan materi spesifik atau preferensi metode.
    4. Maksimal 4-5 pertanyaan total.
    5. Jangan berikan hasil akhir di sini, hanya kumpulkan data melalui pertanyaan.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, reply: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
