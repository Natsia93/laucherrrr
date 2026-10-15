---
description: Aturan Baku "Otak AI" Gamma Slide Format Reference & SME Knowledge Base — Digunakan untuk Mode Gamma di Deck Generator Launcher OS
---

# Knowledge Base: Gamma Slide Format Reference

This file defines the slide format conventions used when generating slide outlines for Gamma. All Gamma Mode outputs must follow these formats.

---

## What Gamma expects

Gamma reads structured markdown and maps it to slide layouts. The hierarchy it uses:

| Markdown element | Gamma maps it to |
|---|---|
| `# Heading 1` | Slide title |
| `## Heading 2` | Slide subtitle or supporting context |
| `- Bullet point` | Body content / list item |
| `**Bold text**` | Emphasis / label |
| `---` (horizontal rule) | Slide break (new slide starts) |
| `🗒️ Note:` | Speaker note / design instruction |

Each slide is separated by `---`. Do not use `---` inside a slide — only between slides.

---

## Slide type library

### 1. Title / Opening Slide
*Use for: program intro, module opening, section title*

```markdown
# Slide 1: [Program or Module Title]
## [Subtitle — e.g., "Week 3 · Defensive Security Operations"]

- 👥 Instructor: [Name]
- 🗓️ Session: [Date / Week]
- ⏱️ Duration: [2 hours]

---
```

### 2. Learning Objectives Slide
*Use for: opening of every lecture session*

```markdown
# Slide [N]: What You'll Be Able to Do by the End of This Session
## Learning Objectives

- ✅ **Objective 1:** [Action verb + outcome — e.g., Identify the three phases of a SOC alert triage workflow]
- ✅ **Objective 2:** [Action verb + outcome]
- ✅ **Objective 3:** [Action verb + outcome]

---
```

### 3. Standard Content Slide
*Use for: core concept delivery*

```markdown
# Slide [N]: [Main Title]
## [Supporting Context or Framing]

- **Point 1:** Explanation
- **Point 2:** Explanation
- **Point 3:** Explanation

---
```

### 4. Extended Slide with Design Note
*Use for: slides needing a chart, table, template, or visual*

```markdown
# Slide [N]: [Main Title]
## [Supporting Context or Framing]

- **Point 1:** Explanation
- **Point 2:** Explanation
- **Point 3:** Explanation

🗒️ Note: [Design instruction — e.g., "Add a 2-column comparison table: Manual triage vs. AI-assisted triage" / "Insert timeline graphic" / "Text-only — no visual needed"]

---
```

### 5. Case Study / Incident Slide
*Use for: real-world anchoring, opening hooks*

```markdown
# Slide [N]: 📖 Case Study: [Incident Name]
## [One-line framing — what this case illustrates]

- **What happened:** [Brief factual description]
- **How it was detected (or missed):** [Key detail]
- **Business impact:** [Financial / reputational / operational consequence]
- **What defenders could have done:** [Lesson for SOC analysts]

🗒️ Note: [e.g., "Pause here — ask learners: where in the kill chain could this have been caught?"]

---
```

### 6. Data / Stat Slide
*Use for: market data, threat landscape numbers, research findings*

```markdown
# Slide [N]: 📊 [Headline Stat or Finding]
## [Context — source and what it means for defenders]

- **[Stat 1]:** [Number + what it means]
- **[Stat 2]:** [Number + what it means]
- **[Stat 3]:** [Number + what it means]

🗒️ Note: [e.g., "Source: IBM X-Force 2024 / Cite on slide" / "Add data visualisation — bar chart preferred"]

---
```

### 7. How-To / Step-by-Step Slide
*Use for: tool demonstrations, workflows, procedures*

```markdown
# Slide [N]: 🛠️ [Task or Workflow Name]
## [Context — when and why you do this]

1. **Step 1 — [Step name]:** [What to do]
2. **Step 2 — [Step name]:** [What to do]
3. **Step 3 — [Step name]:** [What to do]
4. **Step 4 — [Step name]:** [What to do]

🗒️ Note: [e.g., "Demo this live in Wazuh dashboard / Add annotated screenshot"]

---
```

### 8. Framework / Concept Slide
*Use for: mental models, taxonomies, matrices*

```markdown
# Slide [N]: 🧠 [Framework Name]
## [What this framework helps defenders do]

- **Component 1:** [Definition + when it applies]
- **Component 2:** [Definition + when it applies]
- **Component 3:** [Definition + when it applies]

🗒️ Note: [e.g., "Add MITRE ATT&CK matrix visual / Link to framework page"]

---
```

### 9. Engagement — Reflection / Discussion
*Use for: mid-session check-ins, discussion prompts*

```markdown
# Slide [N]: 🙋 Let's Reflect
## [Question or Prompt Title]

- ❓ [Question 1]
- ❓ [Question 2]
- ❓ [Question 3]

🗒️ Note: Allow [X] minutes for pair/group discussion before facilitator shares perspective.

---
```

