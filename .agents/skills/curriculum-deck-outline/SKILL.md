---
name: curriculum-deck-outline
description: Transform raw curricula, syllabi, course documents, or lecture topics into structured 120-minute executive slide deck specifications (Claude Mode A / RevoU × Institutional standard). Use whenever generating, designing, or outlining slide deck blueprints from educational or training curricula with 20 slide types, strict 5-field per-slide specs, 9 arc stages, and 2-block lecture flows.
---

# Knowledge Base: Slide Format Reference
## Executive & Professional Certificate Curriculum-to-Deck Standard (Mode A)

This file defines the slide types and the per-slide spec format used when generating a lecture deck from curriculum documents. Every slide is written as an individual spec, approved batch by batch, and then built directly as presentation slides.

---

## 1. The per-slide spec

Every slide is written in this exact block. No exceptions, including Break and Section Divider slides.

```markdown
### Slide [N] · Block [1/2] · [Arc stage] · [Slide type]
**Title:** …
**Subtitle:** …
**Body:** …
**Visual / layout prompt:** …
**🎤 Speaker notes:** …
```

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

| Block | Duration | Approx. slides |
|---|---|---|
| Block 1: Concept + Worked Case | ~40 min | 14–18 |
| Block 1: Exercise & Q&A | ~20 min (15 exercise / 5 Q&A) | 3–5 |
| Break | ~5 min | 1 |
| Block 2: Concept + Worked Case | ~35 min | 12–16 |
| Block 2: Exercise & Q&A | ~20 min (15 exercise / 5 Q&A) | 4–6 |
| **Total** | **120 min** | **~34–46** (Case Display slides extra) |

---

## 3. Slide type library (20 types)

### 1. Title / Opening
*Use for: first slide of every lecture.*

```markdown
### Slide 1 · Block 1 · Hook · Title
**Title:** [Session title]
**Subtitle:** [Week n · Module n — Module title]
**Body:** 👥 Instructor: [Name] · 🗓️ [Date] · ⏱️ 120 minutes
**Visual / layout prompt:** Full-bleed brand title layout; accent bar; clean typography.
**🎤 Speaker notes:** —
```

### 2. Learning Objectives
*Use for: slide 2 of every lecture.*

```markdown
### Slide 2 · Block 1 · Hook · Learning Objectives
**Title:** What You'll Be Able to Do by the End of This Session
**Subtitle:** Learning Objectives
**Body:**
- ✅ [Action verb + outcome]
- ✅ [Action verb + outcome]
- ✅ [Action verb + outcome]
**Visual / layout prompt:** Three stacked rows with check icons; one objective per row.
**🎤 Speaker notes:** [Which objective each block delivers]
```
Use verbs at Understand → Apply → Analyze (identify, classify, evaluate, rank, structure, produce). Never "understand" or "be familiar with".

### 3. Standard Content
*Use for: core concept delivery.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Standard Content
**Title:** [Main title]
**Subtitle:** [Supporting context]
**Body:**
- **Point 1:** [Explanation]
- **Point 2:** [Explanation]
- **Point 3:** [Explanation]
**Visual / layout prompt:** Text-only, three labelled points.
**🎤 Speaker notes:** [Talking points / transitions]
```

### 4. Extended Content with Visual
*Use for: a concept that needs a chart, table, or diagram.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Extended Content
**Title:** [Main title]
**Subtitle:** [Supporting context]
**Body:** [Points or table content]
**Visual / layout prompt:** [e.g., "2-column comparison table: Option A vs. Option B — rows: operational impact, cost, risk exposure."]
**🎤 Speaker notes:** [How to walk the visual]
```

### 5. Case Study (Hook)
*Use for: opening hook or a mid-chapter anchor. Not for exercises — use 18 Case Display there.*

```markdown
### Slide [N] · Block [1/2] · Hook · Case Study
**Title:** 📖 Case: [Situation]
**Subtitle:** [One line — what this case illustrates] · [REAL — cited / ILLUSTRATIVE]
**Body:**
- **What happened:** [Brief description]
- **The decision on the table:** [What had to be decided]
- **Where a single-lens view misled:** [What was missed]
- **What an executive/leader would have flagged:** [The lesson]
**Visual / layout prompt:** Four labelled boxes, left to right.
**🎤 Speaker notes:** Pause — ask: "Which perspective would have caught this first?"
```

