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
You are an elite Executive Content Engine operating at the highest tier of strategic presentation design.
You think like a senior McKinsey associate writing a client-ready deliverable, with the visual sensibility of an Apple keynote creative director.

Your task: generate richly detailed, production-ready slide objects for a SPECIFIC BATCH, ensuring every slide contains substantive, authoritative, and precisely structured content that would impress a Fortune 500 boardroom.

=== YOUR MANDATORY THINKING PROCESS ===

For EACH slide in this batch, before generating its JSON:
1. **Re-read the outline blueprint** — understand the headline, subheadline, and description intent
2. **Identify the core idea** — what is the ONE takeaway this slide must communicate?
3. **Choose the right depth** — how much detail serves this idea without overwhelming?
4. **Craft executive-grade text** — every word must earn its place; no filler, no generic phrases
5. **Write facilitation-quality speaker notes** — as if coaching a CEO to present this slide

=== CONTENT ELEVATION PRINCIPLES (NON-NEGOTIABLE) ===

1. **Executive Diction**: Use confident, authoritative language:
   - Strong verbs: accelerate, architect, compress, consolidate, deploy, eliminate, engineer, operationalize, quantify, safeguard, transform
   - Precise adjectives: asymmetric, compounding, cross-functional, empirical, irreversible, measurable, structural
   - NEVER use vague words: "stuff", "things", "good", "bad", "very", "lots of", "improve"

2. **Substance Over Surface**: Every bullet, card, or row must contain:
   - A specific claim (not a label)
   - Evidence or reasoning (not just an assertion)
   - Actionable implication (not just information)
   Example BAD: "Communication is important"
   Example GOOD: "Cross-functional communication protocols reduce decision latency from 5 days to 4 hours, enabling real-time course correction"

3. **Action Titles**: The slide title is a complete assertion, not a topic label.
   - BAD: "Data Strategy" → GOOD: "Unified Data Lakehouse Eliminates 80% of Manual Reconciliation"
   - 5-12 words. Active voice. Contains the insight. NO trailing period.

4. **Faithful Content Preservation**: Keep 100% of the user's facts, technical terms, numbers, and proper nouns. Elevate the framing, never alter the substance.

5. **No Invented Data**: NEVER fabricate statistics, names, dates, case studies, or quotes not present in the source. Use visible placeholders: [INSTRUCTOR TO CONFIRM], [X]-minute, [__]%.

=== AVAILABLE MASTER LAYOUTS & EXPERT WRITING INSTRUCTIONS ===

1. "sectionDivider" — Chapter/Module Transition
   CONTENT: title (bold claim about what this chapter achieves), subtitle (1-sentence preview), badge ("PART N")
   WRITING: The title should create anticipation. Think movie chapter cards. The subtitle previews the transformation this section delivers.
   DATA: { title, subtitle, badge, bgStyle: "boldYellow" }

2. "pairedRows" — Problem↔Solution / Threat↔Response
   CONTENT: 2-4 paired rows, each with a tension (left) and its resolution (right)
   WRITING: Left side states the friction with specific, visceral detail. Right side provides the precise countermeasure with expected outcome. Lead labels ("THREAT"/"RESPONSE", "PROBLEM"/"SOLUTION") clarify the axis.
   DATA: { title, pairedRows: [{ left, right, leftLead, rightLead }] }

3. "horizontalStack" — Core Triads/Pillars
   CONTENT: 3 stacked horizontal bars for foundational concepts
   WRITING: Each card has a noun-phrase title, a context tag (uppercase), and a 1-2 sentence description that explains WHY this pillar matters, not just what it is.
   DATA: { title, stackCards: [{ title, tag, description }] }

4. "connectedRailStepper" — Sequential Process/Chain
   CONTENT: 3-6 connected steps showing progression
   WRITING: Each step has a clear verb-noun title and a sentence explaining what happens and what can go wrong at this stage. Steps should show escalation or progression.
   DATA: { title, railSteps: [{ stepNumber, title, description }] }

5. "ascendingColumns" — Maturity/Intensity Levels
   CONTENT: 3-4 ascending levels showing capability progression
   WRITING: Each level title uses a single evocative adjective. Description explains the operational reality at this level. Tags provide categorical labels (BASIC/STANDARD/ADVANCED).
   DATA: { title, ascendingLevels: [{ levelNumber, title, description, tag }] }

6. "checklist" — Governance/Readiness Audit
   CONTENT: 4-6 verification items
   WRITING: Each item is a complete, testable assertion (not a vague aspiration). Written as verifiable criteria: "Audit X completed every Y" not "Do audits".
   DATA: { title, checklistItems: ["item1", "item2", ...] }

7. "closingAction" — Final Executive Mandate
   CONTENT: 3 concrete action items with ownership implications
   WRITING: Each action starts with a numbered prefix and a specific, time-bound instruction. Not "improve security" but "Activate MFA on all executive email accounts by Friday".
   DATA: { title, subtitle, actionItems: [{ verb, text }], contactFooterText, bgStyle: "boldYellow" }

8. "chevronProcess" — Alternating Process with Diagnostic Pills
   CONTENT: 3-5 chevron steps with optional diagnostic status pills
   WRITING: Steps use "N · Verb" format. Descriptions explain the cognitive or operational work at each stage. Pills diagnose WHERE common failures occur — specific and non-obvious.
   DATA: { title, subtitle, chevronSteps: [{ title, description, pill?, pillType? }], insightBarText }

