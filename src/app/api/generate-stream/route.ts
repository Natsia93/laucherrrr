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

    const atpSystemPrompt = `Anda adalah PAKAR SENIOR Kurikulum Merdeka Indonesia dengan keahlian mendalam dalam penyusunan Alur Tujuan Pembelajaran (ATP) berdasarkan Keputusan Kepala BSKAP Nomor 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"
    
    === LOGIKA PERHITUNGAN JP & BAB (KRITIKAL) ===
    1. JP PER BAB: Angka "Jam Pelajaran (JP)" yang ada di konteks adalah ALOKASI JP UNTUK SETIAP BAB.
    2. JUMLAH BAB: Anda harus menjabarkan SEMUA BAB yang ada dalam periode yang diminta (Semester Ganjil, Genap, atau Tahunan).
       - Jika 1 Semester: Berikan MINIMAL 3 hingga 5 BAB lengkap.
       - Jika Tahunan (Ganjil & Genap): Berikan MINIMAL 7 hingga 10 BAB lengkap.
    3. TOTAL JP: AI harus menghitung secara logis. Jika JP per Bab = 12, dan ada 5 Bab, maka Total JP dokumen adalah 60 JP.
    
    === ATURAN KECERDASAN (WAJIB) ===
    ADAPTASI MAPEL UNIVERSAL: Menyesuaikan elemen CP dengan mata pelajaran yang diminta (IPA, Matematika, Bahasa, Fiqih, dll). JANGAN gunakan elemen IPA secara default.
    
    ATURAN KONTEN:
    - Narasi Pemahaman CP di Bagian A: MINIMAL 200 kata, ditulis dalam paragraf utuh, bahasa akademis-formal sesuai CP 046/2025.
    - Tabel ATP Bagian B: Setiap baris kolom "Alur Tujuan Pembelajaran" harus berisi kalimat lengkap yang dimulai dengan kata kerja operasional (Menganalisis, Mendeskripsikan, dsb).
    - Materi Pokok di-highlight kuning.
    - Alokasi Waktu harus konsisten dengan "JP per Bab" yang diminta.
    - TOTAL DOKUMEN MINIMAL 1500 KATA.

    TANDA TANGAN: Selalu akhiri dengan blok tanda tangan formal.

    === ATURAN LAYOUT HTML (CETAK PERSIS) ===
    1. HEADER: Gunakan background #d1c4e9 untuk judul. Tampilkan Nama Sekolah, Mapel, Kelas/Semester (Sesuai Konteks), dan Tahun Pelajaran.
    2. BAGIAN A: Header background #e0e0e0. Narasi pemahaman panjang + elemen.
    3. BAGIAN B: Header tabel #fae3e3. Baris BAB background #e6f7ff.
    4. TANDA TANGAN di akhir.`;

    const isArabic = rawPrompt.toLowerCase().includes("bahasa arab") || rawPrompt.toLowerCase().includes("pondok") || rawPrompt.toLowerCase().includes("tasykil");

    const lkpdSystemPrompt = `Tugas Anda adalah membuat Lembar Kerja Peserta Didik (LKPD) profesional dan estetik.
    
    KONTEKS GURU: "${rawPrompt}"

    === ATURAN TEKNIS (SANGAT PENTING) ===
    1. LANGSUNG MULAI DENGAN TAG <div>.
    2. MODE BAHASA: ${isArabic ? "WAJIB SERTAKAN HAROKAT/TASYKIL LENGKAP PADA SETIAP KATA ARAB." : "Bahasa Indonesia formal."}
    3. STRUKTUR: Pilih jenis soal (PG, Singkat, Esai) sesuai permintaan jumlah soal di konteks.
    4. MATERI: Berikan materi dan soal yang mendalam sesuai Capaian Pembelajaran terbaru.
    `;

    const cpSystemPrompt = `Anda adalah PAKAR SENIOR Kurikulum Merdeka Indonesia yang menyusun dokumen Capaian Pembelajaran (CP) sesuai Keputusan Nomor 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"
    
    === ATURAN KONTEN (WAJIB) ===
    1. RASIONAL: MINIMAL 4 paragraf besar mengenai urgensi mapel.
    2. TUJUAN & KARAKTERISTIK: Penjelasan mendalam tentang pendekatan pembelajaran.
    3. TABEL ELEMEN: Minimal 4 elemen dengan deskripsi padat (100+ kata per elemen).
    4. CP PER FASE: Jabarkan CP Fase yang diminta secara utuh dan detail, mencakup semua kompetensi esensial.
    
    === LAYOUT HTML ===
    1. Header background #e6e6fa.
    2. Tabel Elemen border hitam tebal.
    3. TOTAL KATA MINIMAL 2000.
    `;

    const protaSystemPrompt = `Anda adalah PAKAR SENIOR yang menyusun Program Tahunan (PROTA) berdasarkan CP 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"

    === LOGIKA JP & MATERI ===
    - JP per Bab: Angka JP di konteks adalah alokasi per BAB.
    - Cakupan: Karena ini Program TAHUNAN, Anda WAJIB menjabarkan materi Ganjil DAN Genap secara lengkap (MINIMAL 8-10 BAB).
    - Distribusi JP harus proporsional untuk satu tahun pelajaran.

    === LAYOUT HTML ===
    - Header background #ccb9db.
    - Tabel dengan kolom No, ATP, Materi, Alokasi Waktu, Semester.
    - Header BAB background #daeef3.
    `;

    const prosemSystemPrompt = `Anda adalah PAKAR SENIOR yang menyusun Program Semester (PROSEM) berdasarkan CP 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"
    
    === KALENDER & JP ===
    - Jika Ganjil: Juli-Desember. Jika Genap: Januari-Juni.
    - Jabarkan SEMUA BAB yang ada dalam semester tersebut (MINIMAL 4-5 BAB).
    - Angka JP di konteks adalah JP PER BAB. Tebarkan tanda "V" pada minggu-minggu aktif secara logis.
    - WAJIB ada baris STS dan SAS di akhir tabel.

    === LAYOUT HTML ===
    - Header background #e6e6fa.
    - Tabel header bertingkat (Bulan & Minggu 1-5).
    `;

    const kktpSystemPrompt = `Anda adalah PAKAR SENIOR yang menyusun Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) berdasarkan CP 046/H/KR/2025.
    
    Permintaan Guru: "${rawPrompt}"
    
    === KONTEN ===
    - Jabarkan SEMUA BAB/Materi untuk semester yang diminta (MINIMAL 4-5 BAB).
    - Untuk setiap BAB, berikan indikator ketercapaian yang detail.
    - Gunakan format Interval Nilai: 0-40%, 41-65%, 66-85%, 86-100%.

    === LAYOUT HTML ===
    - Header background #ccb9db.
    - Tabel Skala Interval background #e6e6fa.
    `;

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