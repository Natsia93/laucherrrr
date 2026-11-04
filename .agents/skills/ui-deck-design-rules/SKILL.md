---
name: ui-deck-design-rules
description: Visual design and content generation rules for Universitas Indonesia (UI) × RevoU slide decks. Use this skill whenever generating, rebuilding, restyling, or reviewing any deck, slide, module deck, mentoring deck, or slide outline for any UI × RevoU program or partnership deck — even if the user only says "make the deck", "continue the next week", "generate slides from this outline" or "make it consistent". Covers single font (Red Hat Display), strict color palette (UI Yellow #FEDE3B + Black #000000), the six supplied UI backgrounds (cover, content, task-speaker, part, recap, closing), layout selection, components, content handling and speaker notes.
---

# UI × RevoU Deck Design System
### A single source of truth for any AI (Claude, ChatGPT, Gemini, Copilot, Launcher OS, etc.) that creates, restyles, reviews or exports slide decks for Universitas Indonesia (UI) × RevoU executive programs.

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
    "ui_yellow": "#FEDE3B",
    "black": "#000000",
    "accent_brown": "#AC9629",
    "grey": "#4A4A4A",
    "off_white": "#FAFAF7",
    "light_grey": "#F2F2F2",
    "border_grey": "#E0E0E0",
    "mid_grey": "#BDBDBD",
    "white": "#FFFFFF",
    "soft_yellow": "rgba(254, 222, 59, 0.55)"
  },
  "spacing_scale_px": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  "radius_px": { "card": [16, 22], "pill": 999, "small": [8, 12] },
  "stroke_px": { "card_border": 3, "row_rule": [2, 3], "connector": [4, 6], "accent_bar": [12, 14] }
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
| Cover title | 104 | 52 | 700 Bold | Black #000000 | Title Case |
| Cover subtitle | 46 | 23 | 600 Semibold | Accent #AC9629 | Title Case |
| Cover meta (week · program · facilitator) | 30 | 15 | 300 Light, italic | Grey #4A4A4A | Sentence case, 3 lines |
| Divider title | 96–100 | 48–50 | 700 Bold | White #FFFFFF | Title Case |
| Divider label ("PART 2") | 26 | 13 | 800 ExtraBold | UI Yellow #FEDE3B | UPPERCASE, letter-spacing 2 px |
| Slide title | 72 | 36 | 700 Bold | Black #000000 | Title Case, left-aligned, 1 line preferred (max 2) |
| Lead / subtitle under title | 30 | 15 | 400 | Black #000000 or Grey #4A4A4A | Sentence case |
| Meta line (timing, format) | 26 | 13 | 400 | Grey #4A4A4A | "10 minutes, pairs" |
| Card / block heading | 28–36 | 14–18 | 700–800 | Black #000000, or White on Black | Title Case |
| Body text | 24–30 | 12–15 | 400–600 | Black #000000 or Grey #4A4A4A | Sentence case |
| Small label | 24 | 12 | 700–800 | Accent #AC9629 on white, UI Yellow on black | UPPERCASE, letter-spacing 2 px |
| Big numbers / stats | 56–300 | 28–150 | 800 ExtraBold | Black #000000 or UI Yellow #FEDE3B | Numerals only |

### 2.2 Weight mapping (important for PPTX / Google Slides)

PowerPoint and Google Slides only have **Bold on/off**. Map like this:

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
- **Bold:** only for lead-ins ("Note:", "Rule:", "Key insight:") and one key phrase per block.
- **Italic:** only for quotes, example answers, prompts and "how to spot it" descriptions.
- **Title length:** shorten the title rather than wrap to 3 lines.
- **Language (Strict Standard):**
  - Match the exact language requested by the user or used in the input topic.
  - If the user requests English (e.g., "in English", "bahasa Inggris", or writes the prompt/outline in English), ALL generated slide elements — titles, subtitles, card headers, body copy, badges, table headers, and speaker notes — MUST be written 100% in English.
  - Never translate or force an English deck into Indonesian.
  - Only retain Indonesian when the user explicitly requests Bahasa Indonesia or provides an Indonesian input outline.