### 10. Engagement — Quiz / Knowledge Check
*Use for: formative assessment, recall checks*

```markdown
# Slide [N]: ✅ Quick Check
## [Topic being tested]

- ❓ **Q1:** [Question]
  - A) [Option]  B) [Option]  C) [Option]  D) [Option]
- ❓ **Q2:** [Question]
  - A) [Option]  B) [Option]  C) [Option]  D) [Option]

🗒️ Note: Reveal answers on next slide / Use Mentimeter or Slido for live polling.

---
```

### 11. Key Insight / Takeaway Slide
*Use for: closing a chapter, highlighting a must-remember point*

```markdown
# Slide [N]: 💡 Key Insight
## [The core idea in one sentence]

> "[Memorable framing — can be a paraphrase of an SME quote or a principle]"

- **Why it matters:** [Practical consequence for a SOC analyst]
- **Remember:** [The one thing they should not forget]

---
```

### 12. Section Divider
*Use between major chapters within a session*

```markdown
# Slide [N]: ▶ [Section / Chapter Title]
## [One-line framing of what this section covers and why it matters]

---
```

### 13. Recap / Summary Slide
*Use for: end of session or end of chapter*

```markdown
# Slide [N]: 🔁 Session Recap
## What We Covered Today

- ✅ [Key point 1 — one sentence]
- ✅ [Key point 2 — one sentence]
- ✅ [Key point 3 — one sentence]

**Coming up next:** [Brief preview of next session]

---
```

### 14. Closing / What's Next Slide
*Use for: final slide of every session*

```markdown
# Slide [N]: What's Next
## Before the Next Session

- 📋 **Complete:** [Assignment or task due before next class]
- 🛠️ **Set up:** [Any tool or environment to prepare]
- 📖 **Read / watch (optional):** [Reference material]

**Next session:** [Title and brief description]

---
```

---

## Engagement element quick-reference

| Element | When to use | Typical placement |
|---|---|---|
| Case Study | Opening hook or mid-chapter anchor | Slides 2–4, or after concept intro |
| Trigger Question | Before introducing a concept (prime the learner) | Before a framework or stat slide |
| Quiz | After a cluster of concepts (recall check) | Every 8–10 slides |
| Simulation / demo | For procedural or tool-based content | During How-To sections |
| Reflection | Before or after a case study | Mid-session or pre-debrief |
| Key Insight | After a complex concept or data slide | Closing a chapter |
| Recap | End of chapter and end of session | Final 1–2 slides per block |

---

## Batch planning guidance

Recommended batch sizes:
- **Short session (≤30 slides):** Batches of 5–8 slides
- **Full session (30–50 slides):** Batches of 8–10 slides
- **Never generate more than 10 slides per batch** without user confirmation
Each batch should map to a logical chapter or topic block — not a random slice. When the instructor outline has named chapters, align batch breaks to chapter breaks.

---

## Known program anchors to use in slides

These are validated facts and quotes from the program's SME knowledge base. Use them to ground slides in real practitioner knowledge — do not invent statistics or examples.

**Incidents (use as case studies):**
- BSI ransomware — server downtime, customer withdrawals, reputational damage (banking sector)
- Crypto company exploit — attacker used application vulnerability to transfer funds
- Indonesian crypto app breach pattern (Marthin, May 2026)

**Key practitioner insights (use as Key Insight or opening hook):**
- "Exploit development used to take months. Now it takes hours." — Rasyid
- "It's almost impossible to teach how to attack systems within 3 months." — Purnaresa (AWS)
- "AI gives wrong cybersecurity answers 70% of the time — because the field is guardrailed in LLMs." — Pak Yohan (BINUS)
- "Blue Team: when everything is fine, you're not appreciated. When something breaks, you get blamed." — Pak Yohan
- "SOC is teachable in 3 months. Red Team is not." — Marthin

**Market facts (use as data slides):**
- Indonesia's cybersecurity talent is predominantly Jakarta-based, but competition winners come from Semarang, NTB, Sulawesi (Pak Yohan)
- Pentest market in Indonesia is saturated and commoditised — defensive roles are undersupplied (Rasyid, Marthin, Purnaresa — three independent SMEs)
- BINUS graduates typically enter at L2/L3 SOC level, not L1 (Rasyid, from hiring experience)

**Program tools in scope:**
Kali Linux · Security Onion · Wazuh · Splunk · IT-Sec Intel (subscription) · AWS (Sessions 4, 6, 10) · Hetzner VM infrastructure

**Certifications to reference:**
- CREST (global pentest gateway — Fundamentals exam has a 3-attempt lifetime limit; Pak Yohan confirmed bootcamp graduates fail this at high rates)
- AWS Security specialisation (Purnaresa context)
