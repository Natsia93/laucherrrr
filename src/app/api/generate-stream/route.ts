import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { documents } from "@/db/schema";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = session.user;
    const body = await req.json();
    const { rawPrompt, type = "Dokumen Kurikulum" } = body;

    const systemPrompt = `Anda adalah pakar Kurikulum Merdeka di Indonesia yang bertugas membantu Guru menyusun dokumen ${type} secara SUPER DETAIL dan PROFESIONAL.
    
    Permintaan: "${rawPrompt}"
    
    ATURAN LAYOUT UTAMA (WAJIB DIIKUTI):
    1. HEADER & IDENTITAS: Anda HARUS mencetak tepat format HTML di bawah ini (ganti nilai di dalam kurung siku):
       <div style="background-color: #d1c4e9; text-align: center; font-weight: bold; padding: 8px; margin-bottom: 20px;">
         <div style="font-size: 14pt;">ALUR TUJUAN PEMBELAJARAN (ATP)</div>
         <div style="font-size: 12pt;">MATA PELAJARAN : [NAMA MAPEL HURUF KAPITAL]</div>
       </div>
       <table style="width: 100%; border: none; margin-bottom: 20px; font-weight: bold; font-size: 11pt;">
         <tr><td style="width: 150px; border: none; padding: 4px;">Nama Sekolah</td><td style="width: 20px; border: none;">:</td><td style="border: none;">...................................................</td></tr>
         <tr><td style="border: none; padding: 4px;">Mata Pelajaran</td><td style="border: none;">:</td><td style="border: none;">[Nama Mapel]</td></tr>
         <tr><td style="border: none; padding: 4px;">Kelas / Semester</td><td style="border: none;">:</td><td style="border: none;">[Kelas] / [Semester]</td></tr>
         <tr><td style="border: none; padding: 4px;">Tahun Pelajaran</td><td style="border: none;">:</td><td style="border: none;">20... / 20...</td></tr>
       </table>

    2. BAGIAN A (CP): Anda HARUS mencetak format HTML berikut dengan lengkap:
       <div style="background-color: #e0e0e0; font-weight: bold; padding: 5px; font-size: 12pt; margin-bottom: 10px;">
       A. CAPAIAN PEMBELAJARAN (CP) NOMOR : 046 TAHUN 2025
       </div>
       <p style="margin-left: 20px; font-size: 11pt;">Pada akhir Fase [Huruf Fase], murid memiliki kemampuan sebagai berikut:</p>
       <ol style="margin-left: 20px; font-weight: bold; font-size: 11pt;">
         <li>Pemahaman [Nama Mapel]<br>
             <div style="font-weight: normal; margin-top: 5px; text-align: justify;">[Uraikan pemahaman CP secara komprehensif tanpa poin-poin]</div>
         </li>
         <li style="margin-top: 15px;">Keterampilan Proses<br>
             <div style="font-weight: normal; margin-top: 5px;">Mampu menerapkan keterampilan proses yang meliputi:</div>
             <ul style="font-weight: normal; padding-left: 20px; margin-top: 5px; list-style-type: disc; text-align: justify;">
               <li><b>Mengamati :</b> [Deskripsi]</li>
               <li><b>Mempertanyakan dan Memprediksi :</b> [Deskripsi]</li>
               <li><b>Merencanakan dan Melakukan Penyelidikan :</b> [Deskripsi]</li>
               <li><b>Memproses, Menganalisis Data dan Informasi :</b> [Deskripsi]</li>
               <li><b>Mengevaluasi dan Refleksi :</b> [Deskripsi]</li>
             </ul>
         </li>
       </ol>

    3. BAGIAN B (TABEL ATP): Anda HARUS mencetak format HTML berikut dengan lengkap (TIDAK BOLEH pakai Markdown table biasa karena butuh merge column dan warna):
       <div style="background-color: #e0e0e0; font-weight: bold; padding: 5px; font-size: 12pt; margin-bottom: 10px;">
       B. ALUR TUJUAN PEMBELAJARAN (ATP)
       </div>
       <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 11pt; text-align: left;">
         <thead>
           <tr style="background-color: #fae3e3; text-align: center; font-weight: bold;">
             <th style="border: 1px solid black; padding: 8px;">No</th>
             <th style="border: 1px solid black; padding: 8px;">Alur Tujuan Pembelajaran</th>
             <th style="border: 1px solid black; padding: 8px;">Dimensi Profil Lulusan</th>
             <th style="border: 1px solid black; padding: 8px;">Materi Pokok</th>
             <th style="border: 1px solid black; padding: 8px; width: 80px;">Alokasi Waktu</th>
           </tr>
         </thead>
         <tbody>
           <!-- Ganti BAB I dengan nama Bab yang sesuai -->
           <tr style="background-color: #e6f7ff;">
             <td colspan="5" style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">
               BAB I : [NAMA BAB HURUF KAPITAL]
             </td>
           </tr>
           <!-- Format baris isi tabel -->
           <tr>
             <td style="border: 1px solid black; padding: 8px; text-align: center; vertical-align: top; font-weight: bold;">1</td>
             <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
               <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                 <li>[Tuliskan Alur Tujuan Pembelajaran]</li>
                 <li>[Detail tambahan jika ada]</li>
               </ul>
             </td>
             <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
               <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                 <li>Keimanan dan Ketakwaan</li>
                 <li>Penalaran Kritis</li>
                 <li>[Dimensi lainnya...]</li>
               </ul>
             </td>
             <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
               <!-- Gunakan highlight kuning, bold, dan italic untuk Materi Pokok persis seperti gambar -->
               <span style="background-color: yellow; font-weight: bold; font-style: italic;">[Sub Materi Pokok 1]</span><br><br>
               <span style="background-color: yellow; font-weight: bold; font-style: italic;">[Sub Materi Pokok 2]</span>
             </td>
             <td style="border: 1px solid black; padding: 8px; text-align: center; vertical-align: top;">2 JP</td>
           </tr>
         </tbody>
       </table>
       
    4. SIKLUS TAHUNAN: Jika permintaan mencakup satu tahun, ulangi blok '<tr style="background-color: #e6f7ff;"><td colspan="5"...' untuk Semester Genap dan bab selanjutnya di dalam tabel yang sama (jangan buat tabel terpisah).
    5. PENUTUP: Anda HARUS menutup tabel di Bagian B dengan format HTML ini, kemudian membuat blok tanda tangan di bawahnya:
       <!-- Tambahkan ini di BARIS PALING BAWAH sebelum penutup tabel </tbody> -->
       <tr style="background-color: #e6f7ff; font-weight: bold; text-align: center;">
         <td colspan="4" style="border: 1px solid black; padding: 8px;">JUMLAH JAM PELAJARAN DALAM 1 TAHUN</td>
         <td style="border: 1px solid black; padding: 8px;">[Total] JP</td>
       </tr>
       <!-- Setelah </table>, letakkan blok TTD di bawah ini -->
       <br>
       <table style="width: 100%; border: none; font-weight: bold; font-size: 11pt; text-align: center; margin-top: 20px;">
         <tr>
           <td style="width: 50%; border: none; padding-bottom: 70px;">Mengetahui,<br>Kepala Sekolah</td>
           <td style="width: 50%; border: none; padding-bottom: 70px;">.......................................... 20.....<br>Guru Mata Pelajaran</td>
         </tr>
         <tr>
           <td style="border: none;">(...............................................)<br><span style="font-weight: normal; margin-left: -50px;">NIP. ........................................</span></td>
           <td style="border: none;">(...............................................)<br><span style="font-weight: normal; margin-left: -50px;">NIP. ........................................</span></td>
         </tr>
       </table>
    
    Gaya Penulisan: Bahasa Indonesia formal, rapi, dan sistematis. Pastikan setiap poin di ATP menggunakan kata kerja operasional (C1-C6).
    
    PERINGATAN KRITIKAL: JANGAN PERNAH memberikan kata pengantar, basa-basi, atau kalimat pembuka seperti "Tentu, saya akan membantu..." atau "Berikut adalah dokumen...". LANGSUNG MULAI DENGAN JUDUL DOKUMEN HTML ("ALUR TUJUAN PEMBELAJARAN (ATP)"). Jangan ada teks apapun sebelum judul dokumen!`;

    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {}
        };

        try {
          send({ type: "stage", stage: 0, label: "Menganalisis konteks wawancara..." });

          let providerUsed = "Gemini";

          try {
            // STRATEGI 1: Gemini 2.0 Flash (Utama)
            send({ type: "stage", stage: 1, label: "Menyusun struktur dokumen ATP..." });

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContentStream(systemPrompt);

            send({ type: "stage", stage: 2, label: "AI sedang menulis konten detail..." });

            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullText += text;
                send({ type: "chunk", text });
              }
            }
          } catch (geminiError: any) {
            console.warn("Gemini 2.0 Flash gagal, mencoba Gemini 1.5 Flash...", geminiError);
            fullText = "";
            let isRateLimit = geminiError.message?.includes("429") || geminiError.message?.includes("Quota");

            try {
              send({ type: "stage", stage: 1, label: "Mencoba alternatif (Gemini 1.5 Flash)..." });

              const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
              const result = await model.generateContentStream(systemPrompt);

              send({ type: "stage", stage: 2, label: "AI sedang menulis konten detail..." });

              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                  fullText += text;
                  send({ type: "chunk", text });
                }
              }
              providerUsed = "Gemini 1.5 Flash";
            } catch (gemini15Error: any) {
              console.warn("Gemini 1.5 Flash gagal, mencoba DeepSeek...", gemini15Error);
              fullText = "";
              isRateLimit = isRateLimit || gemini15Error.message?.includes("429");

              try {
                send({ type: "stage", stage: 1, label: "Mencoba model terakhir (DeepSeek)..." });

                const completion = await deepseek.chat.completions.create({
                  messages: [{ role: "system", content: systemPrompt }],
                  model: "deepseek-chat",
                  stream: true,
                });

                send({ type: "stage", stage: 2, label: "AI sedang menulis konten detail..." });

                for await (const chunk of completion) {
                  const text = chunk.choices[0]?.delta?.content || "";
                  if (text) {
                    fullText += text;
                    send({ type: "chunk", text });
                  }
                }
                providerUsed = "DeepSeek";
              } catch (deepseekError: any) {
                console.error("DeepSeek juga gagal.");
                
                // Construct meaningful error
                let finalErrMsg = deepseekError.message || "Gagal menghubungi AI.";
                if (isRateLimit) {
                   finalErrMsg = "Kuota akses API Gemini Anda telah habis (Rate Limit / Quota Exceeded). Silakan tunggu sekitar 1 menit lalu coba lagi, atau gunakan akun API lain.";
                } else if (deepseekError.message?.includes("Balance")) {
                   finalErrMsg = "Saldo DeepSeek tidak mencukupi dan kuota Gemini habis.";
                }

                throw new Error(finalErrMsg);
              }
            }
          }

          // Simpan ke Database
          if (fullText.length > 0) {
            send({ type: "stage", stage: 3, label: "Menyimpan dokumen ke database..." });

            try {
              const [newDoc] = await db.insert(documents).values({
                title: `${type} - ${rawPrompt.substring(0, 30)}...`,
                type: type,
                userId: user.id,
                content: fullText,
                status: "Selesai",
                size: `${(fullText.length / 1024).toFixed(1)} KB`,
              }).returning();

              send({ type: "done", docId: newDoc.id, provider: providerUsed });
            } catch (dbError: any) {
              console.error("Database save error:", dbError);
              // Dokumen sudah ter-generate, cukup notifikasi saja
              send({ type: "done", docId: null, provider: providerUsed });
            }
          } else {
            send({ type: "error", message: "Tidak ada konten yang dihasilkan. Semua model AI gagal." });
          }

          controller.close();

        } catch (error: any) {
          console.error("Stream generation error:", error);
          // Jika sudah ada partial content, tetap kirim done
          if (fullText.length > 0) {
            send({ type: "done", docId: null, provider: "Partial" });
          } else {
            send({ type: "error", message: error.message || "Terjadi kesalahan saat generate" });
          }
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Critical stream error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