---

## 3. Color

### 3.1 Palette (use only these)

| Colour | HEX | What it's for |
|---|---|---|
| **UI Yellow** | `#FEDE3B` | Partner cards, tags, HANDS-ON pill, highlights, number circles on black, accent bars |
| **Black** | `#000000` | Titles, key messages, primary cards, table headers, insight bars, connectors, flow lines |
| **Accent (yellowish brown)** | `#AC9629` | Small caps labels on white, cover subtitle, bold section badges on light surfaces |
| **Grey** | `#4A4A4A` | Meta lines (timing, format), neutral labels, captions |
| **Off-white** | `#FAFAF7` | Soft card fill, standard container cards |
| **Light grey** | `#F2F2F2` | Table stripes, "weak / before" panels, chat bubbles |
| **Border grey** | `#E0E0E0` | Thin rules between rows, card borders, mock-document borders |
| **Mid grey** | `#BDBDBD` | Dashed "fragile / don't" outlines and icons only |
| **White** | `#FFFFFF` | Card fill, text on black cards / headers |
| **Soft yellow** | `rgba(254, 222, 59, 0.55)` | Note boxes, section tags (ILLUSTRATIVE, PLACEHOLDER) |

### 3.2 Color roles

- **Solid Black = conclusion / rule / key message / recommended option** → White text on Black.
- **Solid UI Yellow = equal-weight partner, call to action, active tag** → Black text on Yellow (#000000).
- **Off-white or White = long text, worksheets, forms, standard reading cards.**
- **Light grey with dashed mid-grey outline = weak / before / fragile / don't side** of a comparison.
- **Parallel items (2–5 items): alternate UI Yellow → Black → UI Yellow…, always starting with UI Yellow.**
- **Increasing intensity (risk, autonomy, confidence):** step from UI Yellow toward Black.

### 3.3 Contrast rules (non-negotiable)

| Text on… | Allowed text color |
|---|---|
| Black #000000 | White #FFFFFF, UI Yellow #FEDE3B (labels / numbers only) |
| UI Yellow #FEDE3B | Black #000000. **Never white.** |
| White / Off-white / Light Grey | Black #000000, Grey #4A4A4A, Accent #AC9629 (labels only). **Never yellow text.** |

- **No emoji.**
- **No red or green status colors.** Write status as words instead: **Strong / Medium / Weak**, **Pass / Partial / Fail**, or **High / Medium / Low**.
- Don't use color alone to carry meaning; pair it with a word, label or icon.
- `#AC9629` is only for bold labels and large text on white, **never body text**.

---

## 4. Spacing & Sizing System

Base unit **8 px**. Allowed values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px.

| Spacing | px | in (PPTX) |
|---|---|---|
| Slide padding (content slides) | top 84–96, sides 108, bottom 140 (logo band) | 0.6 / 0.75 / 0.97 |
| Title → lead | 12–16 | 0.08–0.11 |
| Title block → main visual | 24–40 | 0.17–0.28 |
| Gap between cards in a row | 16–24 | 0.11–0.17 |
| Gap between stacked rows | 10–16 | 0.07–0.11 |
| Card inner padding | 22–36 | 0.15–0.25 |
| Pill padding | 6–10 vertical, 14–24 horizontal | — |
| Table cell padding | 12–22 | 0.08–0.15 |

**Vertical budget:** a content slide has ~836 px of usable height. Estimate before placing:
- Text block height ≈ font-size × lines × line-height.
- Table row ≈ 2.1 × font-size per text line.
- Card height = content + padding. **Never set a card shorter than its text; let it grow.**
- If it doesn't fit → split the slide. **Never shrink text below 24 px to make it fit.**

---

## 5. Backgrounds (supplied images — never redraw)

Six prepared 1920 × 1080 backgrounds in `/bg-deck/ui-deck/` (PNG and WebP). Place each as a **full-bleed picture at the very back** (first layer). Logos are part of the images; never add logos separately or cover the logo tab.

| File | Use for | Safe zone (px) |
|---|---|---|
| `cover-deck.webp` (`cover.webp`) | Slide 1 only | x 125–1360, y 300–1000. Title top, meta bottom-left |
| `content-deck.webp` (`content.webp`) | Most standard content slides | x 108–1812, y 84–920. Nothing below y 930 |
| `task-speaker-deck.webp` (`task-speakerdeck.webp`) | Case studies, worked examples, hands-on tasks, split panels, speaker profiles (2–4 per deck) | Left panel x 64–584 (white title, yellow subtitle). Right x 720–1812 |
| `part-deck.webp` | Section dividers ("Part N"), agenda utama, break, guest handover | x 110–1812, y 88–880, vertically centered |
| `recap-deck.webp` | Summary, key takeaways, and modular review slides (1–3 per deck) | x 108–1812, y 84–920. Structured recap cards or ruled list |
| `closing-deck.webp` | Last slide only: next session / next steps / thank you | Action area x 110–1540 |

### Fixed structures

- **Cover (`cover-deck.webp`):** title (Black #000000) → subtitle (Accent #AC9629) → 3 meta lines (week · program · facilitator) in Grey #4A4A4A. No cards.
- **Divider (`part-deck.webp`):** yellow accent bar 140 × 12 px → "PART N" UI Yellow caps label → large white title → white subtitle. No cards.
- **Task & Speaker (`task-speaker-deck.webp`):** yellow accent bar, white title (~62 px), yellow subtitle (~32 px) in the left panel; content / exercise on the right.
- **Recap (`recap-deck.webp`):** dedicated summary background for modular synthesis, key takeaways, and reflection checklists.
- **Closing (`closing-deck.webp`):** yellow pill label ("NEXT SESSION — WEEK X") → large white title → white description.

---

## 6. Elements (exact specs)

| Element | Spec |
|---|---|
| **Rounded card** | Radius 6–8 px (rounded-lg / rounded-md, halus & profesional, dilarang terlalu bulat), padding 22–36 px. Off-white #FAFAF7 or White #FFFFFF fill, thin border #E0E0E0. No shadows. No gradient fills. |
| **Primary card** | Solid Black #000000 fill, White text, radius 6–8 px (rounded-lg / rounded-md). Used for conclusions, key recommendations, final pillars. |
| **Partner card** | Solid UI Yellow #FEDE3B fill, Black #000000 text, radius 6–8 px (rounded-lg / rounded-md). Equal-weight counterpart to primary cards. |
| **Header-band card** | White body, 3 px colored border (Black or UI Yellow), colored top band holding the label/heading. |
| **Pill / chip** | Fully rounded (radius = height/2), 24 px bold text, height ~40–48 px. UI Yellow with black text, or Black with white text. |
| **HANDS-ON tag** | UI Yellow #FEDE3B pill **beside** the title, Black #000000 text, 26 px bold, letter-spacing 2 px, text "HANDS-ON". Meta line underneath: "10 minutes, squad" in Grey #4A4A4A. |
| **Section tag above title** | Optional (Soft Yellow pill, 24 px uppercase). **Default for this team: don't use pills above titles.** Keep titles clean. |
| **Prompt card** | White card, 3 px Black border, small Accent #AC9629 uppercase label ("PROMPT", "TEMPLATE"), prompt text 24–30 px in quotes, blanks as **[bold bracketed placeholders]** in black. |
| **Note box** | Soft Yellow (UI Yellow at 55% transparency), radius 6–8 px, black text, bold lead-in ("Note:", "Rule:"). Max one per slide. |
| **Insight bar** | Solid Black #000000 fill, 14 px UI Yellow #FEDE3B left edge, White text, bold UI Yellow lead-in ("Key insight:"). |
| **Pull-quote line** | Text with a 12 px UI Yellow left bar, no box. |
| **Stat card** | Solid UI Yellow or Black, big number 64–110 px weight 800 + short caption. Numbers only from the source. |
| **Number circle / step marker** | Circle 44–72 px, number 24–32 px bold, opposite color of its card (UI Yellow circle on Black, Black circle on UI Yellow). |
| **Icon** | Simple line icon 32–48 px inside a 56–76 px circle; icon color contrasts with the circle. No emoji. |
| **Verdict pills** | Strong = UI Yellow + black text · Medium = Off-white + black text & border #E0E0E0 · Weak = Light grey #F2F2F2 with dashed border #BDBDBD. |
| **Table** | Black #000000 header row, white semibold text; body rows alternate Light grey #F2F2F2 / White #FFFFFF; no vertical gridlines; first column bold; 24–28 px text; padding 12–22 px. Keep every row. 6+ rows → 24 px. Highlight one row with Soft Yellow if needed. |
| **Form / worksheet** | White card, 3 px Black border, Black header strip with uppercase form title + "Participant: ____" on the right, ruled rows (2–3 px #E0E0E0), dashed blank lines for writing, checkbox pills (☐ Ready / ☐ Ready with fixes). |
| **Chat / message mock** | Light grey (#F2F2F2) bubble for "them/before", Black or White-with-Black-border bubble for "us/after"; corner radius 4 px on the speaker side, 22 px elsewhere. Mark mock data as illustrative. |
| **Connector / arrow** | 4–6 px Black #000000; solid = flow, dashed (12–16 dash / 8–12 gap) = relationship; small triangular arrowheads. No curved decorative swooshes. |
| **Row rule** | 2–3 px #E0E0E0 between list rows. |
| **Image placeholder** | Dashed 3 px #BDBDBD box, light background #FAFAF7, label "IMAGE · FROM ORIGINAL SLIDE N" + description. |

---

## 7. Layout Selection (pick by meaning, not habit)

Ask first: *what is this slide's idea?* Then draw that idea.

| Content type | Layouts that work |
|---|---|
| Time split / agenda | Proportional bar (widths = real minutes), Gantt, stacked bar + legend |
| Sequence / process | Chevrons, connected stepper, road with milestones, stepping stones, pill chain with arrows |
| Cycle / loop | Circular loop diagram |
| Rising intensity / levels | Rising columns (height = level), stepped progression slider |
| Decision logic | Real Yes/No decision tree with connectors |
| Comparison (good vs weak) | Black panel vs light grey dashed panel with VS badge; solid lane vs dashed lane; center spine |
| Before → after / problem → fix | Paired rows: light grey "problem" → arrow → black "fix" |
| Hierarchy / roles | Org chart with connectors, hub-and-spoke, stacked layers |
| People / personas | Persona cards with large initials |
| Framework with named parts | Stacked blocks forming one whole, pillars, header-band cards |
| Scenario / case | Mock artifact: email, chat bubble, data table, document, file cards |
| Worksheet / template | Form with black header strip, ruled rows, checkbox pills |
| Checklist | Checkbox rows (1–2 columns) with a count badge |
| One big idea | Giant number or pull-quote + short support line; insight bar |
| Takeaways / Recap | Ruled numbered list, bookmark cards, icon tiles (ideal for `recap-deck.webp`) |
| Data | Native chart or bars whose lengths equal the real values; label values directly |

**Rhythm rules**
1. **No layout more than twice in a row.** Check the sequence after drafting.
2. Don't make every slide a card grid or a table. Tables only for genuinely tabular data (3+ attributes per item) or worksheets.
3. **Visuals must carry meaning:** bar length, column height or slice size must reflect a real quantity from the source. Never decorative shapes.
4. Title always in the same place (top-left of the safe area) on every content slide.
5. Use task/split backgrounds (`task-speaker-deck.webp`) 2–4 times per deck and recap backgrounds (`recap-deck.webp`) 1–2 times per deck for visual pacing and rhythm.

---

## 8. How to Create Each Slide (build order)

1. **Background picture** (full-bleed, back layer from `/bg-deck/ui-deck/`).
2. **Title** (72 px, Black #000000, top-left) → optional **lead line** (30 px) or **meta line** (26 px).
3. **Main visual** chosen from §7 (one idea per slide).
4. **Supporting element** (max one): insight bar, note box, or pull-quote.
5. **Speaker notes** (in the notes pane, never on the slide).

**Content handling**
- Keep the outline's wording, order and slide count.
- "Visual:" lines describe what to draw; never print them.
- Bracket labels in titles ([HANDS-ON], [SECTION DIVIDER]) are instructions; apply them, don't print them.
- Mentor/facilitator notes → speaker notes.
- Replace emoji with words (Strong / Medium / Weak, or Pass / Partial / Fail).
- Unknown facts → visible placeholders: [Name], [date], [__]%, [X]-minute. List them for the user.
- Program facts (names, cases, weeks, rubric) come only from the materials the user provides.

**Speaker notes:** 2–6 sentences, only where useful: intent, timing, what to watch for, expected answers, setup needed. Never repeat the slide text.

---

## 9. Exporting to PPTX (works in PowerPoint, Keynote and Google Slides import)

### 9.1 File setup
- Slide size **13.333 × 7.5 in** (pptxgenjs: `LAYOUT_WIDE`; python-pptx: `Inches(13.333) × Inches(7.5)`). Set it **before** adding slides.
- One slide per source slide, in order. Name each shape meaningfully (e.g., `title`, `card_1`, `insight_bar`).
- Put speaker notes in the **notes pane** (`slide.addNotes()` / `notes_slide.notes_text_frame`).

### 9.2 Coordinates
- Convert every px value: **in = px ÷ 144**, **pt = px ÷ 2**, **EMU = px × 6,350**.
- Example: title at (108, 96) px, 72 px font → x 0.75 in, y 0.667 in, 36 pt.

### 9.3 Backgrounds
- Insert the background image as a full-slide picture (0, 0, 13.333 × 7.5 in) as the **first** object, or set it as the slide background image.
- Gradients are images only. PPTX gradient shape fills often break across apps.

### 9.4 Text boxes
- Every text element is a **native, editable text box** (never text baked into an image).
- Set internal margins to **0** when text must align with shapes (pptxgenjs `margin: 0`; python-pptx `margin_left = 0`, etc.).
- **Auto-fit off / "Do not autofit"** and word wrap on, so text never silently shrinks below 12 pt.
- Font: `Red Hat Display` with bold per §2.2. Install the font before opening the file, or PowerPoint substitutes Arial; Google Slides has Red Hat Display built in.
- Line spacing 1.25–1.3 multiple; paragraph space-after 6–12 pt. Bullets: real bullets (`bullet: true`), never typed "•".
- Letter spacing for labels: `charSpacing: 1` (pt). (`letterSpacing` is ignored in pptxgenjs.)

### 9.5 Colors
- Hex without `#` in pptxgenjs (`"FEDE3B"`, `"000000"`). Never 8-digit hex. Transparency via the `transparency` property (0–100).
- No shadows, glows, bevels or 3D.

### 9.6 Shapes
- Cards = **Rounded Rectangle**. Corner radius: pptxgenjs `rectRadius` in inches (6–8 px → 0.04–0.06 in (subtle rounded-lg, bukan bubbly)); in raw OOXML the `adj` value = radius ÷ min(width, height) × 50,000 (cap 50,000).
- Pills = Rounded Rectangle with radius = height ÷ 2.
- Circles = Ellipse with equal width/height.
- Accent bars (yellow left edge, divider bar) = thin Rectangles, not borders.
- Borders: 3 px = **1.5 pt**, 2 px = 1 pt; dashed = `dash: "dash"`.
- Arrows/connectors = native lines or connectors with triangle end-arrowheads, 2–3 pt.

### 9.7 Tables, charts, icons, diagrams
- **Tables:** native PPTX tables (not images). Header fill 000000 with white bold text; alternate row fills F2F2F2 / FFFFFF; no vertical borders; cell margins 0.08–0.15 in; text ≥ 12 pt.
- **Charts:** native PPTX charts (`addChart`) with direct data labels, palette colors, light gridlines or none; single series → no legend. Only use an image if PowerPoint has no native form.
- **Icons:** PNG rendered at ≥ 256 px (or native shapes); never emoji.
- **Diagrams** (trees, loops, matrices): build from native shapes + connectors when possible so they stay editable. If drawn as SVG, convert to PNG at 2× size and say so.
- Group related shapes (e.g., a card + its text) so they move together.

### 9.8 Google Slides import notes
- Import via **File → Import slides → upload .pptx → select all**.
- Expect: images stay images; native shapes and tables stay editable; spacing may shift a few px; only simple transitions survive (fade, slide/push, dissolve).
- After import, check: fonts render as Red Hat Display, nothing overlaps the logo tab, tables didn't overflow.

### 9.9 Validate before delivering
- Open the PPTX in PowerPoint or LibreOffice once, or run a validator (e.g., `validate.py` from the PPTX skill), and render a thumbnail grid to spot overflow.
- Fix problems in the generator, not by hand-editing the packed XML.

---

## 10. QA Checklist (run on every deck)

- [ ] Correct background on every slide from `/bg-deck/ui-deck/` (cover, content, part, task-speaker, recap, closing); nothing over the logo tab or below y 930 px
- [ ] Only Red Hat Display; titles Black #000000, left-aligned, same position on every content slide
- [ ] No text under 24 px (12 pt); ≤ ~170 words per slide
- [ ] Only UI palette colors; no emoji; no white-on-yellow or yellow-on-white text
- [ ] Parallel items alternate UI Yellow → Black; the conclusion/key message is Black
- [ ] `#AC9629` used only for small caps labels / subtitles on white, never body text
- [ ] Status written as text words (Strong / Medium / Weak) without red/green colors or emoji
- [ ] HANDS-ON tag + meta line on every hands-on slide; prompts in prompt cards
- [ ] No layout used more than twice in a row; tables only where data is tabular
- [ ] Bars/columns/slices match real quantities from the source
- [ ] Outline wording kept; "Visual:" lines, bracket labels and mentor notes handled
- [ ] No invented facts; placeholders visible and listed for the user
- [ ] Speaker notes only where they add context; none that repeat the slide
- [ ] PPTX: 13.333 × 7.5 in, native editable text and tables, autofit off, notes in notes pane, file opens without repair prompts

---

## 11. Don'ts (summary)

- Don't recreate, redraw or decorate the backgrounds.
- Don't use a second font, extra colors, emoji, shadows or gradient-filled cards.
- Don't put pills/tags above slide titles (team preference).
- Don't make every slide a card grid or a table.
- Don't bake text into images.
- Don't put facilitator instructions on the slide.
- Don't invent statistics, dates, names or quotes to fill a visual.
- Don't shrink text to make it fit; split the slide instead.
- Don't use red/green indicators for status. Always use words: Strong, Medium, Weak.

---

## 12. Program Context & Background Mapping

Universitas Indonesia (UI) × RevoU executive programs have 6 distinct background roles:
1. `cover-deck.webp`: Title slide only (Week, Program, Facilitator).
2. `content-deck.webp`: Core framework, concepts, and data.
3. `part-deck.webp`: Structural agenda and part transitions.
4. `task-speaker-deck.webp`: Hands-on sprints, case studies, and speaker introductions.
5. `recap-deck.webp`: Synthesis of key learnings and milestone checklists.
6. `closing-deck.webp`: Action items, assignments, and contact channels.