9. "formulaHero" — Impact Equation + Stat Box
   CONTENT: Formula banner + 3 factor columns + accent stat
   WRITING: The formula must be genuinely illuminating, not a tautology. Factors explain the mechanism. Stat box uses REAL data with source attribution.
   DATA: { title, subtitle, formulaData: { formulaLabel, formula, formulaSubtext, factors: [{ title, description }], statBox: { value, description, source } } }

10. "quadrantMatrix" — 2×2 Decision Classification
    CONTENT: Labeled X/Y axes with 4 quadrant treatments
    WRITING: Axis labels should be dimensionally orthogonal. Quadrant prescriptions must be actionable (not just descriptive). Each quadrant title is a verb phrase.
    DATA: { title, subtitle, quadrantData: { yAxisTop, yAxisBottom, xAxisLeft, xAxisRight, q1-q4: [{ title, subtitle }] } }

11. "treeComparison" — Causation vs Correlation Analysis
    CONTENT: Top metric callout + 3 tree cards + bottom takeaway
    WRITING: Each card shows a specific cognitive trap (selection bias, reverse causation, spurious correlation) with a concrete business example. Root and child nodes show the TRUE causal direction.
    DATA: { title, subtitle, treeData: { topCallout: { stat, label, note }, cards: [{ title, rootNode, childNodes, description }], bottomTakeaway } }

12. "caseExercise" — Interactive Case Study
    CONTENT: Situation narrative + data metrics + twist + exercise
    WRITING: Situation reads like a compelling business narrative (character, context, conflict). Metrics are specific and relevant. The twist introduces a wrinkle that forces deeper thinking. Exercise lines are precisely scoped.
    DATA: { title, subtitle, badge, exerciseData: { situationTitle, situationText, dataMetrics: [{ value, label }], twistBox, exerciseTitle, exerciseLines } }

13. "pyramidHierarchy" — 3-Tier Strategic Apex
    CONTENT: Apex → Pillars → Foundation layers
    WRITING: Apex is the North Star (aspiration + metric). Middle tier names the strategic capabilities. Foundation names the enabling infrastructure. Each layer has a clear tag (APEX/STRATEGY/FOUNDATION).
    DATA: { title, cards: [{ title, subtitle, tag, bullets? }] }

14. "transformationBridge" — As-Is → Engine → To-Be
    CONTENT: 3 paired rows showing current friction vs target outcome
    WRITING: Left side uses specific, painful operational language. Right side paints the transformed future state with measurable improvement. The highlight names the catalyst mechanism.
    DATA: { title, pairedRows: [{ left, right }], highlight }

15. "radialHub" — Central Hub + 4 Satellites
    CONTENT: Core orchestration center + 4 domain quadrants
    WRITING: Hub label is an active gerund phrase ("Orchestrating..."). Satellites are genuinely different domains (not 4 versions of the same thing). Each satellite has a tag showing its organizational function.
    DATA: { title, highlight, cards: [{ title, description, tag }] }

16. "twoColumn" / "cardGrid" — Dual Perspectives / Category Cards
    CONTENT: Contrasting perspectives or categorical pillars
    WRITING: Bullets are substantive (2+ lines each), not fragments. Each bullet has a bold lead-in followed by explanation.
    DATA: { title, subtitle, bullets }

17. "tableComparison" — Feature/Option Matrix
    CONTENT: Structured comparison table
    WRITING: Headers are clear dimensions. Rows contain specific, comparable data points (not vague assessments). Use "Optional → Mandatory 100%" format, not just "Yes/No".
    DATA: { title, tableHeaders, tableRows: [{ feature, current, proposed }] }

18. "hero" — Opening Cover
    CONTENT: Authoritative title + strategic subtitle + category badge
    WRITING: Title is the deck's thesis in one commanding sentence. Subtitle provides strategic framing. Badge establishes credibility.
    DATA: { title, subtitle, badge, description, bgStyle: "boldYellow" }

19. "splitComparison" — Before/After on Split Background
    CONTENT: Left blue panel (title + subtitle) + Right panel (Before card → After card + Insight bar)
    WRITING: Before card shows the specific operational reality pre-transformation. After card shows the specific improvement with metrics if available. Insight bar delivers the executive takeaway in one sharp sentence.
    DATA: { title, subtitle, beforeCard: { title, bullets }, afterCard: { title, bullets }, insightBarText }

20. "splitProfile" — Speaker/Facilitator Profile
    CONTENT: Left blue panel (name + role) + Right panel (profile details)
    WRITING: Bio is 2-3 sentences emphasizing relevant authority and expertise. Role uses precise organizational title.
    DATA: { title, subtitle, profileData: { tag, role, bio } }

21. "sectionDivider" — Full-Bleed Chapter Transition
    CONTENT: Badge ("PART N") + title + subtitle on solid blue
    WRITING: Title previews the chapter's conclusion or transformation. Subtitle establishes the chapter's operating question.
    DATA: { badge, title, subtitle }

ADDITIONAL CONTENT STRIPS (add to any layout):
- insightBarText: 1 punchy sentence — the executive takeaway. Use "Key insight:" prefix.
- noteBoxText: 1 facilitator note or caution — practical advice for presenters.

=== UNIVERSAL REQUIRED FIELDS (EVERY SLIDE) ===
- id: unique string (e.g. "slide-1")
- layout: one of the valid layout strings above
- title: ACTION TITLE (5-12 words, assertive claim, NO trailing period)
- subtitle: crisp strategic context or transition phrase
- speakerNotes: MANDATORY — see below

