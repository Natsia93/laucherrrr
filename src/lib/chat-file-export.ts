import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  AlignmentType,
  ShadingType,
} from "docx";
import * as XLSX from "xlsx";

export type FileType = "docx" | "xlsx" | "pdf" | "md";

export interface ChatGeneratedFile {
  id: string;
  title: string;
  filename: string;
  type: FileType;
  subtitle: string; // e.g. "Document · DOCX" or "Spreadsheet · XLSX"
  content: string; // Raw markdown / table data
}

/**
 * Clean and sanitize a string into a safe filename
 */
export function sanitizeFilename(str: string, ext: string): string {
  const clean = str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 50);
  return `${clean || "document"}.${ext}`;
}

/**
 * Extract clean title from markdown text
 */
export function extractTitleFromMarkdown(text: string, fallback = "Launcher OS Document"): string {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ")) {
      return trimmed.replace(/^#+\s*/, "").replace(/[^\w\s-—:()🇮🇩]/g, "").trim();
    }
    if (trimmed.startsWith("### 📖 Pre-Lecture Readings:")) {
      return trimmed.replace("### 📖 Pre-Lecture Readings:", "").trim();
    }
    if (trimmed.startsWith("### Slide 1") || trimmed.startsWith("### Slide")) {
      return "Slide Deck Master Outline";
    }
  }
  return fallback;
}

/**
 * Generate a Microsoft Word (.docx) Blob from Markdown content using docx library
 */
export async function generateDocxBlob(title: string, markdown: string): Promise<Blob> {
  const lines = markdown.split("\n");
  const children: (Paragraph | Table)[] = [];

  // Title paragraph
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 240 },
    })
  );

  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      const docxRows = tableRows.map((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        return new TableRow({
          tableHeader: isHeader,
          children: row.map(
            (cell) =>
              new TableCell({
                shading: isHeader
                  ? { type: ShadingType.CLEAR, fill: "F3F4F6" }
                  : undefined,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cell,
                        bold: isHeader,
                        size: 20, // 10pt
                      }),
                    ],
                  }),
                ],
              })
          ),
        });
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: docxRows,
        })
      );
      // Spacer after table
      children.push(new Paragraph({ spacing: { after: 120 } }));
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (trimmed.includes("---")) {
        // Separator line, ignore
        continue;
      }
      const cols = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cols);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ""),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 280, after: 140 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      // Bullet list item
      const bulletText = trimmed.replace(/^[-*]\s+/, "");
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseFormattedText(bulletText),
          spacing: { after: 60 },
        })
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      // Numbered list item
      const numText = trimmed.replace(/^\d+\.\s+/, "");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: trimmed.match(/^\d+\.\s+/)?.[0] || "", bold: true }),
            ...parseFormattedText(numText),
          ],
          spacing: { after: 60 },
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          children: parseFormattedText(trimmed),
          spacing: { after: 100 },
        })
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Helper to parse bold (**bold**) and basic formatting into docx TextRuns
 */
function parseFormattedText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22 }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, size: 22 }));
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: "Courier New",
          size: 20,
        })
      );
    } else if (part) {
      runs.push(new TextRun({ text: part, size: 22 }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 22 })];
}

/**
 * Generate a Microsoft Excel (.xlsx) Blob from Markdown tables using xlsx library
 */
