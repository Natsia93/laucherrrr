export const PRE_LECTURE_RULES_MD = `---
name: pre-lecture-materials
description: Curate 2-3 verified, high-impact pre-lecture reading materials, articles, and activation tasks per session from any curriculum or syllabus (Universal Multi-Disciplinary Standard).
---

# Pre-Lecture Material & Readings: Master Rules and Workflow
### Universal Institutional & Professional Education Standard (Multi-Disciplinary)

This document establishes the universal operating rules and workflow for curating pre-lecture reading materials and activation protocols across any professional or academic domain (Data Science & AI, Software Engineering, Product & Strategy, Strategic Finance, Digital Marketing, UI/UX Design, Governance, and Executive Leadership).

---

## 0. Command and Scope

**Trigger:** \`READINGS [session code / topic]\`, for example \`READINGS L1\`, \`READINGS Module 2\`, or providing a syllabus/curriculum document.

**Operating Principle:**
Curate **2–3 pre-lecture readings** per live lecture or workshop session.
Every source must be an authentic, authoritative publication. Never invent URLs, authors, or statistics. If a deep link is unverified, flag it as \`[VERIFY LINK]\`.

---

## 1. Purpose & Philosophy

Pre-lecture reading is for **activation, not instruction**.
- **Mental Priming:** Readings introduce core concepts and mental models so learners arrive at class already holding the central question the lecture will answer.
- **Not Lecture Replacement:** Readings must NOT replace the lecture, pre-teach the worked examples step-by-step, or spoil in-class exercises, simulations, or graded case studies.
- **Reading Load:** Target **25–40 minutes total per lecture**, calibrated into **Must Read** (essential foundation) and **Recommended** (enrichment/practitioner angle).

---

## 2. Required Inputs & Structure Mapping

| Input | Priority | Purpose |
|---|---|---|
| Curriculum / Syllabus / Session Breakdown | Required | Identifies session code, topic, subtopics, module, and learning goals |
| Target Audience & Professional Level | Recommended | Calibrates technical depth and avoids introductory primers |
| Graded Assignments & Case Study Briefs | Recommended | Enforces strict spoiler protection (Section 5) |
| Program Schedule & Calendar | Optional | Checks weekly student workload and holiday pauses |

**If only session titles or topics are provided**, proceed with: **Session Title · Module/Track · Estimated Learning Goal**.

---

## 3. Multi-Disciplinary Source Selection & Recency

### 3.1 Recency Rules by Content Category

| Category | Example Fields | Recency Rule |
|---|---|---|
| **Foundational & Method Concepts** | Math, Statistics, Financial Accounting, Design Principles, Classic Strategy | **Credibility over recency.** Foundational textbooks, seminal papers, university lecture notes (MIT, Stanford, Harvard), and classic HBR articles are acceptable regardless of publication year. State the year. |
| **Tools, Libraries, Languages & AI** | Python, TypeScript, Cloud Architecture, ML Frameworks, LLM APIs, DevOps | **2024 or later.** Must match the active, stable version learners use. Official documentation must be the current release, never archived or deprecated docs. |
| **Regulation, Legal & Governance** | Data Privacy (UU PDP, GDPR), Financial Regulations (OJK, SEC), AI Ethics (NIST AI RMF, EU AI Act) | **Current and strictly in force.** Confirm status and append: *"Regulation status checked as of [Current Date]"*. |
| **Industry Practice & Engineering** | Architecture deep dives, post-mortems, growth frameworks | Recent 2–3 years preferred. Engineering blogs from tier-1 companies (AWS, Netflix, Stripe, Google, Meta, Hugging Face, etc.). |

### 3.2 Acceptable vs. Forbidden Sources

| ✅ Allowed & Preferred | ❌ Strictly Prohibited |
|---|---|
| Official documentation from software/framework maintainers | Product marketing, sales landing pages, or pricing sheets |
| Peer-reviewed papers and reputable preprints (arXiv, IEEE, ACM) | Unsigned vendor blogs designed purely for SEO backlinking |
| Educational explainers from tier-1 institutions (HBR, MIT Sloan, MDN) | SEO content farms, content scrapers, or AI-generated glossary mills |
| Engineering blogs detailing *how* a system was built or tested | Vague puff pieces about one company's quarterly revenue |
| Verified regulator portals, standards bodies, and official public statistics | Certification exam dump websites or paid course sales funnels |

### 3.3 Citation Tiers
Every assigned reading must be tagged with one of the following tiers:
- **\`Official Docs\`**: Maintainer documentation, API specifications, user guides.
- **\`Academic / Peer-Reviewed\`**: Published papers, research summaries, university course notes.
- **\`Regulator / Standard\`**: Official government gazettes, regulatory frameworks, industry standards.
- **\`Practitioner / Engineering\`**: High-credibility engineering blogs, industry whitepapers, executive management reviews.

### 3.4 Local & Regional Grounding
When the curriculum operates within a specific regional jurisdiction (e.g. Indonesia 🇮🇩, Southeast Asia, or EU), include credible local sources where relevant (e.g., Komdigi, OJK, Bank Indonesia, BPS, Katadata, Kontan) tagged with the regional flag (e.g. 🇮🇩). Do not pad generic theoretical sessions with weak local links just to meet a quota.

---

## 4. Learner Calibration & Anti-Primer Rule

Target the **gap between baseline intuition and professional execution**:
- Do **not** assign beginner primers that define terms experienced participants already know (e.g., "What is SQL", "Introduction to Marketing", "What is an Income Statement").
- Focus on readings that challenge how professionals *apply* the concept, expose common edge cases, resolve trade-offs, or introduce mental models.

---

## 5. Alignment & Spoiler Protection (Hard Rules)

1. **Spoiler Protection:**
   - A reading or guiding question must NEVER give away the answer to an in-class warm-up hook, live poll, worked case study, or graded take-home assignment.
   - Guiding questions must *point toward* an analytical dilemma without solving it.
2. **Tool Phase & Security:**
   - Pre-lecture readings must match the tool restrictions of the program phase (e.g., if AI agents are restricted in early weeks, do not assign tutorials that show AI agents auto-generating the deliverables).
   - Never assign or encourage uploading proprietary, confidential, or enterprise data into free-tier, unverified AI services.

---

## 6. Reading Load & Time Budget

- **Target:** **25–40 minutes total reading time per lecture**.
- Divide readings into:
  * **1–2 Must Read** (~15–25 min): Crucial for entering the lecture.
  * **1 Recommended** (~10–15 min): Deeper dive or practitioner case study.
- For long publications (books, 30-page papers, extensive docs), **specify the exact chapters, sections, or page ranges to read**.

---

## 7. Output Format per Session

Deliver each session using this standard structured format:

\`\`\`markdown
### 📖 Pre-Lecture Readings: [Session Code / Session Title]
**Topic:** [Topic from Curriculum]  
**Module / Track:** [Module Name & Week]  
**Reading Load:** Must Read ~[X] min | Total ~[Y] min  

#### 1. [Must Read] [Title of Reading / Documentation Section]
- **Source & Year:** [Publisher / Maintainer / Author] ([Year or "Undated with rationale"])
- **Link:** [Direct URL or Official Domain Path]
- **Tier:** [Official Docs · Academic · Regulator/Standard · Practitioner]
- **Language:** [English / Bahasa Indonesia 🇮🇩]
- **What to Read:** [Specify exact sections / headings / pages, e.g. "Section 2.1 through 2.4 only"]
- **Why This Matters (Activation):** 2–3 concise sentences framing why understanding this mental model is essential before entering the live lecture.
- **Key Takeaways:**
  1. [Core takeaway 1]
  2. [Core takeaway 2]
  3. [Core takeaway 3]
- **Guiding Questions:** 2 thought-provoking questions to hold in mind while reading (no spoilers).
- **Notes / Caveats:** [Tool version note, regulation effective date, or jurisdiction note]

#### 2. [Recommended] [Title of Secondary Reading / Practitioner Perspective]
- **Source & Year:** ...
- **Link:** ...
- **Tier:** ...
- **What to Read:** ...
- **Why This Matters (Activation):** ...
- **Key Takeaways:** ...
- **Guiding Questions:** ...

---
#### 🎒 Bring to Class (Preparation Checklist)
- [ ] **Tools & Environment:** [Software, accounts, or libraries that must be installed and verified before class]
- [ ] **Artifacts & Data:** [Specific datasets, templates, or files to have open on their machine]
- [ ] **Discussion Primer:** [One question, observation, or real-world example the student should formulate beforehand for in-class discussion]
\`\`\`

---

## 8. Anti-Fabrication & Strict Grounding Directives

1. **Never Invent Data:** URLs, titles, journal names, and regulatory numbers must be authentic.
2. **Strict Adherence:** When this rulebook is loaded into context, DO NOT summarize or explain this rulebook to the user. Immediately execute the pre-lecture curation task according to the rules and output format specified above.
`;