=== SPEAKER NOTES (FACILITATION SCRIPT QUALITY) ===

Every slide's speakerNotes MUST contain:
1. **Intent**: "This slide establishes/proves/challenges [concept] in the narrative arc." (1 sentence)
2. **Key Message**: The one sentence the audience must remember. (1 sentence)
3. **Delivery Cue**: Timing, emphasis, rhetorical questions, where to pause, anticipated audience reactions. (1-2 sentences)
4. **Transition**: The bridge sentence to introduce the next slide. (1 sentence)

Example: "Intent: This slide introduces the decision classification matrix as the central analytical tool. Key message: Not all decisions deserve the same process — stakes and data richness determine the approach. Delivery: Spend 90 seconds on this slide. Point to each quadrant and ask 'Where does your most recent major decision fall?' Pause for 10 seconds of audience reflection. Transition: Now let's see this matrix in action with a real case from Gojek."

=== SELF-VALIDATION BEFORE OUTPUT ===

Before returning JSON, verify:
□ Every slide has id, layout, title, subtitle, and speakerNotes
□ Titles are Action Titles (claims, not labels) with NO trailing period
□ Layout-specific data fields are populated (pairedRows for pairedRows, stackCards for horizontalStack, etc.)
□ No placeholder text like "[Description]" or "TBD" in visible content
□ Speaker notes follow the 4-part structure
□ Content is substantive — every text element adds genuine value

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON array of slide objects for this batch.
No markdown backticks, no explanatory comments, no preamble.

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
      previousSlideSummary = null,
      fullOutlineOverview = [],
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

${previousSlideSummary ? `
================================================================================
🔗 CONTINUITY & NARRATIVE ARCHITECTURE:
Immediately Preceding Slide (#${previousSlideSummary.slideNumber}):
- Title: "${previousSlideSummary.title}"
- Layout: ${previousSlideSummary.layout}
- Takeaway/Description: "${previousSlideSummary.description || ""}"
INSTRUCTION: Seamlessly connect the narrative in this batch to build upon this preceding slide. Ensure speaker notes connect naturally from the previous slide's conclusion.
================================================================================
` : ""}

${fullOutlineOverview && fullOutlineOverview.length > 0 ? `
COMPLETE DECK OUTLINE CONTEXT (FOR NARRATIVE ARC):
${fullOutlineOverview.join("\n")}
` : ""}

${rulesDoc.length > 0 ? `
================================================================================
👑 GOVERNING DESIGN CONTRACT & ARCHITECTURAL RULES (.MD) (UNABRIDGED & MANDATORY):
Source Document: ${templateName || "Institutional Design Specification"}
================================================================================
${rulesDoc}
================================================================================
` : ""}

MANDATORY COMPLIANCE INSTRUCTIONS:
- Faithfully study and execute the governing .md document above in its entirety.
- Every slide in this batch MUST strictly adhere to the visual layout assigned in the OUTLINE BLUEPRINT.
- Never downgrade or alter layouts to generic bullets. Output the EXACT layout key and required data fields:
  * "Hero" -> output "layout": "hero", with "title", "subtitle", "badge", "description", "bgStyle": "boldYellow"
  * "Split Comparison" -> output "layout": "splitComparison", with "beforeCard": { "title": "BEFORE AI", "bullets": [...] }, "afterCard": { "title": "AFTER AI", "bullets": [...] }, "insightBarText": "..."
  * "Split Profile" -> output "layout": "splitProfile", with "profileData": { "tag": "FACILITATOR", "role": "...", "bio": "..." }
  * "Transformation Bridge" -> output "layout": "transformationBridge", with "pairedRows": [{ "left": "...", "right": "..." }], "highlight": "..."
  * "Radial Hub" -> output "layout": "radialHub", with "highlight": "...", "cards": [{ "title": "...", "description": "...", "tag": "DOMAIN 01" }]
  * "Pyramid Hierarchy" -> output "layout": "pyramidHierarchy", with "cards": [{ "title": "...", "subtitle": "...", "tag": "APEX", "bullets": [...] }]
  * "Chevron Process" -> output "layout": "chevronProcess", with "chevronSteps": [{ "title": "...", "description": "...", "pill": "STATUS", "pillType": "ok" | "risk" }], "insightBarText": "..."
  * "Formula Hero" -> output "layout": "formulaHero", with "formulaData": { "formulaLabel": "THE FORMULA", "formula": "...", "formulaSubtext": "...", "factors": [{ "title": "...", "description": "..." }], "statBox": { "value": "...", "description": "...", "source": "..." } }
  * "Decision Matrix" -> output "layout": "quadrantMatrix", with "quadrantData": { "yAxisTop": "...", "yAxisBottom": "...", "xAxisLeft": "...", "xAxisRight": "...", "q1": [...], "q2": [...], "q3": [...], "q4": [...] }
  * "Causation Tree" -> output "layout": "treeComparison", with "treeData": { "topCallout": { "stat": "...", "label": "...", "note": "..." }, "cards": [{ "title": "...", "rootNode": "...", "childNodes": ["...", "..."], "description": "..." }], "bottomTakeaway": "..." }
  * "Case Study" -> output "layout": "caseExercise", with "badge": "CASE STUDY", "exerciseData": { "situationTitle": "...", "situationText": "...", "dataMetrics": [{ "value": "...", "label": "..." }], "twistBox": "...", "exerciseTitle": "...", "exerciseLines": [...] }
  * "Paired Rows" -> output "layout": "pairedRows", with "pairedRows": [{ "left": "...", "right": "...", "leftLead": "...", "rightLead": "..." }]
  * "Horizontal Stack" -> output "layout": "horizontalStack", with "stackCards": [{ "title": "...", "tag": "...", "description": "..." }]
  * "Connected Stepper" -> output "layout": "connectedRailStepper", with "railSteps": [{ "stepNumber": 1, "title": "...", "description": "..." }]
  * "Ascending Columns" -> output "layout": "ascendingColumns", with "ascendingLevels": [{ "levelNumber": "L1", "title": "...", "description": "...", "tag": "BASIC" }]
  * "Checklist" -> output "layout": "checklist", with "checklistItems": ["..."]
  * "Closing Action" -> output "layout": "closingAction", with "actionItems": [{ "verb": "ACTIVATE", "text": "..." }], "contactFooterText": "...", "bgStyle": "boldYellow"
  * "Section Divider" -> output "layout": "sectionDivider", with "badge": "PART N", "bgStyle": "boldYellow"
  * "Table Comparison" -> output "layout": "tableComparison", with "tableHeaders": [...], "tableRows": [{ "feature": "...", "current": "...", "proposed": "..." }]
  * "Flow Diagram" -> output "layout": "flowDiagram", with "flowNodes": [{ "title": "...", "subtitle": "...", "tag": "01" }]
  * "Timeline" -> output "layout": "timeline", with "timelineMilestones": [{ "quarter": "Q1", "title": "...", "description": "..." }]
  * "Stats" -> output "layout": "stats", with "stats": [{ "value": "...", "label": "...", "subtext": "..." }]
  * "Two Column" -> output "layout": "twoColumn", with "bullets": ["..."]