### 6. Data / Stat
*Use for: market data, regulatory facts, research findings.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Data / Stat
**Title:** 📊 [Headline finding]
**Subtitle:** [Source, year — and what it means for leaders/managers]
**Body:**
- **[Stat 1]:** [Number + meaning]
- **[Stat 2]:** [Number + meaning]
**Visual / layout prompt:** Large-number callouts or a simple bar chart; source cited on slide.
**🎤 Speaker notes:** [Context; regulation status checked as of [date] if regulatory]
```
Only figures from a cited source. Never invent statistics.

### 7. How-To / Step-by-Step
*Use for: workflows and live demos.*

```markdown
### Slide [N] · Block [1/2] · Model · How-To
**Title:** 🛠️ [Task or workflow name]
**Subtitle:** [When and why you do this]
**Body:**
1. **[Step name]:** [What to do]
2. **[Step name]:** [What to do]
3. **[Step name]:** [What to do]
**Visual / layout prompt:** Numbered horizontal flow; or annotated live tool screenshot placeholder.
**🎤 Speaker notes:** [e.g., "Demo live: walk through the workflow steps in tool/spreadsheet."]
```

### 8. Framework / Concept
*Use for: mental models, matrices, taxonomies.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Framework
**Title:** 🧠 [Framework name]
**Subtitle:** [What this framework helps decide]
**Body:**
- **Component 1:** [Definition + when it applies]
- **Component 2:** [Definition + when it applies]
- **Component 3:** [Definition + when it applies]
**Visual / layout prompt:** [e.g., "Three-perspective matrix: columns X / Y / Z; rows = options."]
**🎤 Speaker notes:** [How to introduce it; which prior session it builds on]
```

