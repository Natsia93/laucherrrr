---
name: binus-deck-design-rules
description: Visual design and content generation rules for BINUS × RevoU slide decks. Use this skill whenever generating, rebuilding, restyling, or reviewing any deck, slide, module deck, mentoring deck, or slide outline for any BINUS program or partnership deck — even if the user only says "make the deck", "continue the next week", "generate slides from this outline" or "make it consistent". Covers single font (Red Hat Display), strict color palette (Deep Blue #174A7F, Dominant Sky Blue #23A3E7, Golden Yellow #FFDE3D), the 8 supplied backgrounds, layout selection, exact element specs, PPTX export rules, and QA checklist.
---

# BINUS × RevoU Deck Design System
### A single source of truth for any AI (Claude, ChatGPT, Gemini, DeepSeek, etc.) that creates, restyles, reviews or exports slide decks for BINUS × RevoU executive and professional programs in Launcher OS.

> **How to use this file:** paste it (or attach it) before your request. Every rule is written as a measurable value. If a rule and the user's outline conflict, keep the outline's wording and apply the rule to the visual form. Never invent facts, numbers, names or dates.

---

## 0. Quick tokens (machine-readable)

```json
{
  "canvas": { "width_px": 1920, "height_px": 1080, "width_in": 13.333, "height_in": 7.5, "aspect": "16:9" },
  "units": { "px_to_pt": 0.5, "px_to_in": 0.006944, "px_to_emu": 6350, "pt_to_emu": 12700, "in_to_emu": 914400 },
  "font": { "family": "Red Hat Display", "fallback": ["Arial", "sans-serif"], "min_size_px": 24 },
  "type_scale_px": {
    "cover_title": 104, "cover_subtitle": 46, "cover_meta": 30,
    "divider_title": 96, "slide_title": 72, "lead": 30, "meta": 26,
    "card_heading": [28, 36], "body": [24, 30], "label": 24, "big_number": [56, 300]
  },
  "weights": { "light": 300, "regular": 400, "semibold": 600, "bold": 700, "extrabold": 800 },
  "line_height": { "titles": 1.1, "body": [1.25, 1.35] },
  "colors": {
    "deep_blue": "#174A7F",
    "medium_blue": "#018ED5",
    "dominant_sky_blue": "#23A3E7",
    "light_orange": "#F2941B",
    "deep_orange": "#E27F2D",
    "golden_yellow": "#FFDE3D",
    "soft_yellow": "#FFEC8E",
    "soft_sky_tint": "#EAF5FC",
    "light_grey": "#F4F6F8",
    "border_blue": "#B9D5E8",
    "border_subtle": "#E2EDF5",
    "text_dark": "#174A7F",
    "text_body": "#1E293B",
    "text_muted": "#64748B",
    "footer_grey": "#8C9BAE",
    "white": "#FFFFFF"
  },
  "spacing_scale_px": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  "radius_px": { "card": [12, 16], "pill": 999, "small": [6, 8] },
  "stroke_px": { "card_border": 2, "row_rule": [2, 3], "connector": [4, 6], "accent_bar": [12, 14] }
}
```

---

## 1. Canvas & Units

| Item | Value |
|---|---|
| Slide size | 1920 × 1080 px = **13.333 × 7.5 in** (PowerPoint "Widescreen 16:9"). Never use 10 × 5.625 in. |
| Unit conversion | 1 px = 0.5 pt = 1/144 in = 6,350 EMU. **Font size in pt = px ÷ 2.** |
| Content safe area (content slides) | x 108–1812 px, y 84–920 px (0.75–12.58 in, 0.58–6.39 in). Nothing below y 930 px. |
| Max words per slide | ~170. Denser content → split the slide or move detail to speaker notes. |
| Min text size | **24 px (12 pt)**, everywhere, including table cells, labels, captions, footnotes. |

---

## 2. Typography

**One family only: Red Hat Display** (Google Fonts, free). Fallback: Arial → sans-serif. Never mix a second font.

### 2.1 Type scale

| Role | px | pt (PPTX) | Weight | Color | Case / Style |
|---|---|---|---|---|---|
| Cover title | 104 | 52 | 700 Bold | Deep Blue `#174A7F` | Title Case |
| Cover subtitle | 46 | 23 | 600 Semibold | Medium Blue `#018ED5` | Title Case |
| Cover meta (module · cohort · facilitator) | 30 | 15 | 300 Light, italic | Slate `#64748B` | Sentence case, 3 lines |
| Divider title | 96–100 | 48–50 | 700 Bold | White `#FFFFFF` | Title Case |
| Divider label ("PART 2" / "MODUL 02") | 26 | 13 | 800 ExtraBold | Golden Yellow `#FFDE3D` | UPPERCASE, letter-spacing 2 px |
| Slide title | 72 | 36 | 700 Bold | Deep Blue `#174A7F` | Title Case, left-aligned, 1 line preferred (max 2) |
| Lead / subtitle under title | 30 | 15 | 400 | Medium Blue `#018ED5` or Dark Slate `#1E293B` | Sentence case |
| Meta line (timing, format) | 26 | 13 | 400 | Slate `#64748B` | "15 minutes, team breakout" |
| Card / block heading | 28–36 | 14–18 | 700–800 | Deep Blue `#174A7F`, or White on `#174A7F` / `#23A3E7` | Title Case |
| Body text | 24–30 | 12–15 | 400–600 | Dark Slate `#1E293B` | Sentence case |
| Small label | 24 | 12 | 700–800 | Medium Blue `#018ED5`, or Golden Yellow `#FFDE3D` on dark | UPPERCASE, letter-spacing 2 px |
| Big numbers / stats | 56–300 | 28–150 | 800 ExtraBold | Deep Blue `#174A7F` or Golden Yellow `#FFDE3D` | Numerals only |

### 2.2 Weight mapping (PowerPoint / Google Slides)

PowerPoint and Google Slides have **Bold on/off**. Map like this:

| Design weight | PPTX / Google Slides setting |
|---|---|
| 300 Light | Regular (or font name "Red Hat Display Light" if installed) |
| 400 Regular | Regular |
| 600 Semibold | **Bold** |
| 700 Bold | **Bold** |
| 800 ExtraBold | **Bold** (or font name "Red Hat Display ExtraBold" if installed) |

### 2.3 Text rules

- **Alignment:** titles and body left-aligned. Center only big numbers inside a card, divider-style statements and timers.
- **Line height:** titles 1.1; body 1.25–1.35 (PPTX: line spacing multiple 1.25–1.3). Never double-spaced.
- **Paragraph spacing:** use space-after 6–12 pt between paragraphs, never empty lines.
- **Letter spacing:** only on UPPERCASE labels: 2 px (PPTX `charSpacing` 1 pt). Never on body text.
- **Bold:** only for lead-ins ("Note:", "Rule:", "Key insight:", "Framework:") and one key phrase per block.
- **Italic:** only for quotes, prompts, case references and illustrative context descriptions.
- **Title length:** shorten the title rather than wrap to 3 lines.
- **Language (Strict Standard):**
  - Match the exact language requested by the user or used in the input topic.
  - If the user requests English (e.g., "in English", "bahasa Inggris", or writes the prompt/outline in English), ALL generated slide elements — titles, subtitles, card headers, body copy, badges, table headers, and speaker notes — MUST be written 100% in English.
  - Never translate or force an English deck into Indonesian.
  - Only retain Indonesian when the user explicitly requests Bahasa Indonesia or provides an Indonesian input outline.

---

## 3. Color System (BINUS Palette Standard)

### 3.1 Palette (use strictly these)

| Role | Colour Name | Hex Code | Purpose & Application |
|---|---|---|---|
| **Primary** | Deep Blue | `#174A7F` | Slide titles, table headers, primary cards, authority anchors, conclusion banners |
| **Secondary** | Medium Blue | `#018ED5` | Subtitles, secondary pill badges, subheadings, process connectors |
| **Dominant** | Light Sky Blue | `#23A3E7` | Main fills, active cards, diagram nodes, category blocks, interactive highlights |
| **Warm Support** | Light Orange | `#F2941B` | Warnings, comparative contrast, transition badges, intermediate steps |
| **Warm Emphasis** | Deep Orange | `#E27F2D` | Critical alerts, executive priority focus, high-impact callouts |
| **Accent** | Golden Yellow | `#FFDE3D` | Highlights, callouts, key numbers, HANDS-ON badge (use sparingly as high-value accent) |
| **Soft Accent** | Soft Yellow | `#FFEC8E` | Note boxes, warning callout cards, highlighted table rows |
| **Reading Tint** | Soft Sky Tint | `#EAF5FC` | Content card backgrounds, alternating table rows, clean reading surfaces |
| **Neutral Tint** | Light Grey | `#F4F6F8` | Context boxes, "before / baseline" cards in comparisons |
| **Border Blue** | Border Sky | `#B9D5E8` | Card borders, table dividers, framework container boundaries |
| **Neutral Space**| White | `#FFFFFF` | Slide background, primary card fill, high-contrast text on deep blue |
| **Footer** | Slate Light Grey | `#8C9BAE` | Slide footer metadata (`M#/L# · ##`) |
| **Text Dark** | Dark Slate | `#1E293B` | Body copy for maximum legibility on light surfaces |
| **Text Muted** | Slate | `#64748B` | Subtitles, captions, metadata lines |

### 3.2 Color roles & visual hierarchy

- **Dominant Tone:** Light Sky Blue (`#23A3E7`) is the dominant tone for visual energy, structural blocks, and active diagram nodes.
- **Authority & Conclusion:** Deep Blue (`#174A7F`) anchors titles, table headers, and the final key takeaways/conclusions.
- **Strategic Accent:** Golden Yellow (`#FFDE3D`) is strictly an accent—never use it as a massive wall-to-wall fill; use it for badges, stat numbers, and high-impact pills.
- **Contrast & Comparison:** Light Orange (`#F2941B`) and Deep Orange (`#E27F2D`) provide high-contrast warm support in comparisons, risks, caveats, or trade-offs.
- **Reading Comfort:** Standard reading cards use Soft Sky Tint (`#EAF5FC`) or pure White (`#FFFFFF`) with `#B9D5E8` borders, ensuring effortless scannability.

### 3.3 Strict contrast rules (non-negotiable)

| Background Surface | Allowed Text Color | Prohibited Text Color |
|---|---|---|
| Deep Blue `#174A7F` | White `#FFFFFF`, Golden Yellow `#FFDE3D` (stats/labels only) | Dark text, Orange |
| Light Sky Blue `#23A3E7` | White `#FFFFFF`, Deep Blue `#174A7F` (bold labels) | Yellow, Orange, Grey |
| Golden Yellow `#FFDE3D` | Deep Blue `#174A7F`, Dark Slate `#1E293B` | White (unreadable!), Light blue |
| Soft Sky Tint `#EAF5FC` | Dark Slate `#1E293B`, Deep Blue `#174A7F` | White, Yellow |
| White `#FFFFFF` / Light Grey | Dark Slate `#1E293B`, Deep Blue `#174A7F`, Slate `#64748B` | Yellow, White |

- **No UI Yellow (`#FEDE3B`) or ITB Blue (`#005AAB`):** Stick strictly to BINUS Deep Blue (`#174A7F`) and Dominant Sky Blue (`#23A3E7`).
- **No emoji:** Express meaning through clear typography, structured pill badges, or simple geometric icons.
- **No red/green traffic lights:** Use words: **High / Medium / Low**, **Strong / Moderate / Weak**, or **Optimal / Review / Action Needed**.

---

## 4. Spacing & Sizing System

Base unit **8 px**. Allowed values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px.

| Spacing Element | px | in (PPTX) |
|---|---|---|
| Slide safe padding (content slides) | top 84–96, sides 108, bottom 140 (logo band) | 0.6 / 0.75 / 0.97 |
| Title → lead subtitle | 12–16 | 0.08–0.11 |
| Title block → main visual | 24–40 | 0.17–0.28 |
| Gap between cards in a row | 16–24 | 0.11–0.17 |
| Gap between stacked rows | 12–16 | 0.08–0.11 |
| Card inner padding | 22–36 | 0.15–0.25 |
| Pill / badge padding | 6–10 vertical, 14–24 horizontal | — |
| Table cell padding | 12–22 | 0.08–0.15 |

**Vertical budget calculation:** A content slide provides ~836 px of usable height.
- Text block height ≈ `font-size × lines × line-height`.
- Card height = content + padding. Never clip or truncate text; allow cards to size gracefully.
- If content exceeds the safe boundary, split the slide into two logical parts rather than shrinking text below 24 px.

---

## 5. Backgrounds (8 Prepared Assets in `/bg-deck/binus-deck/`)

All 8 backgrounds are 1920 × 1080 px WebP/PNG assets placed as a full-bleed picture on the bottom layer. Never cover logos or bottom institutional bands.

| File Name | Intended Usage | Safe Content Area (px) |
|---|---|---|
| `cover-deck.webp` | Slide 1 only: Title, Subtitle, Cohort & Facilitator metadata | x 125–1360, y 300–1000 |
| `tablecontent-deck.webp` | Agenda, Table of Contents, Module Roadmap (Slide 2) | x 108–1812, y 84–920 |
| `learningoutcome-deck.webp` | Learning Objectives, Competency Milestones (Slide 3) | x 108–1812, y 84–920 |
| `speaker-deck.webp` | Facilitator / Speaker bio, Mentor background, Guest Intro | x 108–1812, y 84–920 (Left profile, Right content) |
| `part-deck.webp` | Section Dividers ("PART N", "MODUL N"), Agenda shifts | x 110–1812, y 88–880 (Centered) |
| `content-deck.webp` | Standard Content: Wide white canvas for diagrams & frameworks | x 108–1812, y 84–920 |
| `recap-deck.webp` | Modular Synthesis, Key Takeaways, Action Checklist | x 108–1812, y 84–920 |
| `closing-deck.webp` | Last Slide: Next Session, Action Items, Q&A, Contact Info | x 110–1540, y 88–880 |

### Fixed structures per background role:

1. **Cover (`cover-deck.webp`):**
   - Title: Deep Blue `#174A7F` (104 px, Bold)
   - Subtitle: Medium Blue `#018ED5` (46 px, Semibold)
   - Meta lines (Module · Date · Facilitator): Slate `#64748B` (30 px, Light italic)
2. **Table of Contents (`tablecontent-deck.webp`):**
   - Clean numbered agenda blocks or interconnected timeline cards.
3. **Learning Outcomes (`learningoutcome-deck.webp`):**
   - 3–4 competency cards in Soft Sky Tint (`#EAF5FC`) with Deep Blue headers and Golden Yellow check badges.
4. **Speaker Profile (`speaker-deck.webp`):**
   - Left side: Avatar/photo frame with Deep Blue name tag and credential badge.
   - Right side: Experience pillars, key achievements, and professional background.
5. **Section Divider (`part-deck.webp`):**
   - Accent bar (Golden Yellow `#FFDE3D`, 140 × 12 px)
   - "PART N" or "MODUL N" uppercase pill label in Golden Yellow
   - Large white title (96–100 px, Bold)
   - Supporting subtitle in White or Soft Sky Blue
6. **Content (`content-deck.webp`):**
   - Clean, expansive white canvas providing maximum freedom for rich visual diagrams, tables, and frameworks.
7. **Recap (`recap-deck.webp`):**
   - Ruled summary cards, key takeaways, and action items.
8. **Closing (`closing-deck.webp`):**
   - Next session badge, Q&A prompt, contact info, and clear closing statement.

---

## 6. Elements & Component Specifications

| Element | Exact Specification |
|---|---|
| **Standard Card** | Fill: White `#FFFFFF` or Soft Sky Tint `#EAF5FC`. Border: 2 px `#B9D5E8`. Radius: 12–16 px. Inner padding: 22–36 px. No heavy drop-shadows. |
| **Primary Authority Card** | Solid Deep Blue `#174A7F` fill, White text, radius 12–16 px. Used for conclusions, key frameworks, and core mandates. |
| **Dominant Visual Card** | Solid Light Sky Blue `#23A3E7` fill, White text, radius 12–16 px. Used for active stages, focal categories, and dominant nodes. |
| **Accent / Highlight Card** | Solid Golden Yellow `#FFDE3D` fill, Deep Blue `#174A7F` text. Reserved for key statistics, pivotal insights, and summary callouts. |
| **Pill / Chip Badge** | Radius 999 px (fully rounded). 24 px bold text, height 40–48 px. Deep Blue fill with white text, or Golden Yellow fill with Deep Blue text. |
| **HANDS-ON Badge** | Golden Yellow `#FFDE3D` pill beside the slide title. Deep Blue `#174A7F` text, 26 px bold, letter-spacing 2 px. Subtitle underneath: "15 minutes, team breakout". |
| **Prompt Card** | White card with 2 px Deep Blue `#174A7F` border. Medium Blue label ("PROMPT / EXERCISE"), prompt text in quotes (24–30 px), placeholders as **[bold bracketed tokens]**. |
| **Note Box** | Soft Yellow `#FFEC8E` fill, radius 8–12 px, Dark Slate `#1E293B` text, bold Deep Blue lead-in ("Note:", "Rule:", "Guiding Principle:"). |
| **Insight Bar** | Solid Deep Blue `#174A7F` container with 14 px Golden Yellow `#FFDE3D` left accent bar. White text, bold yellow lead-in ("Key Insight:"). |
| **Pull-Quote** | Large 32–40 px italic text with a 12 px Light Sky Blue `#23A3E7` left accent bar. Author attribution in Medium Blue `#018ED5`. |
| **Stat / Metric Card** | White or Soft Sky Tint card with giant number (64–110 px, ExtraBold 800) in Deep Blue or Golden Yellow + concise label. |
| **Process Stepper** | Horizontal rail connecting rounded step cards (1 → 2 → 3 → 4). Step numbers inside Deep Blue or Sky Blue circular badges. |
| **Comparison Table** | Deep Blue `#174A7F` header row with white bold text; alternating rows Soft Sky Tint `#EAF5FC` and White `#FFFFFF`. Thin `#B9D5E8` row rules. No vertical gridlines. Text ≥ 24 px. |
| **Split Comparison** | Left panel (Baseline / Problem / Traditional): Light Grey `#F4F6F8` with subtle border. Right panel (Target / Strategic Fix / Modern): Deep Blue `#174A7F` or Light Sky Blue `#23A3E7` with white text. Central "VS" badge. |
| **Connectors & Arrows** | 4–6 px Deep Blue `#174A7F` or Medium Blue `#018ED5`. Solid = sequence/flow; dashed = relationship/reference. Clean triangular arrowheads. |
| **Row Rule** | 2–3 px `#B9D5E8` between list rows. |
| **Image Placeholder** | Dashed 2 px `#B9D5E8` box, Soft Sky Tint background, label "IMAGE · [DESCRIPTION]". |

---

## 7. Layout Selection & Canvas Creativity

The `content-deck.webp` background features an expansive white canvas. Never default to boring plain bullet lists. Select diagrams and visual arrangements that match the fundamental idea:

| Content Type | Recommended Visual Layout |
|---|---|
| **Process & Workflow** | Connected rail stepper, horizontal chevrons, milestone timeline |
| **Pillars & Architecture** | 3–4 vertical columns with Deep Blue headers, Light Sky Blue feature cards |
| **Comparison & Trade-offs** | Split case cards (Current vs Proposed), feature comparison matrix table |
| **Maturity & Growth** | Ascending columns/steps, maturity tier staircase |
| **Hub & Interconnection** | Central core idea with radiating satellite feature cards |
| **Decision & Logic Flow** | Decision tree branching cards with clear Yes/No connector labels |
| **Metrics & KPI Impact** | Large metric cards with giant numerals, trend delta badges, and contextual captions |
| **Frameworks with Layers** | Stacked horizontal cards, hierarchical pyramid layers |
| **Summary & Synthesis** | Checklist grid with bold checkmarks, numbered takeaway cards |

### Visual Rhythm Rules:
1. **Never use the same visual layout more than twice in a row.**
2. Balance dense analytical slides (tables, matrices) with spacious conceptual slides (hero stat, 3-pillar framework, stepper).
3. Keep the slide title and category badge anchored consistently in the top safe zone on every content slide.

---

## 8. Slide Construction Protocol (Build Order)

1. **Background Asset:** Place full-bleed background picture from `/bg-deck/binus-deck/` as layer 0.
2. **Slide Header:** Title (72 px Bold Deep Blue `#174A7F`, left-aligned) + optional lead/subtitle (30 px Medium Blue or Slate).
3. **Core Visual Structure:** Construct primary diagram, cards, or table using the 8 px spacing grid.
4. **Strategic Highlights:** Add single supporting element if needed (Insight bar, Note box, or Metric callout).
5. **Speaker Notes:** Include 2–4 concise sentences in the notes pane with strategic context and facilitator guidance.

### Content handling:
- Keep the outline's wording, order, and slide count.
- "Visual:" lines describe what to draw; never print them on the slide.
- Bracket labels in titles (`[HANDS-ON]`, `[SECTION DIVIDER]`) are instructions; apply them, don't print them.
- Facilitator notes go into speaker notes pane.
- Replace emoji with words (OK, Risk, Review, Critical).
- Unknown facts → visible placeholders: `[Name]`, `[Date]`, `[__]%`, `[X]-minute`. List them for the user.

---

## 9. Exporting to PPTX (PowerPoint, Keynote & Google Slides)

### 9.1 File setup
- Slide size **13.333 × 7.5 in** (pptxgenjs: `LAYOUT_WIDE`; python-pptx: `Inches(13.333) × Inches(7.5)`). Set it **before** adding slides.
- One slide per source slide, in order. Name each shape meaningfully (e.g., `title`, `card_1`, `insight_bar`).
- Put speaker notes in the **notes pane** (`slide.addNotes()` / `notes_slide.notes_text_frame`).

### 9.2 Coordinates
- Convert every px value: **in = px ÷ 144**, **pt = px ÷ 2**, **EMU = px × 6,350**.
- Example: title at (108, 96) px, 72 px font → x 0.75 in, y 0.667 in, 36 pt.

### 9.3 Backgrounds
- Insert the background PNG/WebP as a full-slide picture (0, 0, 13.333 × 7.5 in) as the **first** object, or set it as the slide background image.
- Dedicated backgrounds are located in `/bg-deck/binus-deck/`.

### 9.4 Text boxes
- Every text element is a **native, editable text box** (never text baked into an image).
- Set internal margins to **0** when text must align with shapes (pptxgenjs `margin: 0`; python-pptx `margin_left = 0`).
- **Auto-fit off / "Do not autofit"** and word wrap on, so text never silently shrinks below 12 pt.
- Font: `Red Hat Display` with bold per §2.2.
- Line spacing 1.25–1.3 multiple; paragraph space-after 6–12 pt. Bullets: real bullets (`bullet: true`), never typed "•".
- Letter spacing for labels: `charSpacing: 1` pt.

### 9.5 Colors
- Hex without `#` in pptxgenjs (`"174A7F"`, `"23A3E7"`, `"FFDE3D"`). Never 8-digit hex. Transparency via the `transparency` property (0–100).
- No shadows, glows, bevels, or 3D effects.

### 9.6 Shapes
- Cards = **Rounded Rectangle**. Corner radius: pptxgenjs `rectRadius` in inches (12–16 px → 0.08–0.11 in); in raw OOXML the `adj` value = radius ÷ min(width, height) × 50,000.
- Pills = Rounded Rectangle with radius = height ÷ 2.
- Circles = Ellipse with equal width/height.
- Accent bars (yellow left edge, divider bar) = thin Rectangles, not borders.
- Borders: 2 px = 1 pt; dashed = `dash: "dash"`.
- Arrows/connectors = native lines or connectors with triangle end-arrowheads, 2–3 pt.

### 9.7 Tables, charts, icons, diagrams
- **Tables:** native PPTX tables (not images). Header fill `174A7F` with white bold text; alternate row fills `EAF5FC` / `FFFFFF`; no vertical borders; cell margins 0.08–0.15 in; text ≥ 12 pt.
- **Charts:** native PPTX charts (`addChart`) with direct data labels, palette colors, light gridlines or none; single series → no legend.
- **Icons:** PNG rendered at ≥ 256 px (or native shapes); never emoji.
- **Diagrams** (trees, loops, matrices): build from native shapes + connectors when possible so they stay editable.
- Group related shapes so they move together.

### 9.8 Google Slides import notes
- Import via **File → Import slides → upload .pptx → select all**.
- Expect: images stay images; native shapes and tables stay editable; spacing may shift a few px.
- After import, check: fonts render as Red Hat Display, nothing overlaps institutional logos, tables didn't overflow.

### 9.9 Validate before delivering
- Open the PPTX in PowerPoint or LibreOffice once, or run a validator, and render a thumbnail grid to spot overflow.
- Fix problems in the generator, not by hand-editing the packed XML.

---

## 10. Quality Assurance Checklist

- [ ] Background correctly selected from `/bg-deck/binus-deck/` (8 dedicated options available).
- [ ] Font is exclusively **Red Hat Display** (no secondary font).
- [ ] No text below 24 px (12 pt); word count ≤ ~170 words.
- [ ] Strictly BINUS palette: Deep Blue `#174A7F`, Medium Blue `#018ED5`, Dominant Sky Blue `#23A3E7`, Golden Yellow `#FFDE3D`.
- [ ] Zero UI Yellow (`#FEDE3B`) or ITB Blue (`#005AAB`) leaks.
- [ ] Golden Yellow used strictly as an accent, not large flood fills.
- [ ] High contrast maintained across all cards and text boxes.
- [ ] No layout repeated more than twice in succession.
- [ ] Wording from the user's outline preserved accurately.
- [ ] No mention of Gamma; generated exclusively for Launcher OS.
- [ ] PPTX export opens seamlessly in PowerPoint and Google Slides without repair dialogs.

---

## 11. Don'ts (summary)

- Don't recreate, redraw or decorate the backgrounds.
- Don't use a second font, extra colors, emoji, shadows or gradient-filled cards.
- Don't put pills/tags above slide titles.
- Don't make every slide a card grid or a table.
- Don't bake text into images.
- Don't put facilitator instructions on the slide (use notes pane).
- Don't invent statistics, dates, names or quotes to fill a visual.
- Don't shrink text to make it fit; split the slide instead.
- Don't use red/green indicators for status. Use words: High, Medium, Low, Critical, Optimal.
- Don't use UI Yellow (`#FEDE3B`) or ITB Blue (`#005AAB`).

---

## 12. Program Context & Background Mapping

BINUS × RevoU executive programs (Applied Cybersecurity & Professional Tracks) utilize 8 dedicated 16:9 backgrounds from `/bg-deck/binus-deck/`:
1. `cover-deck.webp`: Slide 1 only: Title (`#174A7F`), Subtitle (`#018ED5`), Cohort/Facilitator Meta (`#64748B`).
2. `tablecontent-deck.webp`: Agenda, Table of Contents, Module Roadmap (Slide 2).
3. `learningoutcome-deck.webp`: Learning Objectives, Competency Milestones (Slide 3).
4. `speaker-deck.webp`: Facilitator & Speaker profiles, mentor introductions, credentials.
5. `part-deck.webp`: Section dividers ("Part N", "Modul N"), agenda transitions.
6. `content-deck.webp`: Core frameworks, concept models, process flows, data architecture, case scenarios.
7. `recap-deck.webp`: Summary, key takeaways, security checklists, milestone reviews.
8. `closing-deck.webp`: Final slide only: Q&A, Next Session, Next Steps, Thank You, and contact info.
