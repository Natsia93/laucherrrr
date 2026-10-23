---
name: itb-deck-design-rules
description: Visual design and content generation rules for ITB × RevoU slide decks. Use this skill whenever generating, rebuilding, restyling, or reviewing any deck, slide, module deck, mentoring deck, or slide outline for any ITB × RevoU program or partnership deck — even if the user only says "make the deck", "continue the next week", "generate slides from this outline" or "make it consistent". Covers single font (Red Hat Display), strict color palette (Deep Blue #005AAB + Golden Yellow #FFDD3C), the five supplied backgrounds, layout selection, components, content handling and speaker notes.
---

# ITB × RevoU Deck Design Rules

These rules keep every generated deck visually consistent, whatever the module or week. Follow them for every slide. When a rule and an outline conflict, keep the outline's wording and apply the rule to the visual form.

The guiding idea: **one visual identity, many layouts.** Fonts, colors, backgrounds and components never change. The layout of each slide is chosen from what that slide has to say.

---

## 1. Canvas

- 16:9, designed at **1920 × 1080 px**. All sizes below are in px at that canvas (1 pt ≈ 2 px).
- Minimum readable text size: **24 px**. Never go below it, including table cells, labels and captions.
- Keep about **170 words per slide at most**. If an outline slide is denser, split it or move detail to speaker notes.

---

## 2. Typography

One font family only: **Red Hat Display** (fallback: sans-serif). No second font.

| Role | Size | Weight | Color |
|---|---|---|---|
| Cover title | 104 px | 700 | Navy #174A7F |
| Cover subtitle | 46 px | 600 | Deep Blue #005AAB |
| Cover meta (week, program, facilitator) | 30 px | 300 italic | Grey #666666 |
| Divider title | 96–100 px | 700 | White |
| Slide title | 72 px | 700 | Deep Blue #005AAB |
| Lead / subtitle line under title | 30 px | 400 | #272525 |
| Meta line (timing, format, "8 minutes, individual") | 26 px | 400 | #595959 |
| Card / block heading | 28–36 px | 700–800 | #272525 or white on blue |
| Body text | 24–30 px | 400–600 | #272525 |
| Small label (UPPERCASE, letter-spacing 2px) | 24 px | 700 | #005AAB, or #595959 for neutral |
| Big numbers / stats | 56–300 px | 800 | #005AAB (or text color of its card) |

Rules:
- Titles are **left-aligned, one line where possible**. Shorten the title rather than wrap to three lines.
- Body line height 1.25–1.35. Never double-spaced.
- Bold only for lead-ins ("Note:", "Rule:", "Key insight:") and one key phrase per block.
- Italic for quotes, example answers and "how to spot it" style descriptions.

---

## 3. Color palette

Only these colors. Do not introduce new ones.

| Name | HEX | Use |
|---|---|---|
| Deep Blue | #005AAB | Titles, primary cards, table headers, key messages, icons |
| Golden Yellow | #FFDD3C | Partner cards, accents, tags, HANDS-ON tag, highlights |
| Blue gradient | #005AAB → #007AE8 | Full-bleed panels only (cover, divider, split panel) |
| Soft Yellow | #FFEC8E | Note boxes, highlighted cells, part tags |
| Pale yellow | #FFF6CC | Background band for a highlighted group of rows |
| Light blue | #EAF2FB | Table stripes, light rows, soft cards |
| Light grey | #F1F1F1 | Context boxes, "weak/before" panels, chat bubbles |
| Border blue-grey | #9FB8D6 / #D6E4F5 | Thin rules, dividers, mock-document borders |
| Neutral grey | #9A9A9A | Dashed "fragile / don't" outlines and icons only |
| Text | #272525 | All body text on light backgrounds |
| White | #FFFFFF | Text on blue; card fill |

### Color roles

- **Solid blue** = the conclusion, the rule, the "good" option, the key message. White text.
- **Solid yellow** = equal-weight partner to blue, or the call to action. Near-black text.
- **White or light blue** = longer text, worksheets, forms.
- **Light grey / dashed grey** = the "weak", "before", "fragile" or "don't" side of a comparison.
- **Alternate yellow and blue** for 2–5 parallel items, **starting with yellow**.
- A mix from yellow to blue (gradient steps) may show **increasing intensity** (risk, autonomy level, confidence).

### Contrast (non-negotiable)

- White text on blue: yes. Near-black on yellow: yes.
- **Never** white text on yellow. **Never** yellow text on white (fails contrast). Large numbers on white use blue or near-black, not yellow.
- No emoji and no status colors (no red/green). Status is written in words: **OK / Risk / Wrong**, **Pass / Partial / Fail**, **Low / Medium / High**.

---

## 4. Backgrounds (supplied assets — never recreate)

Five prepared background images are supplied. Use them as full-bleed backdrops. Never draw a new background, grid, wash, arc or photo; never add decorations on top.

| File | Use for | Safe zone for content |
|---|---|---|
| bg-cover.png (white arc, photo right, logos top-left) | Slide 1 only | x 125–1360, y 300–1000. Title top, meta at bottom-left |
| bg-content.png (light grid, blue photo band at bottom, logo tab bottom-left) | Most content slides | x 108–1812, y 84–920. Nothing below y 930 |
| bg-split.png (blue photo panel on the left 640 px) | Case studies, worked examples, "why" slides, recaps | Left panel x 64–584 (title in white, subtitle in yellow). Right x 720–1812 |
| bg-divider.png (full blue gradient, logo tab bottom-left, yellow line at bottom) | Section dividers ("Part N"), guest hand-over | x 110–1812, y 88–880, vertically centered |
| bg-closing.png (blue top to y 790, yellow line, white band with logos bottom-right) | Last slide: next session / next steps | Blue area x 110–1540 for pill, title, description. Optional one line in the white band x 110–1070, y ~830 |

The logos are part of the backgrounds. Do not add logos separately and never cover the logo tab.

### Fixed slide structures

- **Cover:** title (navy), subtitle (blue), 3 meta lines (week · program · facilitator/mentor). No cards.
- **Divider:** short yellow accent bar (140 × 12 px), "PART N" label in yellow caps, large white title, white subtitle. No cards.
- **Split:** yellow accent bar, white title (~62 px), yellow subtitle (~32 px) in the panel; content on the right.
- **Closing:** yellow pill label ("NEXT SESSION — WEEK X", "BEFORE MILESTONE"), large white title, white description; optional reminder line in the white band.

---

## 5. Layout philosophy

1. **Pick the layout from the content.** Ask: what is this slide's idea — a sequence, a comparison, a proportion, a hierarchy, a rise in intensity, a form to fill, a conversation? Draw that.
2. **No layout more than twice in a row.** Check the sequence after drafting the deck.
3. **Do not repeat the same card grid or table pattern across a deck.** Tables are for genuinely tabular data (3+ attributes per item) and worksheets.
4. **Do not copy reference slides literally.** References show the identity; layouts should be fresh.
5. **Visuals must carry meaning.** A bar's length, a column's height or a donut's slice should reflect a real quantity from the outline (minutes, seconds, levels). Never decorative shapes.

### Layout library (choose by content type)

| Content type | Layouts that work |
|---|---|
| Time split / agenda | Proportional bar, donut, Gantt chart, stacked bar with legend |
| Sequence / process | Road with milestone markers, stepping stones, chevrons, connected stepper, pill chain with arrows |
| Cycle / loop | Circular loop diagram, optionally wrapped by an outer ring |
| Rising intensity / levels | Rising columns, vertical dial with highlighted band, gradient slider with stops |
| Decision logic | Real Yes/No decision tree with connectors |
| Comparison (good vs weak) | Center "spine" with good left / weak right; solid blue vs grey panel with VS badge; robust lane vs dashed fragile lane |
| Before → after / problem → fix | Paired rows: grey "problem" → arrow → blue "fix" |
| Hierarchy / roles | Org chart with connectors, round-table seating, hub-and-spoke |
| People / personas | Persona cards with large initials |
| Framework with named parts | Stacked blocks forming one whole, pillars, header-band cards |
| Scenario / case | Mock artifact: email, chat bubble, data file with highlighted gaps, incoming message + sector chips |
| Worksheet / template | Paper form with blue header strip, ruled rows, checkbox pills |
| Checklist | Checkbox rows in two columns with a count badge; donut by task time + checkbox list |
| One big idea | Giant number or pull-quote beside supporting list; insight bar |
| Takeaways | Ruled numbered list, bookmark cards with footer, icon badge tiles — vary per deck |
| Reference lists (question banks, criteria) | Columns of quote bubbles under colored headers; numbered tiles with colored top edge |

Use split backgrounds for roughly 2–4 slides per deck (openings, case examples, recaps) so the deck has rhythm.

---

## 6. Components (exact specs)

Use these consistently; they are what make different layouts feel like one deck.

- **Rounded cards:** radius 16–22 px, padding 22–36 px, no shadows, no gradients on cards.
- **Header-band card:** white body, 3 px colored border, colored top band with the label.
- **Part / section tag:** Soft Yellow #FFEC8E pill, 24 px uppercase, above the title (e.g. "AFTER THE GUEST", "REFERENCE").
- **HANDS-ON tag:** solid Golden Yellow pill beside the title, 26 px bold, letter-spacing 2px, text "HANDS-ON". Every hands-on slide has it; the meta line underneath states time and format ("10 minutes, squad").
- **Prompt card (AI prompts, sentence templates):** white card, 3 px Deep Blue border, small blue uppercase label ("PROMPT", "TEMPLATE", "PASTE THIS PROMPT"), prompt text 24–30 px in quotes, blanks as **[bold bracketed placeholders]** in blue.
- **Note box:** Soft Yellow #FFEC8E, radius 16, bold lead-in ("Note:", "Rule:", "Remember:"). Max one per slide.
- **Insight bar:** Deep Blue background with a 14 px yellow left edge, white text, bold lead-in ("Key insight:", "The leadership shift:").
- **Pull-quote line:** text with a 12 px yellow left bar, no box.
- **Stat card:** solid yellow or blue, big number (64–110 px, weight 800) + short caption. Numbers must come from the outline (never invented).
- **Number circles / step markers:** circle in the opposite color of its card (blue circle on yellow card, yellow circle on blue card).
- **Icons:** simple line icons inside circles (e.g. Users, Lock, Chart, Wrench, Lightning, Warning, CheckCircle, Clock, Database, Settings). Icon color contrasts with its circle.
- **Pills / chips:** fully rounded, 24 px bold; used for tags, verdicts, milestone or module codes, durations.
- **Verdict pills:** OK = light blue with blue text; Risk = yellow; Wrong = solid blue with white text. Pass / Partial / Fail use the same logic (Fail = white with dark outline).
- **Tables:** Deep Blue header row with white semibold text; body rows alternate #EAF2FB and white; no gridlines; first column bold; cell padding ~12–22 px; 24–28 px text. Keep every row from the outline; for 6+ rows use 24 px, never drop rows.
- **Forms:** white card with 3 px blue border, blue header strip with an uppercase form title and "Participant: ____" fields on the right, ruled rows inside, checkbox pills for options.
- **Connectors:** 4–6 px Deep Blue lines, dashed (12–16 / 8–12) for relationships, solid for flow; small triangular arrowheads. No curved decorative swooshes.
- **Rules between list rows:** 2–3 px #D6E4F5.

---

## 7. Content handling (from outlines)

- **Keep the outline's wording, order and slide count.** Do not add filler text or extra bullets. Small additions (a guest hand-over divider, splitting a to-do list from the closing slide) are allowed only when they serve a template background — say so to the user.
- **"Visual:" lines** in an outline describe what to draw. Build the visual; never print the line.
- **Bracket labels** in titles ([HANDS-ON], [SECTION DIVIDER], [AFTER GUEST]) are instructions. Apply them; do not print the brackets.
- **Facilitator notes** ("Mentor note:", "Note for the facilitator:") go into speaker notes, never on the slide.
- **Ignore** "End of outline" lines.
- **Replace emoji** with words (OK, Risk, Wrong, Low, Medium, High).
- **Never invent facts, numbers, names or dates.** Use visible placeholders: [Name], [X]-minute, [date], [__]%, [channel name]. Mock artifacts (emails, data files) must be marked illustrative and use placeholder values where the outline gives none.
- **Program facts come from the program, not from this skill.** Take names, case companies, personas, schedules, checkpoint weeks, assessment rules and panel composition only from the outline, program brief or curriculum the user provides for that specific program. If a fact is needed and not provided, use a placeholder and ask the user; never carry facts over from another program or batch.

---

## 8. Speaker notes

Add notes **only** where the instructor needs context. Skip covers, dividers and self-explanatory takeaway slides.

A good note:
- explains the **intent** of the slide and the one point to land;
- gives **timing** for exercises and what to watch for while circulating;
- anticipates **common questions or confusions** and gives the answer;
- states **expected outcomes / correct answers** when the outline gives them;
- flags **setup** the facilitator must do beforehand (pick a scenario, prepare a file);
- uses placeholders for logistics not yet known.

A note must not repeat the slide text. Keep each to 2–6 sentences.

---

## 9. Quality checklist (run before delivering)

- [ ] Correct background on every slide; nothing in the footer band or over the logo tab
- [ ] Only Red Hat Display; titles blue, left-aligned, one line where possible
- [ ] No text under 24 px; ≤ ~170 words per slide
- [ ] Only palette colors; no emoji; no white-on-yellow or yellow-on-white text
- [ ] Parallel items alternate yellow → blue; the conclusion/key message is blue
- [ ] No layout used more than twice in a row; tables only where data is tabular
- [ ] Visual proportions match real quantities from the outline
- [ ] HANDS-ON tag + meta line on every hands-on slide; prompts in prompt cards
- [ ] Outline wording kept; "Visual:", brackets and facilitator notes handled as instructed
- [ ] No invented facts; placeholders visible and listed for the user
- [ ] Speaker notes on slides that need context, none that just repeat the slide

---

## 10. Don'ts (summary)

- Don't recreate or decorate the backgrounds.
- Don't use a second font, extra colors, emoji, shadows or gradient-filled cards.
- Don't make every slide a card grid or a table.
- Don't copy the reference slides' layouts one-to-one.
- Don't put facilitator instructions on the slide.
- Don't invent statistics, dates or names to fill a visual.
