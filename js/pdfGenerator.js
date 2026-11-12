/**
 * Generador de PDF 1.4 puro en JavaScript (sin dependencias externas).
 * Produce un comprobante oficial descargable con gráficos vectoriales
 * para el sello mágico del Reino Fae y la firma artística de Lumina del Claro.
 */

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Convierte texto Unicode a bytes WinAnsi (soporta tildes, ñ y raya — en PDF estándar).
 */
function encodeWinAnsiBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 0x2014) {
      // Em dash — en WinAnsi es 0x97
      bytes.push(0x97);
    } else if (code <= 0xff) {
      bytes.push(code);
    } else {
      bytes.push(0x3f); // '?'
    }
  }
  return bytes;
}

function stringToAsciiBytes(str) {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
}

/**
 * Construye los bytes binarios de un documento PDF 1.4 válido para el comprobante.
 * @param {{
 *   title: string,
 *   project: string,
 *   recipient: string,
 *   requestedCount: number,
 *   deliveredCount: number,
 *   status: string,
 *   issuedAtText: string,
 *   signatureName: string,
 *   sealText: string
 * }} receipt
 * @returns {Uint8Array}
 */
export function generateReceiptPdfBytes(receipt) {
  if (!receipt) {
    throw new Error("No se puede generar el PDF sin un comprobante válido.");
  }

  const lines = [
    // Fondo pergamino suave
    "0.96 0.92 0.85 rg",
    "0 0 595 842 re f",

    // Marco exterior dorado y marco interior verde bosque
    "0.83 0.63 0.30 RG 3 w",
    "36 36 523 770 re S",
    "0.12 0.24 0.18 RG 1.2 w",
    "46 46 503 750 re S",

    // Banda superior de encabezado
    "0.12 0.24 0.18 rg",
    "46 718 503 78 re f",

    // Título y subtítulo en dorado/crema
    "BT /F2 16 Tf 0.96 0.83 0.48 rg 70 762 Td (" + escapePdfText(receipt.title) + ") Tj ET",
    "BT /F1 11 Tf 0.96 0.92 0.85 rg 70 738 Td (" + escapePdfText(receipt.project + "  |  Pabellón 3: Mundos Inventados") + ") Tj ET",

    // Cuerpo del comprobante
    "BT /F2 13 Tf 0.14 0.10 0.07 rg 70 668 Td (ACTA DE ENTREGA INTERDIMENSIONAL) Tj ET",
    "0.83 0.63 0.30 RG 1 w 70 658 m 525 658 l S",

    "BT /F1 12 Tf 0.35 0.27 0.21 rg 70 622 Td (Destinataria:) Tj ET",
    "BT /F2 13 Tf 0.12 0.24 0.18 rg 260 622 Td (" + escapePdfText(receipt.recipient) + ") Tj ET",

    "BT /F1 12 Tf 0.35 0.27 0.21 rg 70 590 Td (Panchos con papitas solicitados:) Tj ET",
    "BT /F2 13 Tf 0.14 0.10 0.07 rg 260 590 Td (" + escapePdfText(String(receipt.requestedCount)) + ") Tj ET",

    "BT /F1 12 Tf 0.35 0.27 0.21 rg 70 558 Td (Panchos con papitas entregados:) Tj ET",
    "BT /F2 13 Tf 0.14 0.10 0.07 rg 260 558 Td (" + escapePdfText(String(receipt.deliveredCount)) + ") Tj ET",

    "BT /F1 12 Tf 0.35 0.27 0.21 rg 70 526 Td (Estado del pedido:) Tj ET",
    "BT /F2 13 Tf 0.12 0.35 0.24 rg 260 526 Td (" + escapePdfText(receipt.status) + ") Tj ET",

    "BT /F1 12 Tf 0.35 0.27 0.21 rg 70 494 Td (Fecha y hora de emisión:) Tj ET",
    "BT /F1 12 Tf 0.14 0.10 0.07 rg 260 494 Td (" + escapePdfText(receipt.issuedAtText) + ") Tj ET",

    // Caja de certificación
    "0.91 0.85 0.74 rg 70 400 455 62 re f",
    "0.83 0.63 0.30 RG 1 w 70 400 455 62 re S",
    "BT /F3 11 Tf 0.14 0.10 0.07 rg 88 436 Td (El Reino Fae certifica que el delivery interdimensional fue recibido) Tj ET",
    "BT /F3 11 Tf 0.14 0.10 0.07 rg 88 418 Td (con éxito y que las alitas de cotillón cumplieron el protocolo oficial.) Tj ET",

    // Sello mágico del Reino Fae (círculos y estrella vectorial en x=150, y=250)
    "0.12 0.35 0.24 RG 2.2 w",
    "150 302 m 179 302 202 279 202 250 c 202 221 179 198 150 198 c 121 198 98 221 98 250 c 98 279 121 302 150 302 c S",
    "0.83 0.63 0.30 RG 1.3 w",
    "150 294 m 174 294 194 274 194 250 c 194 226 174 206 150 206 c 126 206 106 226 106 250 c 106 274 126 294 150 294 c S",
    // Estrella feérica central
    "0.83 0.63 0.30 rg",
    "150 282 m 156 256 l 182 250 l 156 244 l 150 218 l 144 244 l 118 250 l 144 256 l f",
    "BT /F2 8 Tf 0.12 0.24 0.18 rg 95 182 Td (" + escapePdfText(receipt.sealText) + ") Tj ET",

    // Firma artística ficticia de Lumina del Claro (lado derecho)
    "0.12 0.24 0.18 RG 2 w",
    "315 246 m 335 282 350 225 372 262 c 388 286 405 232 426 256 c 442 272 458 242 482 254 c S",
    "0.83 0.63 0.30 RG 1.2 w",
    "325 232 m 468 238 l S",
    "0.14 0.10 0.07 RG 1 w 305 215 m 495 215 l S",
    "BT /F3 12 Tf 0.12 0.24 0.18 rg 345 198 Td (" + escapePdfText(receipt.signatureName) + ") Tj ET",
    "BT /F1 9 Tf 0.35 0.27 0.21 rg 338 184 Td (Firma Oficial · Destinataria Fae) Tj ET",

    // Pie de página
    "BT /F1 9 Tf 0.45 0.36 0.28 rg 70 72 Td (Documento mágico emitido por CHUNKERO — Hackathon 2026) Tj ET",
  ];

  const contentStreamStr = lines.join("\n") + "\n";
  const contentBytes = new Uint8Array(encodeWinAnsiBytes(contentStreamStr));

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n",
  ];

  const chunks = [];
  const header = "%PDF-1.4\n";
  chunks.push(stringToAsciiBytes(header));

  let offset = header.length;
  const offsets = [0];

  for (const objStr of objects) {
    offsets.push(offset);
    const bytes = stringToAsciiBytes(objStr);
    chunks.push(bytes);
    offset += bytes.length;
  }

  // Objeto 7: stream de contenido con bytes WinAnsi
  offsets.push(offset);
  const obj7Head = stringToAsciiBytes(`7 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  const obj7Tail = stringToAsciiBytes("\nendstream\nendobj\n");
  chunks.push(obj7Head, contentBytes, obj7Tail);
  offset += obj7Head.length + contentBytes.length + obj7Tail.length;

  const xrefOffset = offset;
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer =
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(stringToAsciiBytes(xref + trailer));

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const pdf = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    pdf.set(chunk, pos);
    pos += chunk.length;
  }
  return pdf;
}

/**
 * Genera y descarga el archivo PDF del comprobante oficial.
 */
export function downloadReceiptPdf(receipt) {
  const bytes = generateReceiptPdfBytes(receipt);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "comprobante-chunkero-reino-fae.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