export const CURRICULUM_DECK_OUTLINE_MD = `---
name: curriculum-deck-outline
description: Transform raw curricula, syllabi, course documents, or lecture topics into structured 120-minute executive slide deck specifications (Claude Mode A / RevoU × Institutional standard).
---

# Executive & Professional Certificate Curriculum-to-Deck Standard (Mode A)

This file defines the slide types and the per-slide spec format used when generating a lecture deck from curriculum documents. Every slide is written as an individual spec, approved batch by batch, and then built directly as presentation slides.

---

## 1. The per-slide spec

Every slide is written in this exact block. No exceptions, including Break and Section Divider slides.

\`\`\`markdown
### Slide [N] · Block [1/2] · [Arc stage] · [Slide type]
**Title:** …
**Subtitle:** …
**Body:** …
**Visual / layout prompt:** …
**🎤 Speaker notes:** …
\`\`\`

| Field | What goes here | Appears on the slide? |
|---|---|---|
| **Header** | Slide number, block, arc stage, slide type | No — production label only |
| **Title** | The slide headline (action-oriented conclusion, not a passive topic) | Yes |
| **Subtitle** | Supporting context or framing line | Yes |
| **Body** | Bullets, steps, table content, quiz options, exercise instructions, handout flags | Yes |
| **Visual / layout prompt** | Design instruction: layout, chart, table, diagram, emphasis, icon use | **No** — drives the build only |
| **🎤 Speaker notes** | What the instructor says or needs to know; full case text on Case Display slides | No — goes into notes pane |

**Rules**
- **Arc stage** is strictly one of: **Hook · Foundation · Model · Practice · Bridge · Recap · Break · Synthesis · Close**.
- Write "—" for any field the slide type doesn't use. Never delete a field.
- Design instructions go only in **Visual / layout prompt**. Never put "add a chart" or "insert table" in the Body.
- One core concept per slide.
- Every example, statistic, or story is labelled **[REAL — cited: source]** or **[ILLUSTRATIVE — composite, illustrative example]**. No unverified figures.
- SME quotes are preserved verbatim, never paraphrased or translated on the slide.

---

## 2. Deck skeleton (standard 120-minute lecture)

| Position | Slide types | Block · Arc stage |
|---|---|---|
| Opening | 1 Title → 2 Learning Objectives | Block 1 · Hook |
| Each chapter start | 12 Section Divider | Block 1 or 2 · Foundation |
| Block 1 concept | 5 Case Study (hook) → 3 / 4 / 6 / 7 / 8 content → 9 / 10 engagement → 15 Model | Block 1 · Hook → Foundation → Model |
| Block 1 exercise | 18 Case Display (if a case is used) → 17 Exercise → 13 Recap or 11 Key Insight | Block 1 · Practice → Recap |
| Break | 19 Break | Break |
| Block 2 opening | 16 Bridge | Block 2 · Bridge |
| Block 2 concept | 3 / 4 / 6 / 7 / 8 content → 9 / 10 engagement → 15 Model | Block 2 · Foundation → Model |
| Block 2 exercise | 18 Case Display (if used) → 17 Exercise | Block 2 · Practice |
| Close | 20 Session Synthesis → 14 What's Next | Block 2 · Synthesis → Close |

**Timing and slide ranges**
- Block 1: Concept + Worked Case: ~40 min, 14–18 slides
- Block 1: Exercise & Q&A: ~20 min (15 exercise / 5 Q&A), 3–5 slides
- Break: ~5 min, 1 slide
- Block 2: Concept + Worked Case: ~35 min, 12–16 slides
- Block 2: Exercise & Q&A: ~20 min (15 exercise / 5 Q&A), 4–6 slides
- **Total: 120 min, ~34–46 slides** (Case Display slides extra).

---

## 3. Slide type library (20 types summary)
1. Title / Opening
2. Learning Objectives
3. Standard Content
4. Extended Content with Visual
5. Case Study (Hook)
6. Data / Stat
7. How-To / Step-by-Step
8. Framework / Concept
9. Reflection / Discussion
10. Quiz / Knowledge Check
11. Key Insight
12. Section Divider (Chapter Title)
13. Recap
14. What's Next
15. Model / Worked Example
16. Bridge
17. Exercise
18. Case Display
19. Break
20. Session Synthesis

---

## 4. Anti-Summarize Directive
When this document is attached, DO NOT summarize this document. Read and follow all 20 slide types and 5-field specs strictly to convert the user's curriculum or topic into a full slide deck outline.
`;
