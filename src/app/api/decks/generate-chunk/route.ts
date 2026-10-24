import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

interface OutlineItem {
  slideNumber: number;
  headline: string;
  subheadline?: string;
  visualLayout?: string;
  description?: string;
  bullets?: string[];
  speakerNotes?: string;
}

const CHUNK_SYSTEM_PROMPT = `
You are the elite Master Slide Worker Engine for Launcher OS (McKinsey, Bain, ITB, and Apple executive standards).
Your task is to generate full, richly detailed slide objects for a SPECIFIC BATCH of slides in an executive deck.

=== UNIVERSAL SLIDE CONTRACT (FOR CLAUDE, DEEPSEEK, GPT, & GEMINI) ===
For each slide outline provided in the batch, pick the layout that matches the outline's visualLayout and generate a complete JSON object adhering strictly to the Launcher OS SlideData contract:

AVAILABLE MASTER LAYOUTS & THEIR DATA SCHEMAS:
1. "sectionDivider" (Section / Module / Part transition):
   - title: e.g. "Bagian 1: Memahami Risiko", subtitle: "Apa yang dilindungi dan bagaimana serangan berjalan", bgStyle: "boldYellow"
2. "pairedRows" (Problem vs Solution, Threat vs Response, Weak vs Robust):
   - title: ACTION CLAIM (e.g. "Ancaman umum dan respons teruji bagi pemimpin")
   - pairedRows: [
       { "left": "Phishing: email palsu meminta data atau transfer uang", "right": "Verifikasi lewat kanal kedua sebelum otorisasi", "leftLead": "ANCAMAN", "rightLead": "RESPONS" },
       { "left": "Kata sandi lemah atau dipakai berulang di berbagai akun", "right": "Wajibkan MFA berbasis aplikasi dan pengelola sandi korporat", "leftLead": "ANCAMAN", "rightLead": "RESPONS" },
       { "left": "Ransomware mengunci cadangan data operasional", "right": "Pemisahan backup offline (air-gapped) dan simulasi pemulihan berkala", "leftLead": "ANCAMAN", "rightLead": "RESPONS" }
     ]
3. "horizontalStack" (Core Tenets, Strategic Pillars, CIA Triad):
   - title: e.g. "Tiga pilar keamanan informasi sebagai fondasi keputusan data"
   - stackCards: [
       { "title": "Kerahasiaan", "tag": "CONFIDENTIALITY", "description": "Hanya pihak berwenang yang dapat mengakses data dan laporan strategis organisasi." },
       { "title": "Integritas", "tag": "INTEGRITY", "description": "Data tetap akurat, konsisten, dan tidak diubah tanpa otorisasi terverifikasi." },
       { "title": "Ketersediaan", "tag": "AVAILABILITY", "description": "Sistem dan data dapat diakses seketika saat dibutuhkan untuk pengambilan keputusan." }
     ]
4. "connectedRailStepper" (Continuous Rail Process, Attack Chain, Incident Response):
   - title: e.g. "Rantai serangan siber: deteksi dini membatasi eskalasi"
   - railSteps: [
       { "stepNumber": 1, "title": "Pengintaian", "description": "Penyerang memetakan sasaran dan celah keamanan sistem." },
       { "stepNumber": 2, "title": "Akses Awal", "description": "Penyusupan lewat phishing kredensial atau kerentanan perangkat." },
       { "stepNumber": 3, "title": "Eskalasi", "description": "Peningkatan hak akses untuk menguasai server utama." },
       { "stepNumber": 4, "title": "Eksfiltrasi", "description": "Penyalinan atau penguncian data sensitif organisasi." }
     ]
5. "ascendingColumns" (Capability Maturity Levels, CMMI, Tiered Escalation):
   - title: e.g. "Tingkat kematangan postur keamanan siber organisasi"
   - ascendingLevels: [
       { "levelNumber": "L1", "title": "Reaktif", "description": "Penanganan insiden ad-hoc tanpa prosedur baku", "tag": "DASAR" },
       { "levelNumber": "L2", "title": "Terdefinisi", "description": "Kebijakan SOP tertulis dan MFA diterapkan menyeluruh", "tag": "STANDAR" },
       { "levelNumber": "L3", "title": "Proaktif", "description": "Simulasi red-team dan pemantauan ancaman otomatis 24/7", "tag": "ADVANCED" }
     ]
6. "checklist" (Governance & Readiness Checklist, Pre-Launch Verification):
   - title: e.g. "Daftar periksa kesiapan tata kelola dan kepatuhan data"
   - checklistItems: [
       "Audit hak akses akun administratif dilakukan setiap kuartal",
       "Klasifikasi data rahasia dipatuhi pada seluruh alat kerja AI",
       "Uji pemulihan cadangan data (disaster recovery) terbukti dalam 4 jam",
       "Perjanjian keamanan vendor pihak ketiga telah ditandatangani"
     ]
7. "closingAction" (Final Action Plan / Executive Mandate):
   - title: e.g. "Tiga tindakan nyata minggu ini untuk pemimpin"
   - subtitle: "Langkah konkret yang dapat dimulai hari ini tanpa birokrasi panjang."
   - actionItems: [
       { "verb": "01", "text": "Aktifkan MFA pada seluruh akun email dan dokumen pimpinan." },
       { "verb": "02", "text": "Verifikasi tanggal terakhir pengujian pemulihan backup operasional." },
       { "verb": "03", "text": "Sepakati aturan tegas klasifikasi data yang dilarang diunggah ke AI publik." }
     ]
   - contactFooterText: "Kanal pelaporan insiden atau asistensi: security-desk@organisasi.id"
   - bgStyle: "boldYellow"
8. "chevronProcess" (5-Step Alternating Process with Descriptions & Diagnostic Status Pills):
   - title: e.g. "How Leaders Decide: The Five-Step Cycle"
   - subtitle: "Every decision, big or small, moves through the same five steps"
   - chevronSteps: [
       { "title": "1 · Frame", "description": "Define the problem, goal and constraints", "pill": "Fails here: wrong question", "pillType": "blue" },
       { "title": "2 · Gather", "description": "Collect facts, evidence and options" },
       { "title": "3 · Evaluate", "description": "Weigh options against criteria and risk", "pill": "Rarely where it fails", "pillType": "neutral" },
       { "title": "4 · Decide", "description": "Commit to one option and own it" },
       { "title": "5 · Act & Learn", "description": "Execute, measure the result, adjust", "pill": "Fails here: no learning", "pillType": "blue" }
     ]
   - insightBarText: "Key insight: Most bad decisions fail at step 1 (wrong question) or step 5 (no learning), not at step 3."
9. "formulaHero" (Hero Equation Banner + 3 Factor Columns + 1 Big Accent Stat Box):
   - title: e.g. "The Same Cycle, Now in Hours"
   - subtitle: "What AI compresses: speed, cost and risk."
   - formulaData: {
       "formulaLabel": "THE FORMULA",
       "formula": "Decision Impact = Speed × Scale × Confidence",
       "formulaSubtext": "AI raises all three at once, for opportunity and risk alike.",
       "factors": [
         { "title": "Speed", "description": "From periodic review to continuous decisions" },
         { "title": "Cost", "description": "One more analysis costs almost nothing; one wrong decision costs a lot" },
         { "title": "Risk", "description": "Low-stakes move to AI; high-stakes decisions carry more weight than ever" }
       ],
       "statBox": {
         "value": "61%",
         "description": "of managers say at least half their decision-making time is ineffective",
         "source": "McKinsey Quarterly, May 2019, 1,200+ managers"
       }
     }
10. "quadrantMatrix" (2x2 Decision Classification Matrix with Labeled Axes):
    - title: e.g. "The Decision Classification Matrix"
    - subtitle: "Vertical axis: accountability and ethical weight. Horizontal axis: how rich and reliable your data is."
    - quadrantData: {
        "yAxisTop": "High stakes",
        "yAxisBottom": "Low stakes",
        "xAxisLeft": "Low data richness",
        "xAxisRight": "High data richness",
        "q1": [{ "title": "Human judgment only", "subtitle": "You decide. AI may inform, but does not drive the call." }],
        "q2": [{ "title": "Augment with AI", "subtitle": "AI proposes. You stress-test it, decide and own the reasoning." }],
        "q3": [{ "title": "Automate with caution", "subtitle": "Automate the routine, but sample and audit the results." }],
        "q4": [{ "title": "Delegate to AI", "subtitle": "AI decides within rules you set. You monitor and audit." }]
      }
11. "treeComparison" (Correlation vs Causation Tree Cards with Top Metric Pill & Bottom Takeaway):
    - title: e.g. "Correlation ≠ Causation, in One Slide"
    - subtitle: "Critical reasoning framework for data-driven decisions"
    - treeData: {
        "topCallout": { "stat": "3.2×", "label": "higher LTV for app users", "note": "Push everyone to the app? No: engagement drives both." },
        "cards": [
          { "title": "Selection bias", "rootNode": "Motivation", "childNodes": ["Joins training", "Better results"], "description": "Volunteers for a training program were already more motivated" },
          { "title": "Reverse causation", "rootNode": "Revenue growth", "childNodes": ["Hiring", "Expansion"], "description": "Revenue growth enables hiring, not the other way round" },
          { "title": "Spurious correlation", "rootNode": "Third factor", "childNodes": ["Metric A", "Metric B"], "description": "Two metrics rise together because of a third factor, e.g. economic expansion" }
        ],
        "bottomTakeaway": "Ask before acting on any correlation: \"Is there a plausible story where something else causes both X and Y?\""
      }
12. "caseExercise" (Case Study Scenario + Metric Tiles + Twist Warning + 3-Line Exercise Sheet):
    - title: e.g. "Case: Dian's Meter-Replacement Queue"
    - subtitle: "10 minutes, individual → pairs"
    - badge: "MID-LECTURE CASE · HANDS-ON"
    - exerciseData: {
        "situationTitle": "SITUATION",
        "situationText": "PT Cahaya Energi Nusantara replaces about 200 smart meters a month. Today the queue is set by meter age. A vendor offers an AI model that ranks meters by failure risk using 3 years of outage logs. Dian Pratama, Head of Operations, must decide how to use it.",
        "dataMetrics": [
          { "value": "18,400", "label": "meters in service" },
          { "value": "2023–2025", "label": "outage logs cover these years" },
          { "value": "6%", "label": "unrecorded installation date" }
        ],
        "twistBox": "two hospitals and a water-treatment plant are on feeders served by the oldest meters.",
        "exerciseTitle": "WHAT TO WRITE · 3 LINES",
        "exerciseLines": [
          "Which AIDM mode fits the monthly replacement queue? Why?",
          "Which part of the decision must stay Override, and why?",
          "One escalation rule the AI must follow."
        ]
      }
13. "pyramidHierarchy" (3-Tier Strategic Apex Pyramid):
    - title: e.g. "Arsitektur Strategis: Dari Visi ke Eksekusi Enabler"
    - cards: [
        { "title": "Pemimpin Pasar & Margin 35%", "subtitle": "Tujuan North Star", "tag": "APEX" },
        { "title": "Pipeline Keputusan Otonom", "subtitle": "Pilar Strategis", "bullets": ["Skoring Otomatis", "Logistik Real-Time"], "tag": "STRATEGI" },
        { "title": "Fondasi Data & Zero-Trust", "subtitle": "Kapabilitas Enabler", "bullets": ["Data Lakehouse", "SOP Kepatuhan"], "tag": "FONDASI" }
      ]
14. "transformationBridge" (As-Is Friction → Transformation Engine → To-Be Target):
    - title: e.g. "Pergeseran Paradigma Operasional Menuju AI Otonom"
    - pairedRows: [
        { "left": "Silo data terfragmentasi di 5 divisi", "right": "Telemetri terpadu & visibilitas eksekutif real-time" },
        { "left": "Persetujuan manual 10 hari kerja", "right": "Eksekusi sub-jam dengan pengawasan AI" },
        { "left": "Respons risiko reaktif pasca-insiden", "right": "Pencegahan proaktif & audit kepatuhan 99.9%" }
      ]
    - highlight: "Engine Transformasi: AI Decision Fabric"
15. "radialHub" (Core Orchestration Hub + 4 Surrounding Operational Satellites):
    - title: e.g. "Ekosistem Tata Kelola & Pengendalian AI Terintegrasi"
    - highlight: "Pusat Kendali Otonom"
    - cards: [
        { "title": "Kepatuhan & Etika", "description": "Audit berkelanjutan terhadap regulasi data", "tag": "HUKUM" },
        { "title": "Keamanan & Ketahanan", "description": "Deteksi ancaman dan failover otomatis", "tag": "SEKURITI" },
        { "title": "Modal & Pendapatan", "description": "Model ROI prediktif untuk setiap alokasi", "tag": "FINANSIAL" },
        { "title": "Budaya & Talenta", "description": "Pemberdayaan tim dengan pagar batas algoritmik", "tag": "OPERASIONAL" }
      ]
16. "twoColumn" / "cardGrid":
    - title: Action headline
    - bullets: ["Pilar 1: Analisis mendalam...", "Pilar 2: Dampak eksekutif...", "Pilar 3: Mitigasi risiko..."]
17. "tableComparison": tableHeaders: ["Dimensi", "Saat Ini", "Target Masa Depan"], tableRows: [{ feature: "MFA", current: "Opsional", proposed: "Wajib 100%" }]
18. "hero": Opening cover slide with title, subtitle, and badge.
19. "splitComparison" (MANDATORY FOR WORKED EXAMPLES & CASE COMPARISONS ON SPLIT BACKGROUND):
    - title: Action title (e.g. "When the Leader Stops Dispatching and Starts Designing")
    - subtitle: Subtitle context (e.g. "Case · Gojek's real-time driver allocation")
    - beforeCard: { "title": "BEFORE AI", "bullets": ["Rule-based dispatch and human coordination across hundreds of concurrent requests.", "Bottleneck: human bandwidth caps matching quality.", "Leaders make allocation decisions."] }
    - afterCard: { "title": "AFTER AI", "bullets": ["ML allocation optimises several objectives at once.", "Gojek reported over 1 million extra completed trips within weeks with gains in driver utilisation.", "Leaders set pricing logic, fairness guardrails and escalation rules."] }
    - insightBarText: "Key insight: AI didn't replace the leader. It changed what the leader decides."
20. "splitProfile" (Speaker / Facilitator Profile on Split Background):
    - title: e.g. "Titah Yudhistira, S.T., M.T., Ph.D."
    - subtitle: "Facilitator"
    - profileData: { "tag": "SPEAKER PROFILE", "role": "Head of AI Lab & Assistant Professor, ITB", "bio": "Expertise in algorithmic decision systems, optimization, and human-in-the-loop AI governance with 15+ years of industrial advisory." }
21. "sectionDivider" (Pure Full-Bleed Chapter Transition on Solid Blue):
    - badge: "PART 1" or "PART 2"
    - title: e.g. "Core Strategic Foundations & Economic Models"
    - subtitle: "Establishing baseline metrics and investment discipline for AI transformation"

UNIVERSAL HIGHLIGHT & NOTE STRIPS:
- insightBarText: (Optional) 1 punchy sentence summarizing the executive takeaway.
- noteBoxText: (Optional) 1 facilitator advice or caution note.

REQUIRED UNIVERSAL FIELDS:
- id: unique string (e.g. "slide-1")
- layout: one of the valid layouts above
- title: ACTION TITLE (5-9 words). Never end with a period!
- subtitle: crisp strategic context or transition
- speakerNotes: MANDATORY 2-4 sentences of executive speaking guidance.

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array containing the detailed slide objects for THIS BATCH.
No markdown backticks, no explanatory comments.

=== LANGUAGE RULE (SUPREME PRIORITY) ===
If the user's content or outline explicitly requests a specific language (e.g. "in English", "bahasa inggris"), ALL generated text — titles, subtitles, descriptions, pairedRows content, stackCards content, railSteps content, checklistItems, actionItems, speakerNotes — MUST be written ENTIRELY in that requested language. Do NOT mix languages. The user's language instruction ALWAYS overrides any template examples above.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chunkIndex = 0,
      totalChunks = 1,
      slidesToGenerate = [],
      deckContext = {},
      apiKey,
      provider = "gemini",
      model: requestedModel,
    } = body;

    const outlines: OutlineItem[] = slidesToGenerate;
    if (!outlines || outlines.length === 0) {
      return NextResponse.json({ success: false, error: "No slides in this chunk" }, { status: 400 });
    }

    const {
      audience = "Executives & C-Level",
      purpose = "Strategy & Framework",
      density = "medium",
      bgStylePreference = "mixed",
      customBgColors,
      templateRulesMarkdown = "",
      templateName = "",
      clonedStyleDirectives = "",
      clonedReferenceSummary = "",
    } = deckContext;

    let rulesDoc = (templateRulesMarkdown || clonedStyleDirectives || "").trim();
    const effectiveTemplateName = templateName || "ITB × RevoU Deck Design System";

    if (!rulesDoc) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const skillPath = path.join(process.cwd(), ".agents/skills/itb-deck-design-rules/SKILL.md");
        rulesDoc = await fs.readFile(skillPath, "utf-8");
      } catch (err) {
        console.warn("Could not load default ITB skill file in generate-chunk:", err);
      }
    }

    // ──── LANGUAGE DETECTION from outline content ────
    const outlineText = JSON.stringify(outlines);
    const allText = `${outlineText} ${templateRulesMarkdown} ${clonedStyleDirectives}`;
    let detectedLanguage = "";
    if (/(?:in\s+english|bahasa\s*inggris|dalam\s*(?:bahasa\s*)?inggris|use\s+english|english\s+(?:language|version|deck|presentation)|LANGUAGE.*English)/i.test(allText)) {
      detectedLanguage = "English";
    }
    // Also detect from headline language: if all headlines are English
    const headlinesSample = outlines.map((o: OutlineItem) => o.headline || "").join(" ");
    if (!detectedLanguage && /^[A-Za-z0-9\s\-:,;&'"!?()]+$/.test(headlinesSample) && headlinesSample.length > 20) {
      detectedLanguage = "English";
    }
    const languageDirective = detectedLanguage
      ? `\n⚠️ MANDATORY LANGUAGE: ALL generated text MUST be in ${detectedLanguage}. Match the language of the outline headlines. Do NOT translate to Indonesian or any other language.\n`
      : "";

    const userPrompt = `