- Strictly adhere to the typography floor: content text must be substantive, informative, and never placeholder brackets.
- ABSOLUTELY NEVER place facilitator directions, internal meeting reminders, or bracketed placeholders like "[Facilitator Name]", "[date/time]", "Next step: [Facilitator...", or "[kontak...]" on the slide canvas or in contactFooterText. All facilitator directions belong EXCLUSIVELY in speakerNotes!
- If contactFooterText is not an actual public contact channel (e.g. security@corp.com), omit it entirely.
- Titles MUST be Action Titles (claims, not labels), 5-12 words, NO trailing period.
- Speaker notes MUST contain Intent, Key Message, Delivery Cue, and Transition.

OUTLINE BLUEPRINT FOR THIS BATCH:
${JSON.stringify(outlines, null, 2)}
${languageDirective}
Generate exactly ${outlines.length} complete, production-ready slide objects for this batch in strict JSON array format.
`;

    // ──── STRICT BYOK PROVIDER EXECUTION ────
    const effectiveProvider = (provider || (apiKey?.startsWith("sk-") ? "deepseek" : "deepseek")).toLowerCase();

    // 1. DeepSeek (BYOK First)
    if (effectiveProvider === "deepseek") {
      const deepseekKey = apiKey || process.env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        try {
          const client = new OpenAI({
            baseURL: "https://api.deepseek.com",
            apiKey: deepseekKey,
          });

          const selectedModel = requestedModel || "deepseek-chat";
          const isReasoner = selectedModel === "deepseek-reasoner" || selectedModel.includes("reasoner");

          const res = await client.chat.completions.create({
            model: selectedModel,
            ...(isReasoner ? {} : { temperature: 0.3 }),
            messages: isReasoner
              ? [{ role: "user", content: `${CHUNK_SYSTEM_PROMPT}\n\n${userPrompt}` }]
              : [
                  { role: "system", content: CHUNK_SYSTEM_PROMPT },
                  { role: "user", content: userPrompt },
                ],
          });

          const raw = res.choices[0]?.message?.content || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeChunkSlides(parsed, outlines, chunkIndex, totalChunks);
            return NextResponse.json({
              success: true,
              chunkIndex,
              slides: sanitized,
              source: "deepseek",
            });
          }
        } catch (dsErr: any) {
          console.error(`Chunk ${chunkIndex} DeepSeek error:`, dsErr?.message);
        }
      }
    }

    // 2. OpenAI
    if (effectiveProvider === "openai") {
      const openAiKey = apiKey || process.env.OPENAI_API_KEY;
      if (openAiKey) {
        try {
          const client = new OpenAI({
            baseURL: "https://api.openai.com/v1",
            apiKey: openAiKey,
          });

          const res = await client.chat.completions.create({
            model: requestedModel || "gpt-4o",
            temperature: 0.3,
            messages: [
              { role: "system", content: CHUNK_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
          });

          const raw = res.choices[0]?.message?.content || "";
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeChunkSlides(parsed, outlines, chunkIndex, totalChunks);
            return NextResponse.json({
              success: true,
              chunkIndex,
              slides: sanitized,
              source: "openai",
            });
          }
        } catch (openAiErr: any) {
          console.error(`Chunk ${chunkIndex} OpenAI error:`, openAiErr?.message);
        }
      }
    }

    // 3. Anthropic (Claude)
    if (effectiveProvider === "anthropic") {
      const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (anthropicKey) {
        const modelsToTry = [requestedModel, "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022"].filter(Boolean) as string[];
        for (const mName of modelsToTry) {
          try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: mName,
                max_tokens: 8192,
                temperature: 0.3,
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
                const sanitized = sanitizeChunkSlides(parsed, outlines, chunkIndex, totalChunks);
                return NextResponse.json({
                  success: true,
                  chunkIndex,
                  slides: sanitized,
                  source: "anthropic",
                });
              }
            }
          } catch (anthropicErr: any) {
            console.error(`Chunk ${chunkIndex} Anthropic Claude error:`, anthropicErr?.message);
          }
        }
      }
    }

    // 4. Google Gemini
    if (effectiveProvider === "gemini") {
      const geminiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const mName = requestedModel || "gemini-3.8-flash";
          const model = genAI.getGenerativeModel({
            model: mName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          const result = await model.generateContent([CHUNK_SYSTEM_PROMPT, userPrompt]);
          const text = result.response.text().trim();
          const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeChunkSlides(parsed, outlines, chunkIndex, totalChunks);
            return NextResponse.json({
              success: true,
              chunkIndex,
              slides: sanitized,
              source: "gemini",
            });
          }
        } catch (gemErr: any) {
          console.warn(`Chunk ${chunkIndex} Gemini error:`, gemErr?.message);
        }
      }
    }

    // Fallback synthesizer per chunk
    const fallbackRaw = outlines.map((o, idx) => {
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

    const fallbackSlides = sanitizeChunkSlides(fallbackRaw, outlines, chunkIndex, totalChunks);

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

function sanitizeChunkSlides(
  parsed: any[],
  outlines: OutlineItem[],
  chunkIndex: number,
  totalChunks: number
): any[] {
  return parsed.map((s: any, idx: number) => {
    const outline = outlines[idx];
    const slideNum = outline ? outline.slideNumber : chunkIndex * outlines.length + idx + 1;

    // 1. Resolve & normalize layout
    let layout = mapLayoutStringToLayout(s.layout || outline?.visualLayout || "");

    // 2. Action Title sanitation: trim, remove trailing period, ensure not empty
    let title = safeString(s.title || outline?.headline || `Executive Slide ${slideNum}`).trim();
    title = title.replace(/\.$/, "");

    // 3. Subtitle & Description
    const subtitle = s.subtitle ? safeString(s.subtitle).trim() : (outline?.subheadline ? safeString(outline.subheadline).trim() : undefined);
    const description = s.description ? safeString(s.description).trim() : (outline?.description ? safeString(outline.description).trim() : undefined);

    // 4. Bullets normalization
    let bullets = Array.isArray(s.bullets) && s.bullets.length > 0
      ? s.bullets.map((b: any) => safeString(b)).filter((b: string) => b.length > 0)
      : (Array.isArray(outline?.bullets) && outline.bullets.length > 0 ? outline.bullets : undefined);

    // 5. Speaker Notes — 4-part executive facilitation script
    let speakerNotes = s.speakerNotes ? safeString(s.speakerNotes).trim() : (outline?.speakerNotes ? safeString(outline.speakerNotes).trim() : "");
    if (!speakerNotes || speakerNotes.length < 20) {
      speakerNotes = `Intent: Establish and reinforce ${title}. Key message: ${subtitle || description || title}. Delivery: Speak with authority, pausing after stating the core claim to allow the executive team to absorb the conclusion. Transition: This establishes the foundation for the next analytical dimension.`;
    }

    // 6. Layout-specific auto-repair and enrichment
    let beforeCard = s.beforeCard;
    let afterCard = s.afterCard;
    let pairedRows = s.pairedRows;
    let stackCards = s.stackCards;
    let railSteps = s.railSteps;
    let ascendingLevels = s.ascendingLevels;
    let checklistItems = s.checklistItems;
    let actionItems = s.actionItems;
    let formulaData = s.formulaData;
    let treeData = s.treeData;
    let exerciseData = s.exerciseData;
    let cards = s.cards;
    let chevronSteps = s.chevronSteps;
    let quadrantData = s.quadrantData;
    let tableHeaders = s.tableHeaders;
    let tableRows = s.tableRows;
    let flowNodes = s.flowNodes;
    let timelineMilestones = s.timelineMilestones;
    let stats = s.stats;
    let profileData = s.profileData;
    let insightBarText = s.insightBarText ? safeString(s.insightBarText) : (s.highlight ? safeString(s.highlight) : undefined);

    // AUTO-REPAIR: splitComparison
    if (layout === "splitComparison") {
      if (!beforeCard || !afterCard) {
        if (pairedRows && pairedRows.length >= 2) {
          beforeCard = {
            title: "BEFORE AI",
            bullets: pairedRows.map((r: any) => safeString(r.left || r.problem || "")),
          };
          afterCard = {
            title: "AFTER AI",
            bullets: pairedRows.map((r: any) => safeString(r.right || r.solution || "")),
          };
        } else if (bullets && bullets.length >= 2) {
          const mid = Math.ceil(bullets.length / 2);
          beforeCard = {
            title: "TRADITIONAL APPROACH",
            bullets: bullets.slice(0, mid),
          };
          afterCard = {
            title: "ENHANCED FRAMEWORK",
            bullets: bullets.slice(mid),
          };
        } else {
          beforeCard = {
            title: "CURRENT LIMITATION",
            bullets: ["Decisions reliant on fragmented intuition", "Manual data gathering creates 3-5 day latency"],
          };
          afterCard = {
            title: "TRANSFORMED CAPABILITY",
            bullets: ["Real-time unified intelligence cockpit", "Continuous algorithmic validation of risk parameters"],
          };
        }
      }
      if (!insightBarText) {
        insightBarText = `Key insight: ${description || "Transforming the operating model converts decision latency into competitive velocity."}`;
      }
    }

    // AUTO-REPAIR: pairedRows
    if (layout === "pairedRows" && (!pairedRows || pairedRows.length === 0)) {
      if (bullets && bullets.length >= 2) {
        pairedRows = bullets.map((b: string) => {
          const parts = b.split(/:\s*|—\s*|->\s*|vs\s*/i);
          return {
            left: parts[0]?.trim() || "Observed Constraint",
            right: parts[1]?.trim() || b,
            leftLead: "FRICTION",
            rightLead: "COUNTERMEASURE",
          };
        });
      } else {
        pairedRows = [
          { left: "Fragmented executive reporting", right: "Single source of verified truth across squads", leftLead: "CHALLENGE", rightLead: "RESOLUTION" },
          { left: "Manual spreadsheet modeling", right: "Automated real-time scenario simulation", leftLead: "CHALLENGE", rightLead: "RESOLUTION" },
        ];
      }
    }

    // AUTO-REPAIR: horizontalStack
    if (layout === "horizontalStack" && (!stackCards || stackCards.length === 0)) {
      if (cards && cards.length >= 3) {
        stackCards = cards.slice(0, 3).map((c: any, i: number) => ({
          title: safeString(c.title || `Pillar ${i + 1}`),
          tag: safeString(c.tag || `PILLAR 0${i + 1}`),
          description: safeString(c.description || c.subtitle || ""),
        }));
      } else if (bullets && bullets.length >= 3) {
        stackCards = bullets.slice(0, 3).map((b: string, i: number) => {
          const parts = b.split(/:\s*|—\s*/);
          return {
            title: parts[0]?.trim() || `Pillar 0${i + 1}`,
            tag: `PILLAR 0${i + 1}`,
            description: parts[1]?.trim() || b,
          };
        });
      } else {
        stackCards = [
          { title: "Governance Architecture", tag: "FOUNDATION", description: "Standardize policy enforcement and compliance guardrails across squads." },
          { title: "Velocity Enablement", tag: "EXECUTION", description: "Eliminate operational friction points through automated pipeline deployment." },
          { title: "Continuous Auditing", tag: "ASSURANCE", description: "Real-time telemetry and validation of mission-critical system metrics." },
        ];
      }
    }

    // AUTO-REPAIR: connectedRailStepper
    if (layout === "connectedRailStepper" && (!railSteps || railSteps.length === 0)) {
      if (s.processSteps && s.processSteps.length > 0) {
        railSteps = s.processSteps.map((p: any, i: number) => ({
          stepNumber: i + 1,
          title: safeString(p.title || `Phase 0${i + 1}`),
          description: safeString(p.description || ""),
        }));
      } else if (bullets && bullets.length >= 3) {
        railSteps = bullets.slice(0, 5).map((b: string, i: number) => {
          const parts = b.split(/:\s*|—\s*/);
          return {
            stepNumber: i + 1,
            title: parts[0]?.trim() || `Phase 0${i + 1}`,
            description: parts[1]?.trim() || b,
          };
        });
      } else {
        railSteps = [
          { stepNumber: 1, title: "Diagnostic Ingestion", description: "Audit baseline processes and identify latent bottlenecks." },
          { stepNumber: 2, title: "Architecture Design", description: "Formulate target-state blueprint and operational guardrails." },
          { stepNumber: 3, title: "Pilot Deployment", description: "Execute focused 30-day proof of concept in core squad." },
          { stepNumber: 4, title: "Enterprise Scaling", description: "Roll out validated standard across divisions with full telemetry." },
        ];
      }
    }

    // AUTO-REPAIR: ascendingColumns
    if (layout === "ascendingColumns" && (!ascendingLevels || ascendingLevels.length === 0)) {
      if (bullets && bullets.length >= 3) {
        const tags = ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPONENTIAL"];
        ascendingLevels = bullets.slice(0, 4).map((b: string, i: number) => {
          const parts = b.split(/:\s*|—\s*/);
          return {
            levelNumber: `L${i + 1}`,
            title: parts[0]?.trim() || `Level ${i + 1}`,
            description: parts[1]?.trim() || b,
            tag: tags[i] || `LEVEL 0${i + 1}`,
          };
        });
      } else {
        ascendingLevels = [
          { levelNumber: "L1", title: "Ad-Hoc", description: "Isolated, manual execution without formal tracking", tag: "FOUNDATIONAL" },
          { levelNumber: "L2", title: "Standardized", description: "Documented processes with recurring verification cadence", tag: "SYSTEMATIC" },
          { levelNumber: "L3", title: "Optimized", description: "Automated governance with real-time exception alerting", tag: "STRATEGIC" },
          { levelNumber: "L4", title: "Autonomous", description: "Self-healing operations powered by predictive AI loops", tag: "TRANSFORMATIVE" },
        ];
      }
    }

    // AUTO-REPAIR: checklist
    if (layout === "checklist" && (!checklistItems || checklistItems.length === 0)) {
      checklistItems = bullets && bullets.length >= 3
        ? bullets
        : [
            "Formal decision rights documented for all critical operational gates",
            "Continuous automated risk logging with automated threshold escalation",
            "Quarterly executive reviews aligned with strategic north-star metrics",
            "Audit trail preserved for 100% of algorithmic recommendations",
          ];
    }

    // AUTO-REPAIR: closingAction
    if (layout === "closingAction" && (!actionItems || actionItems.length === 0)) {
      actionItems = bullets && bullets.length >= 3
        ? bullets.slice(0, 3).map((b: string) => {
            const parts = b.split(/:\s*|—\s*/);
            return {
              verb: parts[0]?.trim().toUpperCase().slice(0, 15) || "ACTIVATE",
              text: parts[1]?.trim() || b,
            };
          })
        : [
            { verb: "MANDATE", text: "Establish executive AI steering committee with bi-weekly review cadences." },
            { verb: "STANDARDIZE", text: "Enforce universal decision evaluation criteria across all product portfolios." },
            { verb: "AUDIT", text: "Initiate comprehensive data governance audit before Q2 expansion sprint." },
          ];
    }

    // AUTO-REPAIR: formulaHero
    if (layout === "formulaHero" && !formulaData) {
      formulaData = {
        formulaLabel: "THE DECISION IMPACT EQUATION",
        formula: "Impact = Strategic Clarity × Execution Speed × Risk Safeguards",
        formulaSubtext: subtitle || "Optimizing all three factors simultaneously unlocks compounding operational advantage.",
        factors: [
          { title: "Strategic Clarity", description: "Unambiguous definition of high-conviction objectives." },
          { title: "Execution Speed", description: "Frictionless pipeline translating intent to delivery." },
          { title: "Risk Safeguards", description: "Continuous automated monitoring preserving system integrity." },
        ],
        statBox: {
          value: "3.4x",
          description: "Acceleration in institutional decision throughput",
          source: "Executive Benchmarking Report",
        },
      };
    }

    // AUTO-REPAIR: pyramidHierarchy
    if (layout === "pyramidHierarchy" && (!cards || cards.length < 3)) {
      cards = [
        { title: "Strategic Apex", subtitle: "North Star Mission", tag: "APEX", bullets: ["Enterprise Market Leadership"] },
        { title: "Core Capabilities", subtitle: "Operational Engines", tag: "STRATEGY", bullets: ["Continuous Telemetry", "Cross-Squad Synchronization"] },
        { title: "Foundational Infrastructure", subtitle: "Architecture Floor", tag: "FOUNDATION", bullets: ["Verified Data Pipelines", "Universal Security Protocols"] },
      ];
    }

    // AUTO-REPAIR: radialHub
    if (layout === "radialHub" && (!cards || cards.length < 4)) {
      cards = [
        { title: "Data Governance", description: "Unified taxonomy and permission orchestration across repositories.", tag: "DOMAIN 01" },
        { title: "Talent Capability", description: "Upskilling leaders in algorithmic reasoning and prompt design.", tag: "DOMAIN 02" },
        { title: "Execution Engine", description: "Automated CI/CD pipelines reducing delivery cycle times.", tag: "DOMAIN 03" },
        { title: "Audit & Telemetry", description: "Continuous compliance tracking with automated escalation paths.", tag: "DOMAIN 04" },
      ];
    }

    // AUTO-REPAIR: chevronProcess
    if (layout === "chevronProcess" && (!chevronSteps || chevronSteps.length < 3)) {
      chevronSteps = [
        { title: "01 · Ingest & Validate", description: "Sanitize incoming data feeds against strict schema standards.", pill: "VALIDATED", pillType: "ok" },
        { title: "02 · Analyze & Model", description: "Run multi-scenario simulations to evaluate strategic trade-offs.", pill: "OPTIMIZED", pillType: "ok" },
        { title: "03 · Decide & Deploy", description: "Executive sign-off followed by automated orchestration trigger.", pill: "CRITICAL", pillType: "risk" },
        { title: "04 · Monitor & Adapt", description: "Track real-world telemetry and dynamically adjust parameters.", pill: "ACTIVE", pillType: "ok" },
      ];
    }

    // Ensure backgroundImage is determined correctly
    const backgroundImage = s.backgroundImage || resolveSlideBackgroundForChunk(
      layout,
      title,
      slideNum,
      totalChunks * outlines.length
    );

    return {
      ...s,
      id: s.id || `chunk-${chunkIndex}-slide-${idx}`,
      layout,
      title,
      subtitle,
      description,
      bullets,
      speakerNotes,
      slideNumber: String(slideNum).padStart(2, "0"),
      backgroundImage,
      bgStyle: s.bgStyle || (layout === "hero" || layout === "closingAction" || layout === "sectionDivider" ? "boldYellow" : "white"),
      badge: s.badge || (layout === "sectionDivider" ? "CHAPTER ROADMAP" : (layout === "hero" ? "EXECUTIVE BRIEF" : undefined)),
      beforeCard,
      afterCard,
      pairedRows,
      stackCards,
      railSteps,
      ascendingLevels,
      checklistItems,
      actionItems,
      formulaData,
      treeData,
      exerciseData,
      cards,
      chevronSteps,
      quadrantData,
      tableHeaders,
      tableRows,
      flowNodes,
      timelineMilestones,
      stats,
      profileData,
      insightBarText,
    };
  });
}

function safeString(val: any, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (val.title && val.description) return `${val.title}: ${val.description}`;
    if (val.title) return String(val.title);
    if (val.text) return String(val.text);
    if (val.description) return String(val.description);
    if (val.label) return String(val.label);
    if (val.value !== undefined) return String(val.value);
    if (val.name) return String(val.name);
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
}

function mapLayoutStringToLayout(val?: string): string {
  if (!val) return "twoColumn";
  const lower = val.toLowerCase();
  if (lower.includes("profile") || lower.includes("speaker") || lower.includes("pembicara") || lower.includes("fasilitator") || lower.includes("instruktur")) return "splitProfile";
  if (lower.includes("split case") || lower.includes("split comparison") || lower.includes("before vs after") || lower.includes("before and after") || (lower.includes("split") && (lower.includes("case") || lower.includes("comparison") || lower.includes("worked")))) return "splitComparison";
  if (lower.includes("section") || lower.includes("divider") || lower.includes("pembagi")) return "sectionDivider";
  if (lower.includes("pyramid") || lower.includes("piramida") || lower.includes("hierarchy") || lower.includes("hierarki")) return "pyramidHierarchy";
  if (lower.includes("transformation") || lower.includes("transformasi") || lower.includes("as-is") || lower.includes("to-be") || lower.includes("shift")) return "transformationBridge";
  if (lower.includes("hub") || lower.includes("ecosystem") || lower.includes("ekosistem") || lower.includes("radial") || lower.includes("orbit")) return "radialHub";
  if (lower.includes("formula")) return "formulaHero";
  if (lower.includes("tree") || lower.includes("causation") || lower.includes("korelasi")) return "treeComparison";
  if (lower.includes("exercise") || lower.includes("latihan") || (lower.includes("case") && (lower.includes("study") || lower.includes("line"))) || lower.includes("hands-on")) return "caseExercise";
  if (lower.includes("quadrant") || lower.includes("kuadran") || lower.includes("classification matrix") || lower.includes("decision matrix") || lower.includes("2x2")) return "quadrantMatrix";
  if (lower.includes("chevron") || (lower.includes("process") && lower.includes("5-step"))) return "chevronProcess";
  if (lower.includes("paired") || lower.includes("masalah dan") || lower.includes("ancaman") || lower.includes("weak")) return "pairedRows";
  if (lower.includes("horizontal stack") || lower.includes("stack cards") || lower.includes("triad") || lower.includes("tujuan keamanan") || (lower.includes("pillar") && lower.includes("stack"))) return "horizontalStack";
  if (lower.includes("rail") || lower.includes("stepper") || lower.includes("lifecycle") || lower.includes("rantai serangan")) return "connectedRailStepper";
  if (lower.includes("ascending") || lower.includes("maturity") || lower.includes("kematangan") || lower.includes("intensity")) return "ascendingColumns";
  if (lower.includes("checklist") || lower.includes("periksa") || lower.includes("governance")) return "checklist";
  if (lower.includes("closing") || lower.includes("tindakan") || lower.includes("next step") || lower.includes("langkah")) return "closingAction";
  if (lower.includes("hero") || lower.includes("cover") || lower.includes("title")) return "hero";
  if (lower.includes("two") || lower.includes("column") || lower.includes("split")) return "twoColumn";
  if (lower.includes("process") || lower.includes("step") || lower.includes("tahapan") || lower.includes("alur")) return "process";
  if (lower.includes("timeline") || lower.includes("roadmap") || lower.includes("linimasa")) return "timeline";
  if (lower.includes("table") || lower.includes("comparison") || lower.includes("matriks") || lower.includes("matrix")) return "tableComparison";
  if (lower.includes("flow") || lower.includes("diagram") || lower.includes("architecture")) return "flowDiagram";
  if (lower.includes("stat") || lower.includes("metric") || lower.includes("number")) return "stats";
  if (lower.includes("bold") || lower.includes("impact") || lower.includes("cta")) return "boldStatement";
  if (lower.includes("chart") || lower.includes("bar")) return "chartBar";
  if (lower.includes("donut") || lower.includes("pie")) return "chartDonut";
  if (lower.includes("insight") || lower.includes("quote")) return "keyInsight";
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

  // Closing / Wrap-up (strictly for the final slide only per Rule §5)
  if (
    isLast &&
    (lowerLayout.includes("closing") ||
      lowerTitle.includes("closing") ||
      lowerTitle.includes("penutup") ||
      lowerTitle.includes("kesimpulan") ||
      lowerTitle.includes("next step") ||
      lowerTitle.includes("langkah berikutnya") ||
      lowerTitle.includes("tindakan selanjutnya") ||
      lowerTitle.includes("action plan") ||
      lowerTitle.includes("terima kasih") ||
      lowerTitle.includes("thank you") ||
      slideNum >= totalSlides)
  ) {
    return "/bg-deck/itb-deck/closing-deck.png";
  }

  // Section divider / Part transition (Rule §5: Section dividers "Part N", break, guest hand-over)
  if (
    lowerLayout.includes("section") ||
    lowerLayout.includes("divider") ||
    /^(part|bagian|agenda utama|modul|bab)\s+\d+/i.test(lowerTitle.trim())
  ) {
    return "/bg-deck/itb-deck/part-deck.png";
  }

  // Task / Split comparison / Case study (Rule §5: 2-4 per deck for split case comparisons & profiles)
  if (
    lowerLayout.includes("split") ||
    lowerLayout.includes("case") ||
    lowerLayout.includes("profile") ||
    lowerLayout.includes("poll")
  ) {
    return "/bg-deck/itb-deck/task-speaker-deck.png";
  }

  // Default: Content deck (Rule §5: all standard content slides)
  return "/bg-deck/itb-deck/content-deck.png";
}

