import type jsPDF from 'jspdf';

/**
 * Draws a branded PDF header:
 *  - Dark navy background bar
 *  - Company logo (tape.png) top-left (more to the top)
 *  - Report title CENTERED in the header
 *  - Subtitle (e.g. Period) centered below the title
 *  - Exported time info in the bottom right of the header bar
 *
 * Returns the Y position after the header so the caller knows where to start content.
 */
export async function addPdfHeader(
  doc: jsPDF,
  reportTitle: string,
  subtitle?: string
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerH = 45; // Increased height for better spacing

  // ── Header background — dark navy ───────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900 / navy
  doc.rect(0, 0, pageWidth, headerH, 'F');

  // ── Try to load logo ────────────────────────────────────────────────────
  let logoDataUrl: string | null = null;
  try {
    const response = await fetch('/tape.png');
    if (response.ok) {
      const blob = await response.blob();
      logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // Logo not available
  }

  // ── Logo — top-left (moved more to the top) ───────────────────────────
  const logoW = 30;
  const logoH = 10;
  const logoX = 10;
  const logoY = 6; // Moved up from center

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
    } catch {
      doc.setTextColor(147, 197, 253);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TAPE', logoX, logoY + 7);
    }
  } else {
    doc.setTextColor(147, 197, 253);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TAPE', logoX, logoY + 7);
  }

  // ── Report title — horizontally centered in header ─────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleW = doc.getTextWidth(reportTitle);
  const titleY = 25;
  doc.text(reportTitle, (pageWidth - titleW) / 2, titleY);

  // ── Parse subtitle for Period and Exported Time ────────────────────────
  let periodText = '';
  let exportedTimeText = '';

  if (subtitle) {
    if (subtitle.includes('|')) {
      const parts = subtitle.split('|');
      periodText = parts[0].trim();
      exportedTimeText = parts[1].trim();
    } else if (subtitle.startsWith('Exported:')) {
      exportedTimeText = subtitle;
    } else {
      periodText = subtitle;
    }
  }

  // ── Period Text — centered below title ──────────────────────────────────
  if (periodText) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200); // light gray
    const pW = doc.getTextWidth(periodText);
    doc.text(periodText, (pageWidth - pW) / 2, titleY + 10);
  }

  // ── Exported Time — bottom right of header bar ──────────────────────────
  if (exportedTimeText) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160); // medium gray
    const eW = doc.getTextWidth(exportedTimeText);
    doc.text(exportedTimeText, pageWidth - eW - 10, headerH - 5);
  }

  // ── Return Y position for content (with extra breathing room) ──────────
  return headerH + 20;
}
