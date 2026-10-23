---
name: itb-deck-design-rules
description: Visual design and content generation rules for ITB × RevoU "Data-Driven & AI-Enabled Decision Making for Leaders" slide decks. Use this skill whenever generating, rebuilding, restyling, or reviewing any deck, slide, module deck, mentoring deck, or prompt outline for the ITB program or any RevoU × ITB partnership deck. Covers single font (Red Hat Display), strict color palette (Deep Blue #005AAB, Golden Yellow #FFDD3C), components (Prompt card, Insight bar, HANDS-ON tag), universal AI model compatibility (Claude, DeepSeek, GPT, Gemini), and speaker notes.
license: Proprietary
---

# ITB × RevoU Deck Design Rules

These rules keep every generated deck visually consistent, authoritative, and aligned with institutional standards, whatever the module or week. Follow them for every slide. When a rule and an outline conflict, keep the outline's wording and apply the rule to the visual form.

The guiding idea: **One visual identity, many layouts.** Fonts, colors, backgrounds, and components never change. The layout of each slide is chosen from what that slide has to say.

---

## 1. Canvas & Text Economy

- **16:9 Widescreen**, designed at **1920 × 1080 px** (all sizes in px at that canvas; 1 pt ≈ 2 px).
- **Minimum readable text size:** **24 px** (12 pt). Never go below it, including table cells, labels, and captions.
- **Text density limit:** Keep about **170 words per slide at most**. If an outline slide is denser, split it into two slides or move detail to speaker notes.

---

## 2. Typography: Single Font Hierarchy

One font family only across all slides: **Red Hat Display** (fallback: sans-serif). No second font.

| Role | Size | Weight | Color |
|---|---|---|---|
| Cover title | 104 px | 700 (Bold) | Navy `#174A7F` |
| Cover subtitle | 46 px | 600 (SemiBold) | Deep Blue `#005AAB` |
| Cover meta (week, program, facilitator) | 30 px | 300 (Light Italic) | Grey `#666666` |
| Divider title | 96–100 px | 700 (Bold) | White `#FFFFFF` |
| Slide title | 72 px | 700 (Bold) | Deep Blue `#005AAB` |
| Lead / subtitle line under title | 30 px | 400 (Regular) | Dark `#272525` |
| Meta line (timing, format, e.g. "8 minutes, individual") | 26 px | 400 (Regular) | Grey `#595959` |
| Card / block heading | 28–36 px | 700–800 (Bold) | `#272525` or white on blue |
| Body text | 24–30 px | 400–600 | Dark `#272525` |
| Small label (UPPERCASE, letter-spacing 2px) | 24 px | 700 (Bold) | `#005AAB`, or `#595959` for neutral |
| Big numbers / stats | 56–300 px | 800 (ExtraBold) | `#005AAB` (or text color of its card) |

### Title & Body Rules
- **Action Titles:** Titles must be **left-aligned**, stating the actual insight or conclusion in 1 full sentence (max 2 lines).
- **Never end a title with a period.**
- **Body line-height:** 1.25–1.35. Never double-spaced.
- **Bold:** Only for lead-ins (`Note:`, `Rule:`, `Key insight:`) and exactly one key phrase per block.
- **Italic:** For verbatim quotes, example answers, and "how to spot it" diagnostic descriptions.

---

## 3. Strict Institutional Color Palette

Only these colors. Do not introduce new colors (no random red, green, or purple).

| Name | HEX | Use |
|---|---|---|
| **Deep Blue** | `#005AAB` | Titles, primary cards, table headers, key messages, icons |
| **Golden Yellow** | `#FFDD3C` | Partner cards, accents, tags, HANDS-ON tag, highlights |
| **Blue Gradient** | `#005AAB` → `#007AE8` | Full-bleed panels only (cover, divider, split panel) |
| **Soft Yellow** | `#FFEC8E` | Note boxes, highlighted cells, part tags |
| **Pale Yellow** | `#FFF6CC` | Background band for a highlighted group of rows |
| **Light Blue** | `#EAF2FB` | Table stripes, light rows, soft cards |
| **Light Grey** | `#F1F1F1` | Context boxes, "weak/before" panels, chat bubbles |
| **Border Blue-Grey** | `#9FB8D6` / `#D6E4F5` | Thin rules, dividers, mock-document borders |
| **Neutral Grey** | `#9A9A9A` | Dashed "fragile / don't" outlines and icons only |
| **Text** | `#272525` | All body text on light backgrounds |
| **White** | `#FFFFFF` | Text on blue cards; card fill |

### Color Roles & Alternation
- **Solid Blue** = The conclusion, the governance rule, the "good" option, the key message (white text).
- **Solid Yellow** = Equal-weight partner to blue, or the call to action (near-black text).
- **White or Light Blue** = Longer explanatory text, worksheets, forms.
- **Light Grey / Dashed Grey** = The "weak", "before", "fragile", or "don't" side of a comparison.
- **Alternation Rhythm:** For 2–5 parallel items or steps, **alternate Yellow → Blue → Yellow**, starting with yellow.

### Mandatory Contrast Rules
- White text on blue: YES. Near-black (`#272525`) on yellow: YES.
- **NEVER white text on yellow.**
- **NEVER yellow text on white.** (Fails WCAG contrast).
- **NO emoji as bullets or status markers.** Status is always spelled out in words:
  * `OK` / `Risk` / `Wrong`
  * `Pass` / `Partial` / `Fail`
  * `Low` / `Medium` / `High`

---

## 4. Components & Component Specifications

- **Rounded Cards:** Corner radius 16–22 px, internal padding 22–36 px, no drop shadows, no gradient cards.
- **Header-Band Card:** White body, 3 px colored border, colored top band containing the section label.
- **Part / Section Tag:** Soft Yellow (`#FFEC8E`) pill, 24 px uppercase, placed above the title (e.g. `AFTER THE GUEST`, `MENTOR REFERENCE`).
- **HANDS-ON Tag:** Solid Golden Yellow (`#FFDD3C`) pill beside the title, 26 px bold, letter-spacing 2px, text `HANDS-ON`. The meta line underneath states time and format (e.g. `10 minutes, squad`).
- **Prompt Card (AI Prompts & Templates):** White card, 3 px Deep Blue border, small uppercase blue label (`PROMPT` or `PASTE THIS PROMPT`), prompt text 24–30 px in quotes, blanks as **`[bold bracketed placeholders]`** in blue.
- **Note Box:** Soft Yellow (`#FFEC8E`), radius 16 px, bold lead-in (`Note:`, `Rule:`, `Remember:`). Maximum 1 note box per slide.
- **Insight Bar:** Deep Blue background with a 14 px yellow left edge, white text, bold lead-in (`Key insight:`, `The leadership shift:`).
- **Stat Card:** Solid yellow or blue, big number (64–110 px, weight 800) + short caption. Numbers must come strictly from user outline (never fabricated).
- **Tables:** Deep Blue header row with white semibold text; body rows alternate `#EAF2FB` and white; no vertical gridlines; first column bold; cell padding ~12–22 px; text 24–28 px. Keep all rows from outline.
- **Forms / Worksheets:** White card with 3 px blue border, blue header strip with uppercase form title, ruled rows inside, checkbox pills for options (`☐ Ready` / `☐ Risk` / `☐ Needs follow-up`).
- **Connectors:** 4–6 px Deep Blue lines, dashed for relationships, solid for workflow; small triangular arrowheads. No curved decorative swooshes.

---

## 5. Universal AI Model Compatibility Guidelines

To ensure that **Claude, DeepSeek, GPT-4o, and Gemini** can generate and parse ITB deck specifications without hallucinations or schema breaks:

1. **Structured Chunking:** Prompts must enforce pure JSON array output without markdown ticks when called via API.
2. **Explicit Schema:** Every slide object must include:
   ```json
   {
     "slideNumber": 1,
     "layout": "hero" | "twoColumn" | "process" | "timeline" | "tableComparison" | "flowDiagram" | "bullets" | "stats" | "boldImpact",
     "title": "Action Title Stating Conclusion",
     "subtitle": "Strategic context or meta line",
     "badge": "ITB LEADERSHIP",
     "bgStyle": "white" | "yellowGradient" | "boldYellow",
     "speakerNotes": "2-4 sentences explaining facilitator guidance and common student pitfalls.",
     "bullets": ["Poin 1", "Poin 2"]
   }
   ```
3. **No Fabricated Numbers:** If user input does not supply real metrics, use visible bracketed placeholders (`[INSTRUCTOR TO CONFIRM]`, `[X]-minute`, `[__]%`).
4. **Action Verb First:** Learning objectives and action items always start with an executive action verb (`Establish`, `Evaluate`, `Synthesize`, `Deploy`, `Audit`).

---

## 6. Speaker Notes Policy

Add notes only where the instructor/facilitator needs context:
- Explains the **pedagogical intent** of the slide and the key takeaway to land.
- Gives **exact timing** for exercises and what to watch for while circulating.
- Anticipates **common student questions or confusions** and provides the model answer.
- States **setup** required beforehand.
- Never blindly repeat the slide text. Keep to 2–5 high-value sentences.