### 9. Reflection / Discussion
*Use for: mid-block check-ins.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Reflection
**Title:** 🙋 Let's Reflect
**Subtitle:** [Prompt title]
**Body:**
- ❓ [Question 1]
- ❓ [Question 2]
**Visual / layout prompt:** Question cards, large type.
**🎤 Speaker notes:** Allow [X] minutes for individual reflection or small-group discussion before sharing a perspective.
```
Individual or small group only — never pairs.

### 10. Quiz / Knowledge Check
*Use for: recall after a concept cluster (every 8–10 slides).*

```markdown
### Slide [N] · Block [1/2] · Foundation · Quiz
**Title:** ✅ Quick Check
**Subtitle:** [Topic tested]
**Body:**
- ❓ **Q1:** [Question] — A) … B) … C) … D) …
- ❓ **Q2:** [Question] — A) … B) … C) … D) …
**Visual / layout prompt:** Two question panels; options in a 2×2 grid.
**🎤 Speaker notes:** Answers: Q1 [x] — [why]; Q2 [x] — [why]. Use a live poll if available.
```

### 11. Key Insight
*Use for: closing a chapter or a complex concept; can close Block 1.*

```markdown
### Slide [N] · Block [1/2] · Recap · Key Insight
**Title:** 💡 Key Insight
**Subtitle:** [The core idea in one sentence]
**Body:**
> "[Memorable framing — SME quote verbatim, or a principle]"
- **Why it matters:** [Practical consequence for leaders/managers]
- **Remember:** [The one thing not to forget]
**Visual / layout prompt:** Large pull-quote, accent left border.
**🎤 Speaker notes:** [Source of the quote / principle]
```

### 12. Section Divider (Chapter Title)
*Use for: opening every chapter.*

```markdown
### Slide [N] · Block [1/2] · Foundation · Section Divider
**Title:** ▶ Chapter [n]: [Chapter title exactly as in the curriculum draft]
**Subtitle:** —
**Body:** —
**Visual / layout prompt:** Divider layout, chapter number large; no teaching content.
**🎤 Speaker notes:** [One-line transition from the previous chapter]
```
Never rename, merge, or reword the chapter title.

### 13. Recap
*Use for: mini-recap closing Block 1 before the break, or an end-of-chapter recap.*

```markdown
### Slide [N] · Block 1 · Recap · Recap
**Title:** 🔁 Recap
**Subtitle:** What We've Covered So Far
**Body:**
- ✅ [Key point 1]
- ✅ [Key point 2]
- ✅ [Key point 3]
**Visual / layout prompt:** Checklist layout.
**🎤 Speaker notes:** [Link to what Block 2 will add]
```
No "coming up next" line — that belongs on What's Next.

### 14. What's Next
*Use for: the final slide of every lecture, after Session Synthesis.*

```markdown
### Slide [N] · Block 2 · Close · What's Next
**Title:** What's Next
**Subtitle:** Before the Next Session
**Body:**
- 📋 **Start Capstone / Milestone [n] — [deliverable]:** apply [today's habit / framework]
- 🗓️ **Submit by:** [from Curriculum Document] / [CONFIRM SUBMISSION DATE]
- 📖 **Pre-lecture study (optional):** [Pre-reading topic]
- **Next session:** [Title of the next module]
**Visual / layout prompt:** Three action rows with icons; next session in a footer band.
**🎤 Speaker notes:** —
```

### 15. Model / Worked Example
*Use for: the last concept slide(s) of every Concept block, before the exercise.*

```markdown
### Slide [N] · Block [1/2] · Model · Model / Worked Example
**Title:** [Concept] Applied: [Scenario]
**Subtitle:** [REAL — cited / ILLUSTRATIVE — composite]
**Body:**
1. **Situation:** [Corporate scenario, key numbers]
2. **Apply the concept:** [Step-by-step]
3. **What it shows:** [The conclusion an executive/leader draws]
**Visual / layout prompt:** [e.g., "Worked example calculation/comparison table with key result highlighted."]
**🎤 Speaker notes:** [Walkthrough script; where learners usually go wrong]
```

### 16. Bridge
*Use for: the first slide of Block 2. Replaces a new hook.*

```markdown
### Slide [N] · Block 2 · Bridge · Bridge
**Title:** [From Block 1 to Block 2 in one line]
**Subtitle:** —
**Body:**
- **In Block 1 you concluded:** [Outcome of the Block 1 exercise]
- **Now we add:** [What Block 2 introduces]
- **Watch for:** [What may change]
**Visual / layout prompt:** Two-panel "then → now" layout.
**🎤 Speaker notes:** [e.g., "In Block 1 we evaluated X. Now we add Y and Z — watch what happens to your ranking."]
```

### 17. Exercise
*Use for: the task slide of each Exercise block.*

```markdown
### Slide [N] · Block [1/2] · Practice · Exercise
**Title:** 🧩 Exercise: [Task name]
**Subtitle:** ⏱️ 15 minutes · 👤 Individual / 👥 Small group
**Body:**
- **Task:** [What learners do]
- **Decision point:** [The judgment call, or "what if" variation]
- **Expected output:** [What they produce]
- 📎 [HANDOUT REQUIRED: Sheets / Docs / Slide Template] — [contents and what learners fill in] *(only if needed)*
**Visual / layout prompt:** Task card layout with timer and format icons.
**🎤 Speaker notes:** Debrief prompt to open Q&A: "[question]"
```
Individual or small group only.

### 18. Case Display
*Use for: showing an exercise case, placed immediately before the Exercise slide. Split across two slides if needed (Case: Background / Case: The Numbers).*

```markdown
### Slide [N] · Block [1/2] · Practice · Case Display
**Title:** 📄 Case: [Name]
**Subtitle:** [REAL — cited / ILLUSTRATIVE — composite]
**Body:**
- **Situation:** [Condensed]
- **Entities:** [Who's involved]
- **Key numbers:** [Only the figures learners need]
- **The decision:** [What learners must answer]
**Visual / layout prompt:** Readable case card; key numbers in a small table.
**🎤 Speaker notes:** [FULL case text, exactly as given to learners]
```

### 19. Break
*Use for: the 5-minute break between blocks.*

```markdown
### Slide [N] · — · Break · Break
**Title:** ☕ Break — 5 Minutes
**Subtitle:** Back at [time]
**Body:** —
**Visual / layout prompt:** Minimal brand layout, large timer text.
**🎤 Speaker notes:** —
```

### 20. Session Synthesis
*Use for: closing Block 2, after Q&A and before What's Next.*

```markdown
### Slide [N] · Block 2 · Synthesis · Session Synthesis
**Title:** What You Do With This on Monday
**Subtitle:** [Target role — e.g., as an Executive / Leader / Manager]
**Body:**
- [Action 1 — concrete, tied to today's concept]
- [Action 2]
- [Action 3]
**Visual / layout prompt:** Three action cards; bold verbs.
**🎤 Speaker notes:** [Tie back to the session hook]
```

---

## 4. Engagement element quick-reference

| Element | When to use | Typical placement |
|---|---|---|
| Case Study (type 5) | Opening hook or mid-chapter anchor | Early in Block 1, or after a concept intro. Block 2 opens with a Bridge, not a case. |
| Trigger Question | Before a concept, to prime the learner | Before a Framework or Data slide |
| Quiz (type 10) | After a concept cluster | Every 8–10 slides |
| Demo (type 7) | Procedural or tool-based content | During How-To sections |
| Reflection (type 9) | Before or after a case or Model slide | Mid-block |
| Key Insight (type 11) | After a complex concept | Closing a chapter |
| Recap (type 13) | Retrieval practice | Last slide of Block 1 (mini-recap). The session ends with Synthesis + What's Next, not Recap. |

---

## 5. Batch planning guidance

- **Full lecture (~34–46 slides, Case Display slides extra):** batches of 8–10 slides.
- **Never generate more than 10 slides per batch** without user confirmation if output length is constrained.
- **Organise batches by block.** A Concept block normally takes two batches; an Exercise block takes one.
- **A batch never straddles a block boundary or the break.**
- Within a Concept block, align batch breaks to chapter breaks where possible.

---

## 6. Program anchors

Take names, case companies, personas, schedules, checkpoint weeks, assessment rules, and deliverables strictly from the curriculum or document provided by the user. Do not invent statistics, cases, quotes, or fictional deliverables. If a fact is needed and not provided, use visible bracketed placeholders: `[INSTRUCTOR TO CONFIRM]`, `[X]-minute`, `[date]`.