BATCH DETAILS:
- Processing Chunk: ${chunkIndex + 1} of ${totalChunks}
- Slides in this batch: ${outlines.length} slides (${outlines.map((o) => `Slide #${o.slideNumber}`).join(", ")})

DECK CONTEXT:
- Audience: ${audience}
- Purpose: ${purpose}
- Density: ${density}
- Background Rhythm: ${bgStylePreference}
${customBgColors ? `- Custom Palette: Primary ${customBgColors.color1}, Secondary ${customBgColors.color2}, Accent ${customBgColors.color3}` : ""}

${rulesDoc.length > 0 ? `
================================================================================
👑 GOVERNING DESIGN CONTRACT & ARCHITECTURAL RULES (.MD) (UNABRIDGED & MANDATORY):
Source Document: ${templateName || "Institutional Design Specification"}
================================================================================
${rulesDoc}
================================================================================
MANDATORY COMPLIANCE INSTRUCTIONS:
- Faithfully study and execute the governing .md document above in its entirety.
- Every slide in this batch MUST strictly adhere to the visual layout assigned in the OUTLINE BLUEPRINT.
- Never downgrade or alter layouts to generic bullets. If the outline specifies:
  * "Paired Rows" -> output "layout": "pairedRows" with "pairedRows": [...]
  * "Horizontal Stack" -> output "layout": "horizontalStack" with "stackCards": [...]
  * "Connected Stepper" -> output "layout": "connectedRailStepper" with "railSteps": [...]
  * "Ascending Columns" -> output "layout": "ascendingColumns" with "ascendingLevels": [...]
  * "Checklist" -> output "layout": "checklist" with "checklistItems": [...]
  * "Closing Action" -> output "layout": "closingAction" with "actionItems": [...] and "contactFooterText"
  * "Section Divider" -> output "layout": "sectionDivider" with "bgStyle": "boldYellow"
- Strictly adhere to the typography floor: content text must be substantive, informative, and never placeholder brackets.
` : ""}

