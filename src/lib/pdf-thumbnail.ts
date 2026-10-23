/**
 * Client-side utility to render the first page of a PDF file to a JPEG data URL.
 * Uses Mozilla's PDF.js via dynamic script loading so no large npm bundle is required.
 */
export async function renderPdfFirstPage(file: File): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    // Check if pdfjsLib is already loaded
    if (!(window as any).pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        // Prevent duplicate script tags
        const existingScript = document.getElementById("pdfjs-cdn-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () => reject(new Error("pdf.js load error")));
          return;
        }

        const script = document.createElement("script");
        script.id = "pdfjs-cdn-script";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          try {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          } catch {
            // Ignore worker configuration error if worker is disabled
          }
          resolve();
        };
        script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
        document.head.appendChild(script);
      });
    }

    const pdfjs = (window as any).pdfjsLib;
    if (!pdfjs) return null;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Scale to a neat thumbnail dimension (~300px wide for high-DPI displays)
    const initialViewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(300 / initialViewport.width, 2.0);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.warn("[PDF Thumbnail] Failed to render first page:", err);
    return null;
  }
}
