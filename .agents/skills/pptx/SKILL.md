---
name: pptx
description: "Comprehensive guide for PowerPoint (.pptx / .potx) generation, manipulation, and structured decks. Use whenever creating slide decks via pptxgenjs, editing existing OOXML decks, or extracting text. Includes pptxgenjs gotchas, XML manipulation rules, typography safety, visual QA protocols, and anti-patterns."
license: Proprietary
---

# PPTX Creation, Editing, and Technical Architecture

Use this skill whenever working with PowerPoint (`.pptx` or `.potx`) files as input or output.

## Core Technical Approaches

| Task | Approach |
|---|---|
| **Create** a new deck | Write a `pptxgenjs` script and build it as a structured deck with master themes and layouts. |
| **Edit** an existing deck or template | `unzip` → edit `ppt/slides/slideN.xml` directly → `zip`. |
| **Extract / Read** content | `markitdown deck.pptx` for structured slide-by-slide text. |

---

## Critical pptxgenjs Rules & Footguns (Anti-Corruption)

- **Always set `pres.layout` before adding slides:** Default is `LAYOUT_16x9` = 10" × 5.625".
- **Hex Colors:** NEVER use `#` and NEVER use 8-digit hex with alpha. Always write clean 6-digit hex (`"FF0000"`, not `"#FF0000"` or `"FF000020"`). Alpha values corrupt OOXML packages! Translucency must be set via `transparency: 0-100`.
- **Shadow Offset:** `offset` must be $\ge 0$. A negative offset corrupts the file. To cast upward, use `angle: 270` with positive offset.
- **Lists & Bullets:** Set `bullet: true` on each item. Never use literal `•` characters. Set `breakLine: true` on array items, and use `paraSpaceAfter` instead of `lineSpacing` to avoid massive blank spaces.
- **Accessibility Textbox:** Always set `isTextBox: true` on every `addText` call that does not use a placeholder. Without it, screen readers report the text as an unreadable graphic object.
- **Text Box Margins:** Text boxes have built-in internal padding; set `margin: 0` when aligning with shapes or icons.
- **Speaker Notes:** Always use `slide.addNotes("...")` (plain text) so notes appear properly in Presenter View.
- **Native Charts:**
  - On stacked charts, `dataLabelPosition` must be `ctr`, `inEnd`, or `inBase` (`outEnd` corrupts the file).
  - Combo charts with secondary axes must declare both `valAxes` and `catAxes` with 2 entries each.
- **XML Sanitization:** Strings passed to `pres.company`, layout titles, and master names must have `&` escaped as `&amp;` to prevent XML parsing failures.

---

## Typography & Visual Safety Rules

- **Safe Fonts:** Arial, Calibri, Cambria, Times New Roman, Courier New, Bookman Old Style, Century Schoolbook.
- **Institutional Single-Font Projects:** When using **Red Hat Display**, ensure font weight mappings match available styles (Regular, Medium, SemiBold, Bold).
- **Dominance Over Equality:** 60–70% visual weight for primary background, 20–30% for structure cards, 10% for focal accents.
- **Banned AI Hallmarks:**
  - ❌ NEVER use thin accent lines under titles.
  - ❌ NEVER add decorative edge stripes or colored border bars on slides.
  - ❌ NEVER center body text (left-align all narrative and bullet lists).
  - ❌ NEVER use default cream/beige backgrounds unless explicitly requested by brand guidelines.