OUTLINE BLUEPRINT FOR THIS BATCH:
${JSON.stringify(outlines, null, 2)}
${languageDirective}
Generate exactly ${outlines.length} complete, production-ready slide objects for this batch in strict JSON array format.
`;

    // 1. Try Gemini
    const geminiKey = (apiKey && provider === "gemini" ? apiKey : null) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.25,
          },
        });

        const result = await model.generateContent([CHUNK_SYSTEM_PROMPT, userPrompt]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((s: any, idx: number) => {
            const outline = outlines[idx];
            return {
              ...s,
              id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
              slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
              speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
              backgroundImage: s.backgroundImage || resolveSlideBackgroundForChunk(
                s.layout || outline?.visualLayout || "",
                s.title || outline?.headline || "",
                outline?.slideNumber || (chunkIndex * outlines.length + idx + 1),
                totalChunks * outlines.length
              ),
            };
          });

          return NextResponse.json({
            success: true,
            chunkIndex,
            slides: sanitized,
            source: "gemini-chunk",
          });
        }
      } catch (gemErr: any) {
        console.warn(`Chunk ${chunkIndex} Gemini error:`, gemErr?.message);
      }
    }

    // 2. Try OpenAI / DeepSeek
    const openAiKey = (apiKey && (provider === "openai" || provider === "deepseek") ? apiKey : null) || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    const isDeepseek = provider === "deepseek" || (!process.env.OPENAI_API_KEY && process.env.DEEPSEEK_API_KEY);

    if (openAiKey) {
      try {
        const client = new OpenAI({
          baseURL: isDeepseek ? "https://api.deepseek.com" : "https://api.openai.com/v1",
          apiKey: openAiKey,
        });

        const res = await client.chat.completions.create({
          model: requestedModel || (isDeepseek ? "deepseek-chat" : "gpt-4o-mini"),
          temperature: 0.25,
          messages: [
            { role: "system", content: CHUNK_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        });

        const raw = res.choices[0]?.message?.content || "";
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((s: any, idx: number) => {
            const outline = outlines[idx];
            return {
              ...s,
              id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
              slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
              speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
              backgroundImage: s.backgroundImage || resolveSlideBackgroundForChunk(
                s.layout || outline?.visualLayout || "",
                s.title || outline?.headline || "",
                outline?.slideNumber || (chunkIndex * outlines.length + idx + 1),
                totalChunks * outlines.length
              ),
            };
          });

          return NextResponse.json({
            success: true,
            chunkIndex,
            slides: sanitized,
            source: provider,
          });
        }
      } catch (openAiErr: any) {
        console.warn(`Chunk ${chunkIndex} OpenAI/Deepseek error:`, openAiErr?.message);
      }
    }

    // 3. Try Anthropic (Claude 3.5 / 3.7)
    const anthropicKey = (apiKey && provider === "anthropic" ? apiKey : null) || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && (provider === "anthropic" || !geminiKey && !openAiKey)) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: requestedModel || "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            temperature: 0.25,
            system: CHUNK_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const raw = data.content?.[0]?.text || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map((s: any, idx: number) => {
              const outline = outlines[idx];
              return {
                ...s,
                id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
                slideNumber: outline ? String(outline.slideNumber).padStart(2, "0") : undefined,
                speakerNotes: s.speakerNotes || outline?.speakerNotes || undefined,
                backgroundImage: s.backgroundImage || resolveSlideBackgroundForChunk(
                  s.layout || outline?.visualLayout || "",
                  s.title || outline?.headline || "",
                  outline?.slideNumber || (chunkIndex * outlines.length + idx + 1),
                  totalChunks * outlines.length
                ),
              };
            });

            return NextResponse.json({
              success: true,
              chunkIndex,
              slides: sanitized,
              source: "anthropic",
            });
          }
        }
      } catch (anthropicErr: any) {
        console.warn(`Chunk ${chunkIndex} Anthropic Claude error:`, anthropicErr?.message);
      }
    }

    // Fallback synthesizer per chunk
    const fallbackSlides = outlines.map((o, idx) => {
      const slideLayout = mapLayoutStringToLayout(o.visualLayout);
      const slideNum = o.slideNumber || (chunkIndex * outlines.length + idx + 1);
      return {
        id: `fallback-${chunkIndex}-${idx}`,
        layout: slideLayout,
        title: o.headline,
        subtitle: o.subheadline || "Strategic Operational Framework",
        description: o.description || "Inisiatif menyeluruh untuk memastikan integrasi yang optimal across divisions.",
        badge: "EXECUTIVE BLUEPRINT",
        bgStyle: idx === 0 && chunkIndex === 0 ? "boldYellow" : "white",
        speakerNotes: o.speakerNotes || "Panduan Presenter: Paparkan pesan inti slide ini dengan ringkas dalam 1-2 menit, fokus pada dampak strategis.",
        backgroundImage: resolveSlideBackgroundForChunk(slideLayout, o.headline, slideNum, totalChunks * outlines.length),
        bullets: o.bullets || [
          "Pilar Utama: Standarisasi arsitektur kerja dan efisiensi waktu eksekusi.",
          "Dampak Terukur: Memaksimalkan transparansi operasional lintas pemangku kepentingan.",
        ],
        processSteps: [
          { title: "Tahap 1: Ingestion", description: "Standardisasi input materi dan verifikasi data." },
          { title: "Tahap 2: Synthesis", description: "Pemetaan framework dan analisis mendalam." },
          { title: "Tahap 3: Delivery", description: "Penerapan solusi dan evaluasi dampak strategis." },
        ],
        slideNumber: String(slideNum).padStart(2, "0"),
      };
    });

    return NextResponse.json({
      success: true,
      chunkIndex,
      slides: fallbackSlides,
      source: "fallback-chunk",
    });
  } catch (error: any) {
    console.error("Generate Chunk API Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Chunk generation error" }, { status: 500 });
  }
}

function mapLayoutStringToLayout(val?: string): string {
  if (!val) return "twoColumn";
  const lower = val.toLowerCase();
  if (lower.includes("section") || lower.includes("divider") || lower.includes("pembagi")) return "sectionDivider";
  if (lower.includes("paired") || lower.includes("masalah dan") || lower.includes("ancaman") || lower.includes("weak")) return "pairedRows";
  if (lower.includes("horizontal stack") || lower.includes("stack cards") || lower.includes("triad") || lower.includes("tujuan keamanan") || (lower.includes("pillar") && lower.includes("stack"))) return "horizontalStack";
  if (lower.includes("rail") || lower.includes("stepper") || lower.includes("lifecycle") || lower.includes("rantai serangan")) return "connectedRailStepper";
  if (lower.includes("ascending") || lower.includes("maturity") || lower.includes("kematangan") || lower.includes("intensity")) return "ascendingColumns";
  if (lower.includes("checklist") || lower.includes("periksa") || lower.includes("governance")) return "checklist";
  if (lower.includes("closing") || lower.includes("tindakan") || lower.includes("next step") || lower.includes("langkah")) return "closingAction";
  if (lower.includes("hero") || lower.includes("cover") || lower.includes("title")) return "hero";
  if (lower.includes("two") || lower.includes("column") || lower.includes("split")) return "twoColumn";
  if (lower.includes("process") || lower.includes("step")) return "process";
  if (lower.includes("timeline") || lower.includes("roadmap")) return "timeline";
  if (lower.includes("table") || lower.includes("comparison")) return "tableComparison";
  if (lower.includes("flow") || lower.includes("diagram") || lower.includes("architecture")) return "flowDiagram";
  if (lower.includes("stat") || lower.includes("metric") || lower.includes("number")) return "stats";
  if (lower.includes("bold") || lower.includes("impact") || lower.includes("cta")) return "boldStatement";
  return "twoColumn";
}

function resolveSlideBackgroundForChunk(
  layout: string,
  title: string,
  slideNum: number,
  totalSlides: number = 20
): string {
  if (slideNum === 1) {
    return "/bg-deck/itb-deck/cover-deck.png";
  }

  const isLast = totalSlides > 0 && slideNum >= totalSlides;
  const lowerLayout = (layout || "").toLowerCase();
  const lowerTitle = (title || "").toLowerCase();

  // Closing / Wrap-up
  if (
    isLast ||
    lowerLayout.includes("closing") ||
    lowerTitle.includes("closing") ||
    lowerTitle.includes("penutup") ||
    lowerTitle.includes("kesimpulan") ||
    lowerTitle.includes("next step") ||
    lowerTitle.includes("langkah berikutnya") ||
    lowerTitle.includes("tindakan selanjutnya") ||
    lowerTitle.includes("action plan") ||
    lowerTitle.includes("terima kasih") ||
    lowerTitle.includes("thank you")
  ) {
    return "/bg-deck/itb-deck/closing-deck.png";
  }

  // Section divider / Part transition (can repeat multiple times)
  if (
    lowerLayout.includes("section") ||
    lowerLayout.includes("divider") ||
    lowerTitle.includes("bagian ") ||
    lowerTitle.includes("part ") ||
    lowerTitle.includes("modul ") ||
    lowerTitle.includes("bab ") ||
    lowerTitle.includes("agenda utama")
  ) {
    return "/bg-deck/itb-deck/part-deck.png";
  }

  // Task / Workshop / Exercise / Speaker / Case study / Split layout (can repeat multiple times)
  if (
    lowerLayout.includes("split") ||
    lowerLayout.includes("case") ||
    lowerLayout.includes("profile") ||
    lowerLayout.includes("poll") ||
    lowerTitle.includes("hands-on") ||
    lowerTitle.includes("latihan") ||
    lowerTitle.includes("workshop") ||
    lowerTitle.includes("tugas") ||
    lowerTitle.includes("speaker") ||
    lowerTitle.includes("pembicara") ||
    lowerTitle.includes("fasilitator") ||
    lowerTitle.includes("instruktur") ||
    lowerTitle.includes("studi kasus") ||
    lowerTitle.includes("simulasi")
  ) {
    return "/bg-deck/itb-deck/task-speaker-deck.png";
  }

  // Default: Content deck (most frequent, vast majority of slides)
  return "/bg-deck/itb-deck/content-deck.png";
}