export function generateXlsxBlob(title: string, markdown: string): Blob {
  const lines = markdown.split("\n");
  const wb = XLSX.utils.book_new();

  let tableIndex = 1;
  let currentTableRows: string[][] = [];
  let currentSheetName = "Data Table";

  const flushSheet = () => {
    if (currentTableRows.length > 0) {
      const ws = XLSX.utils.aoa_to_sheet(currentTableRows);
      // Auto column widths
      const colWidths = currentTableRows[0]?.map((_, colIdx) => {
        let maxLen = 10;
        for (const row of currentTableRows) {
          if (row[colIdx]) maxLen = Math.max(maxLen, String(row[colIdx]).length);
        }
        return { wch: Math.min(maxLen + 3, 50) };
      });
      if (colWidths) ws["!cols"] = colWidths;

      const sheetName = currentSheetName.slice(0, 31).replace(/[\\/?*[\]]/g, "");
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      currentTableRows = [];
      tableIndex++;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this line is a heading preceding a table
    if (trimmed.startsWith("#") && currentTableRows.length === 0) {
      currentSheetName = trimmed.replace(/^#+\s*/, "").slice(0, 25);
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (trimmed.includes("---")) continue;
      const cols = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      currentTableRows.push(cols);
    } else if (currentTableRows.length > 0) {
      flushSheet();
      currentSheetName = `Table ${tableIndex}`;
    }
  }

  if (currentTableRows.length > 0) {
    flushSheet();
  }

  // Fallback if no tables were found: convert text lines into key/value rows
  if (wb.SheetNames.length === 0) {
    const rows = lines
      .filter((l) => l.trim().length > 0)
      .map((l) => [l.trim()]);
    const ws = XLSX.utils.aoa_to_sheet([["Content"], ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  }

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Generate a Markdown (.md) Blob
 */
export function generateMdBlob(markdown: string): Blob {
  return new Blob([markdown], { type: "text/markdown;charset=utf-8" });
}

/**
 * Generate a PDF printable view / window
 */
export function printPdfDocument(title: string, markdown: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup diblokir browser. Izinkan popup untuk mencetak/menyimpan PDF.");
    return;
  }

  // Render markdown to basic HTML
  const htmlContent = markdown
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; margin-top: 18px; margin-bottom: 6px; font-weight: 600; color: #111;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 18px; margin-top: 22px; margin-bottom: 8px; font-weight: 700; color: #111; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 22px; margin-top: 24px; margin-bottom: 12px; font-weight: 800; color: #000;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li style="margin-bottom: 4px;">$1</li>')
    .replace(/\n\n/gim, '<p style="margin-bottom: 10px; line-height: 1.6;"></p>');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; padding: 24px; max-width: 800px; margin: 0 auto; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 24px; border-bottom: 2px solid #000; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #666; text-transform: uppercase;">Launcher OS · Exported Document</span>
            <h1 style="margin: 4px 0 0 0; font-size: 20px;">${title}</h1>
          </div>
          <span style="font-size: 10px; color: #888;">${new Date().toLocaleDateString("id-ID")}</span>
        </div>
        <div>${htmlContent}</div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Trigger download of any Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Intelligent detector: analyzes assistant message and extracts downloadable files (Claude-style)
 */
export function extractChatFiles(messageText: string, docType?: string): ChatGeneratedFile[] {
  if (!messageText || messageText.length < 120) return [];

  const files: ChatGeneratedFile[] = [];

  // 1. Check for explicit file blocks: <<<FILE:filename:title>>> ... <<<END_FILE>>>
  const fileRegex = /<<<FILE:([^:]+):([^>]+)>>>([\s\S]*?)<<<END_FILE>>>/g;
  let match;
  while ((match = fileRegex.exec(messageText)) !== null) {
    const filename = match[1].trim();
    const title = match[2].trim();
    const content = match[3].trim();
    const ext = filename.split(".").pop()?.toLowerCase() || "docx";

    let type: FileType = "docx";
    let subtitle = "Document · DOCX";

    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      type = "xlsx";
      subtitle = "Spreadsheet · XLSX";
    } else if (ext === "pdf") {
      type = "pdf";
      subtitle = "Document · PDF";
    } else if (ext === "md" || ext === "txt") {
      type = "md";
      subtitle = "Document · MD";
    }

    files.push({
      id: `file-${files.length}-${filename}`,
      title,
      filename,
      type,
      subtitle,
      content,
    });
  }

  if (files.length > 0) return files;

  // 2. Multi-section detector: Check if the text has multiple simulations or case studies
  // (e.g. "Simulation A", "Simulation B", "Case Study 1", "Module 1")
  const simulationRegex = /(?:^|\n)(#{2,3}\s*(?:Simulation|Case Study|CS\d|Module|Session)\s*[^:\n]+:?[\s\S]*?)(?=(?:\n#{2,3}\s*(?:Simulation|Case Study|CS\d|Module|Session))|$)/gi;
  const sections = Array.from(messageText.matchAll(simulationRegex));

  if (sections.length >= 2 && sections.length <= 6) {
    for (let i = 0; i < sections.length; i++) {
      const secText = sections[i][1].trim();
      const firstLine = secText.split("\n")[0].replace(/^#+\s*/, "").trim();
      const secTitle = firstLine.slice(0, 60);
      const filename = sanitizeFilename(secTitle, "docx");

      files.push({
        id: `sec-${i}-${filename}`,
        title: secTitle,
        filename,
        type: "docx",
        subtitle: "Document · DOCX",
        content: secText,
      });
    }
    return files;
  }

  // 3. Document determination:
  // Only generate a document file card IF this message is actually a requested/generated document,
  // NOT for casual conversations, Q&A, general chats, or quick advice.
  const isOutlineOrReading =
    docType === "CURRICULUM_DECK" ||
    docType === "PRE_LECTURE" ||
    docType === "STRATEGY" ||
    messageText.includes("### Slide") ||
    messageText.includes("Pre-Lecture");

  const hasFormalStructure =
    (messageText.startsWith("# ") || messageText.includes("\n# ")) &&
    (messageText.match(/\n##\s+/g)?.length || 0) >= 2 &&
    messageText.length > 500;

  const hasDocumentKeywords =
    /(?:dokumen|proposal|laporan|spesifikasi|sop|peraturan|kebijakan|kurikulum|silabus|prd|executive summary|ringkasan eksekutif|panduan|overview|kontrak|perjanjian|template)\b/i.test(
      messageText.slice(0, 400)
    );

  const hasTables =
    messageText.includes("|---") ||
    ((messageText.match(/\|/g)?.length || 0) > 12 && messageText.includes("\n|"));

  // Check if this is truly a document that the user requested or generated
  const isGenuineDocument =
    isOutlineOrReading ||
    (hasFormalStructure && hasDocumentKeywords) ||
    (hasTables && messageText.length > 300);

  // If this is just a regular chat / Q&A response, DO NOT create a document card
  if (!isGenuineDocument) {
    return [];
  }

  const mainTitle = extractTitleFromMarkdown(messageText);

  // Primary DOCX Document
  const docxFilename = sanitizeFilename(mainTitle, "docx");
  files.push({
    id: `main-${docxFilename}`,
    title: mainTitle,
    filename: docxFilename,
    type: "docx",
    subtitle: "Document · DOCX",
    content: messageText,
  });

  // If table exists, add Excel Spreadsheet (.xlsx)
  if (hasTables) {
    const xlsxFilename = sanitizeFilename(`${mainTitle}_data`, "xlsx");
    files.push({
      id: `table-${xlsxFilename}`,
      title: `${mainTitle} — Data Table`,
      filename: xlsxFilename,
      type: "xlsx",
      subtitle: "Spreadsheet · XLSX",
      content: messageText,
    });
  }

  // If outline, reading, or markdown design rules, also add .md
  if (isOutlineOrReading || messageText.includes("```markdown") || messageText.includes("## 1.")) {
    const mdFilename = sanitizeFilename(mainTitle, "md");
    files.push({
      id: `md-${mdFilename}`,
      title: mainTitle,
      filename: mdFilename,
      type: "md",
      subtitle: "Document · MD",
      content: messageText,
    });
  }

  return files;
}

/**
 * Download a specific chat file
 */
export async function downloadChatFile(file: ChatGeneratedFile): Promise<void> {
  if (file.type === "docx") {
    const blob = await generateDocxBlob(file.title, file.content);
    triggerBlobDownload(blob, file.filename);
  } else if (file.type === "xlsx") {
    const blob = generateXlsxBlob(file.title, file.content);
    triggerBlobDownload(blob, file.filename);
  } else if (file.type === "pdf") {
    printPdfDocument(file.title, file.content);
  } else if (file.type === "md") {
    const blob = generateMdBlob(file.content);
    triggerBlobDownload(blob, file.filename);
  }
}

/**
 * Download all chat files in sequence
 */
export async function downloadAllChatFiles(files: ChatGeneratedFile[]): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    await downloadChatFile(f);
    // Small delay between downloads so the browser doesn't block multi-download
    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
}
