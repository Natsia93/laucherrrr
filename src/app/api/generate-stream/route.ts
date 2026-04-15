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

    const body = await req.json();
    const { rawPrompt, type = "Dokumen Kurikulum", model: requestedModel = "deepseek" } = body;

    const atpSystemPrompt = `Anda adalah PAKAR SENIOR Kurikulum Merdeka Indonesia. Tugas Anda menyusun Alur Tujuan Pembelajaran (ATP) dengan tingkat presisi tinggi berdasarkan Keputusan Kepala BSKAP Nomor 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"
    
    === LOGIKA PERHITUNGAN JP & BAB (KRITIKAL) ===
    1. JP PER BAB: Angka JP di konteks adalah ALOKASI UNTUK SETIAP BAB.
    2. JUMLAH BAB: Jabarkan SEMUA BAB (Ganjil: 4-5 BAB, Tahunan: 8-10 BAB).
    
    === STRICT ENFORCEMENT (PENALTI JIKA MELANGGAR) ===
    - DILARANG menggunakan markdown code blocks (\`\`\`html).
    - DILARANG memberikan teks pembuka "Berikut adalah...". LANGSUNG MULAI DENGAN <div>.
    - DILARANG menggunakan gaya/style di luar yang ditentukan.
    - SEMUA paragraf narasi (Bagian A) WAJIB menggunakan style="text-align: justify; line-height: 1.6;".
    
    === ATURAN LAYOUT HTML (WAJIB CETAK PERSIS) ===
    1. HEADER IDENTITAS (WARNA UNGU):
       <div style="background-color: #d1c4e9; text-align: center; font-weight: bold; padding: 12px; border: 1px solid #b39ddb; margin-bottom: 20px; font-family: serif;">
         <div style="font-size: 14pt; border-bottom: 1px solid #7e57c2; display: inline-block; margin-bottom: 5px;">ALUR TUJUAN PEMBELAJARAN (ATP)</div>
         <div style="font-size: 12pt;">MATA PELAJARAN : [NAMA MAPEL]</div>
       </div>
       <table style="width: 100%; border: none; margin-bottom: 25px; font-weight: bold; font-size: 11pt; border-collapse: collapse; font-family: serif;">
         <tr><td style="width: 160px; border: none; padding: 4px;">Nama Sekolah</td><td style="width: 20px; border: none;">:</td><td style="border: none;">...................................................</td></tr>
         <tr><td style="border: none; padding: 4px;">Mata Pelajaran</td><td style="border: none;">:</td><td style="border: none;">[Nama Mapel]</td></tr>
         <tr><td style="border: none; padding: 4px;">Kelas / Semester</td><td style="border: none;">:</td><td style="border: none;">[Kelas] / [Semester]</td></tr>
         <tr><td style="border: none; padding: 4px;">Tahun Pelajaran</td><td style="border: none;">:</td><td style="border: none;">20... / 20...</td></tr>
       </table>

    2. BAGIAN A (CP 046/2025): 
       Gunakan <div style="background-color: #e0e0e0; font-weight: bold; padding: 8px; font-size: 12pt; margin-bottom: 12px; border: 1px solid #ccc; font-family: serif;">A. PEMAHAMAN CAPAIAN PEMBELAJARAN (CP)</div>
       Narasi Pemahaman minimal 250 kata dalam tag <p style="text-align: justify;">.

    3. BAGIAN B (TABEL ATP COLORFUL):
       Header tabel background #fae3e3. 
       Baris Judul BAB WAJIB: <tr style="background-color: #e6f7ff; font-weight: bold; text-align: center;"><td colspan="5">BAB [X]: [JUDUL]</td></tr>
       Kolom: No | Alur Tujuan Pembelajaran | Dimensi Profil Lulusan | Materi Pokok (Highlight Kuning) | Alokasi Waktu.

    TANDA TANGAN: Tabel border none di akhir dok, text-align center.
    TOTAL DOKUMEN MINIMAL 1500 KATA.`;

    const isArabic = rawPrompt.toLowerCase().includes("bahasa arab") || rawPrompt.toLowerCase().includes("pondok") || rawPrompt.toLowerCase().includes("tasykil");

    const lkpdSystemPrompt = `Tugas Anda adalah membuat Lembar Kerja Peserta Didik (LKPD) profesional dan estetik.
    
    KONTEKS GURU: "${rawPrompt}"

    === ATURAN TEKNIS ===
    1. Gunakan Layout Kop Surat yang rapi.
    2. Gunakan Border Tebal untuk Judul.
    3. MODE BAHASA: ${isArabic ? "WAJIB SERTAKAN HAROKAT/TASYKIL LENGKAP PADA SETIAP KATA ARAB." : "Bahasa Indonesia formal."}
    4. Selesaikan soal sesuai urutan: PG, Singkat, Esai.
    `;

    const cpSystemPrompt = `Anda adalah PAKAR Kurikulum Merdeka menyusun Capaian Pembelajaran (CP) 046/H/KR/2025.
    
    === ATURAN LAYOUT ===
    1. HEADER (WARNA LAVENDER): 
       <div style="background-color: #e6e6fa; text-align: center; border: 1px solid #d1d1e0; padding: 15px; margin-bottom: 25px;">
         <h1 style="margin: 0; font-size: 14pt;">CAPAIAN PEMBELAJARAN (NOMOR 046/H/KR/2025)</h1>
         <h2 style="margin: 5px 0 0 0; font-size: 13pt;">[NAMA MATA PELAJARAN]</h2>
       </div>
    
    2. RASIONAL & TUJUAN: Narasi panjang minimal 500 kata.
    3. TABEL ELEMEN: Border hitam tebal, header background putih.
    4. TOTAL KATA MINIMAL 2000.`;

    const protaSystemPrompt = `Anda menyusun Program Tahunan (PROTA) Kurikulum Merdeka.
    
    === ATURAN LAYOUT ===
    1. HEADER (WARNA UNGU): 
       <div style="background-color: #ccb9db; text-align: center; border: 1.5px solid #b3a2c7; padding: 10px; margin-bottom: 20px;">
         <h1 style="margin: 0; font-size: 14pt; font-weight: bold; text-decoration: underline;">PROGRAM TAHUNAN (PROTA)</h1>
       </div>
    2. TABEL IDENTITAS: Seperti format ATP.
    3. TABEL PROTA: Header #8db4e2. Baris BAB #daeef3 (text-align: center). Materi highlight kuning.
    4. CAKUPAN: Ganjil & Genap (7-10 BAB).`;

    const prosemSystemPrompt = `Anda menyusun Program Semester (PROSEM) Kurikulum Merdeka.
    
    === ATURAN LAYOUT ===
    1. HEADER (WARNA LAVENDER): 
       <div style="background-color: #e6e6fa; text-align: center; border: 1.5 solid #d1d1e0; padding: 10px; margin-bottom: 20px;">
         <h1 style="margin: 0; font-size: 13pt;">PROGRAM SEMESTER (PROSEM)</h1>
       </div>
    2. TABEL PROSEM: Header bertingkat (Bulan & Minggu 1-5). Gunakan sel-sel kecil untuk tanda "V".
       Background header #f2f2f2. Baris BAB #e6f7ff (text-align: center).
    3. WAJIB ADA baris STS dan SAS di akhir tabel (Abu-abu).`;

    const kktpSystemPrompt = `Anda menyusun Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
    
    === ATURAN LAYOUT ===
    1. HEADER (WARNA UNGU): 
       <div style="background-color: #ccb9db; text-align: center; border: 1.5 solid #b3a2c7; padding: 10px; margin-bottom: 20px;">
         <h1 style="margin: 0; font-size: 14pt; font-weight: bold; text-decoration: underline;">KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</h1>
       </div>
    2. TABEL KKTP: Header #f2f2f2. Sub-header Interval #e6e6fa. Baris BAB #fbd5b5 (text-align: center).
    3. MATERI: Highlight kuning. Interval 0-40%, 41-65%, 66-85%, 86-100%.`;

    const isType = (t: string) => type.includes(t) || t.includes(type);

    const systemPrompt = isType("Program Semester") || isType("PROSEM") ? prosemSystemPrompt : 
                        (isType("Program Tahunan") || isType("PROTA") ? protaSystemPrompt : 
                        (isType("KKTP") ? kktpSystemPrompt : 
                        (isType("Capaian Pembelajaran") || isType("CP") ? cpSystemPrompt : 
                        (isType("LKPD") ? lkpdSystemPrompt : atpSystemPrompt))));
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {}
        };

        try {
          send({ type: "stage", stage: 0, label: "Menganalisis konteks..." });

          let providerUsed = requestedModel === "deepseek" ? "DeepSeek" : "Gemini";

          const attemptGemini = async (modelName: string) => {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContentStream(systemPrompt);
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullText += text;
                send({ type: "chunk", text });
              }
            }
          };

          const attemptDeepSeek = async () => {
            const completion = await deepseek.chat.completions.create({
              messages: [{ role: "system", content: systemPrompt }],
              model: "deepseek-chat", 
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                fullText += text;
                send({ type: "chunk", text });
              }
            }
          };

          const runFlow = async () => {
             try {
                if (requestedModel === "deepseek") {
                    send({ type: "stage", stage: 1, label: "Menyusun dengan DeepSeek..." });
                    await attemptDeepSeek();
                    providerUsed = "DeepSeek V3";
                } else {
                    send({ type: "stage", stage: 1, label: "Menyusun dengan Gemini..." });
                    await attemptGemini("gemini-2.0-flash");
                    providerUsed = "Gemini 2.0 Flash";
                }
             } catch (err) {
                console.error("Primary model failed:", err);
                fullText = "";
                try {
                    send({ type: "stage", stage: 1, label: "Mencoba fallback..." });
                    if (requestedModel === "deepseek") {
                        await attemptGemini("gemini-2.0-flash");
                        providerUsed = "Gemini 2.0 Flash (Fallback)";
                    } else {
                        await attemptGemini("gemini-1.5-flash");
                        providerUsed = "Gemini 1.5 Flash (Fallback)";
                    }
                } catch (err2) {
                   fullText = "";
                   send({ type: "stage", stage: 1, label: "Mencoba pilihan terakhir..." });
                   if (requestedModel === "deepseek") {
                       await attemptGemini("gemini-1.5-flash");
                   } else {
                       await attemptDeepSeek();
                       providerUsed = "DeepSeek V3 (Fallback)";
                   }
                }
             }
          };

          await runFlow();

          if (fullText.length > 0) {
            send({ type: "stage", stage: 3, label: "Menyimpan ke database..." });
            
            // Clean up common AI prefixes if they leaked
            let cleanedText = fullText.trim();
            if (cleanedText.startsWith("```html")) {
              cleanedText = cleanedText.replace(/^```html/, "").replace(/```$/, "").trim();
            }
            if (cleanedText.startsWith("Berikut") || cleanedText.startsWith("\"") || cleanedText.startsWith("`")) {
              const firstTag = cleanedText.indexOf("<div");
              if (firstTag !== -1) {
                cleanedText = cleanedText.substring(firstTag);
              }
            }

            const [newDoc] = await db.insert(documents).values({
              title: `${type} - ${rawPrompt.substring(0, 30)}`,
              type: type,
              userId: session.user.id,
              content: cleanedText,
              status: "Selesai",
              size: `${(cleanedText.length / 1024).toFixed(1)} KB`,
            }).returning();
            send({ type: "done", docId: newDoc.id, provider: providerUsed });
          } else {
            send({ type: "error", message: "Semua model AI gagal menghasilkan konten." });
          }
          controller.close();
        } catch (error: any) {
          send({ type: "error", message: error.message || "Terjadi kesalahan fatal" });
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}