import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Inisialisasi DeepSeek (menggunakan format OpenAI)
const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const body = await req.json();
    const { rawPrompt, type = "Dokumen Kurikulum" } = body;

    const systemPrompt = `Anda adalah pakar Kurikulum Merdeka di Indonesia yang bertugas membantu Guru menyusun dokumen ${type} secara SUPER DETAIL dan PROFESIONAL.
    
    Permintaan: "${rawPrompt}"
    
    ATURAN LAYOUT UTAMA (WAJIB DIIKUTI):
    1. HEADER: Sertakan teks "ALUR TUJUAN PEMBELAJARAN (ATP)" di tengah, diikuti identitas: Nama Sekolah, Mata Pelajaran, Kelas/Semester, Tahun Pelajaran (Gunakan format titik-titik untuk yang belum ada data).
    2. BAGIAN A (CP): Sertakan nomor CP (Contoh: "CP NOMOR: 046 TAHUN 2025"). Berikan narasi "Pemahaman" dan poin-poin "Keterampilan Proses".
    3. BAGIAN B (TABEL ATP):
       - Gunakan TABEL MARDKOWN dengan 5 kolom: No, Alur Tujuan Pembelajaran, Dimensi Profil Lulusan, Materi Pokok, Alokasi Waktu.
       - Setiap Bab harus memiliki baris header grup yang tebal (Contoh: **BAB I : ...**).
       - Untuk materi pokok, jangan gunakan highlight warna, cukup gunakan BOLD jika diperlukan.
    4. SIKLUS TAHUNAN: Jika permintaan mencakup satu tahun, bagi menjadi Semester Ganjil dan Semester Genap. Ulangi Header dan Bagian A saat masuk ke Semester Genap.
    5. PENUTUP: 
       - Tambahkan baris "JUMLAH JAM PELAJARAN DALAM 1 TAHUN" di akhir tabel dengan total JP yang dijumlahkan secara akurat.
       - Sertakan blok tanda tangan formal: Mengetahui, Kepala Sekolah (di kiri) dan Guru Mata Pelajaran (di kanan).
    
    Gaya Penulisan: Bahasa Indonesia formal, rapi, dan sistematis. Pastikan setiap poin di ATP menggunakan kata kerja operasional (C1-C6).`;

    let generatedText = "";
    let providerUsed = "Gemini";

    try {
      // STRATEGI 1: Gunakan DeepSeek R1 (Utama)
      const completion = await deepseek.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: "deepseek-reasoner",
      });
      generatedText = completion.choices[0].message.content || "";
      providerUsed = "DeepSeek R1";
    } catch (deepseekError) {
      console.warn("DeepSeek R1 Gagal, mencoba Gemini...", deepseekError);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        generatedText = response.text();
        providerUsed = "Gemini 2.0 Flash";
      } catch (geminiError) {
        console.warn("Gemini Gagal, mencoba 1.5 Flash...", geminiError);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        generatedText = response.text();
        providerUsed = "Gemini 1.5 Flash";
      }
    }

    // Simpan ke Database
    const [newDoc] = await db.insert(documents).values({
      title: `${type} - ${rawPrompt.substring(0, 30)}...`,
      type: type,
      userId: user.id, // Link to the user
      content: generatedText,
      status: "Selesai",
      size: `${(generatedText.length / 1024).toFixed(1)} KB`,
    }).returning();

    return NextResponse.json({ success: true, data: newDoc, provider: providerUsed });
  } catch (error: any) {
    console.error("Critical Generate Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
