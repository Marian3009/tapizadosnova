import jsPDF from "jspdf";

export type CatalogoInfo = {
  coleccion: string;
  referencia: string;
  color: string;
  hex?: string;
  tipo?: string;
};

export type BudgetData = {
  cliente: { nombre: string; email: string; telefono?: string; direccion?: string };
  modalidad: "tapizado" | "funda";
  muebleLabel: string;
  telaLabel: string;
  tejidoNombre?: string;
  catalogo?: CatalogoInfo;
  metraje: number;
  unidades: number;
  base: number;
  iva: number;
  total: number;
  anticipo: number;
  iban: string;
  numero: string;
  fecha: string;
  composite?: string;
};

const NAVY: [number, number, number] = [42, 48, 60];
const GOLD: [number, number, number] = [198, 165, 100];
const CREAM: [number, number, number] = [248, 247, 244];

export function buildBudgetNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = String(Math.floor(Math.random() * 900) + 100);
  return `PRES-${ymd}-${rnd}`;
}

export function formatEUR(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function generateBudgetPdf(data: BudgetData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  let y = 0;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TAPIZADOS NOVA", 14, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Decoración Textil", 14, 19);
  doc.text("Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona)", 14, 26);
  doc.text("Tel: +34 611 491 661  ·  tapizadosnova@gmail.com", 14, 31);

  y = 46;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, W - 28, 14, 2, 2);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Nº Presupuesto: ${data.numero}`, 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de emisión: ${data.fecha}`, 18, y + 11);

  y += 22;
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...GOLD);
  doc.text("DATOS DEL CLIENTE", 14, y);
  doc.line(14, y + 1.5, 60, y + 1.5);
  y += 7;
  doc.setTextColor(...NAVY); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Nombre: ${data.cliente.nombre}`, 14, y); y += 5;
  doc.text(`Email: ${data.cliente.email}`, 14, y); y += 5;
  if (data.cliente.telefono) { doc.text(`Teléfono: ${data.cliente.telefono}`, 14, y); y += 5; }
  if (data.cliente.direccion) { doc.text(`Dirección: ${data.cliente.direccion}`, 14, y); y += 5; }

  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...GOLD);
  doc.text("DETALLE DEL TRABAJO", 14, y);
  doc.line(14, y + 1.5, 70, y + 1.5);
  y += 7;
  doc.setTextColor(...NAVY); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Modalidad: ${data.modalidad === "tapizado" ? "Tapizado" : "Funda ajustable"}`, 14, y); y += 5;
  doc.text(`Tipo de mueble: ${data.muebleLabel}`, 14, y); y += 5;
  doc.text(`Tipo de tela: ${data.telaLabel}`, 14, y); y += 5;
  if (data.catalogo) {
    doc.setFont("helvetica", "bold");
    doc.text("Tejido seleccionado del catálogo:", 14, y); y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`  · Colección: ${data.catalogo.coleccion}`, 14, y); y += 5;
    doc.text(`  · Referencia: ${data.catalogo.referencia}`, 14, y); y += 5;
    doc.text(`  · Color: ${data.catalogo.color}`, 14, y); y += 5;
    if (data.catalogo.hex) {
      const hex = data.catalogo.hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        doc.setFillColor(r, g, b);
        doc.setDrawColor(...GOLD);
        doc.roundedRect(14, y - 4, 14, 5, 0.6, 0.6, "FD");
        doc.text(`Muestra de color`, 32, y); y += 5;
      }
    }
  } else if (data.tejidoNombre) { doc.text(`Tejido seleccionado: ${data.tejidoNombre}`, 14, y); y += 5; }
  doc.text(`Metraje estimado de tejido: ${data.metraje.toFixed(2).replace(".", ",")} metros`, 14, y); y += 5;
  doc.text(`Número de unidades: ${data.unidades}`, 14, y); y += 5;

  y += 3;
  doc.setDrawColor(...GOLD); doc.line(14, y, W - 14, y); y += 8;

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...GOLD);
  doc.text("DESGLOSE DE PRECIOS", 14, y);
  y += 8;
  doc.setTextColor(...NAVY); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const right = (label: string, val: string, bold = false, size = 10) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(label, 14, y);
    doc.text(val, W - 14, y, { align: "right" });
  };
  right("Base sin IVA:", formatEUR(data.base)); y += 6;
  right("IVA (21%):", formatEUR(data.iva)); y += 8;
  doc.setFillColor(...CREAM);
  doc.rect(14, y - 5, W - 28, 11, "F");
  doc.setTextColor(...NAVY);
  right("TOTAL CON IVA:", formatEUR(data.total), true, 14);
  y += 12;

  y += 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...GOLD);
  doc.text("ANTICIPO Y FORMA DE PAGO", 14, y);
  doc.line(14, y + 1.5, 80, y + 1.5);
  y += 7;
  doc.setTextColor(...NAVY); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Anticipo requerido (50%): ${formatEUR(data.anticipo)}`, 14, y); y += 5;
  doc.text("Forma de pago: Transferencia bancaria", 14, y); y += 5;
  doc.text("Titular: Tapizados Nova", 14, y); y += 5;
  doc.text(`IBAN: ${data.iban}`, 14, y); y += 5;
  doc.text(`Concepto: ${data.numero} - ${data.cliente.nombre}`, 14, y); y += 5;

  y += 6;
  const boxX = 14, boxW = W - 28;
  const notas = [
    "PRESUPUESTO ORIENTATIVO - SUJETO A REVISION",
    "",
    "Este presupuesto es una estimación aproximada basada en los datos proporcionados. El precio final será confirmado tras la inspección presencial del mueble y la selección definitiva del tejido en taller.",
    "",
    "Presupuesto válido durante 30 días desde la fecha de emisión.",
    "",
    "Para confirmar el encargo se requiere el abono del 50% de anticipo mediante transferencia bancaria al número de cuenta indicado.",
  ];
  doc.setFontSize(9);
  const textBlock: string[] = [];
  notas.forEach((n) => {
    if (n === "") { textBlock.push(""); return; }
    const wrapped = doc.splitTextToSize(n, boxW - 8);
    textBlock.push(...wrapped);
  });
  const boxH = textBlock.length * 4.2 + 6;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.roundedRect(boxX, y, boxW, boxH, 2, 2);
  let ty = y + 5;
  textBlock.forEach((line, i) => {
    if (i === 0) { doc.setFont("helvetica", "bold"); doc.setTextColor(...GOLD); }
    else { doc.setFont("helvetica", "normal"); doc.setTextColor(...NAVY); }
    doc.text(line, boxX + 4, ty);
    ty += 4.2;
  });

  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "italic");
  // Second page: visualization
  if (data.composite) {
    try {
      doc.addPage();
      const PW = 210, PH = 297;
      // Top gold line
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(1.2);
      doc.line(14, 14, PW - 14, 14);

      doc.setTextColor(...GOLD);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("VISUALIZACIÓN DEL PROYECTO", PW / 2, 24, { align: "center" });
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Nº Presupuesto: ${data.numero}`, PW / 2, 31, { align: "center" });

      // Image area
      const props = doc.getImageProperties(data.composite);
      const maxW = PW - 40;
      const maxH = 130;
      const ratio = props.width / props.height;
      let iw = maxW, ih = maxW / ratio;
      if (ih > maxH) { ih = maxH; iw = maxH * ratio; }
      const ix = (PW - iw) / 2;
      const iy = 40;
      // Soft shadow
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(ix + 1.5, iy + 1.5, iw, ih, 1.5, 1.5, "F");
      doc.addImage(data.composite, "JPEG", ix, iy, iw, ih);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.8);
      doc.rect(ix, iy, iw, ih);

      // Datos
      let y2 = iy + ih + 12;
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.roundedRect(20, y2, PW - 40, 36, 2, 2);
      doc.setTextColor(...GOLD); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("DATOS DEL PROYECTO", 24, y2 + 7);
      doc.setTextColor(...NAVY); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`Cliente: ${data.cliente.nombre}`, 24, y2 + 15);
      doc.text(`Mueble: ${data.muebleLabel}`, 24, y2 + 22);
      doc.text(`Tejido: ${data.telaLabel}${data.tejidoNombre ? " - " + data.tejidoNombre : ""}`, 24, y2 + 29);
      doc.text(`Metraje estimado: ${data.metraje.toFixed(2).replace(".", ",")} metros`, PW - 24, y2 + 29, { align: "right" });

      // Aviso
      y2 += 44;
      const avisoLines = [
        "IMAGEN ORIENTATIVA",
        "Esta visualización ha sido generada combinando la fotografía del mueble facilitada por el cliente con una muestra del tejido seleccionado. El resultado final del tapizado en taller puede diferir de esta simulación en cuanto a tonalidad, textura y acabado.",
      ];
      doc.setFontSize(9);
      const wrapped: { text: string; bold: boolean }[] = [];
      avisoLines.forEach((l, idx) => {
        const lines = doc.splitTextToSize(l, PW - 50);
        lines.forEach((ln: string) => wrapped.push({ text: ln, bold: idx === 0 }));
      });
      const ah = wrapped.length * 4.5 + 8;
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.6);
      doc.roundedRect(20, y2, PW - 40, ah, 2, 2);
      let ay = y2 + 6;
      wrapped.forEach((w) => {
        doc.setFont("helvetica", w.bold ? "bold" : "normal");
        doc.setTextColor(...(w.bold ? GOLD : NAVY));
        doc.text(w.text, 24, ay);
        ay += 4.5;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...NAVY);
      doc.text("Tapizados Nova – Tapicería artesanal desde 1995 · Más de 30 años de experiencia", PW / 2, PH - 14, { align: "center" });
      doc.text("tapizadosnova@gmail.com  |  +34 611 491 661", PW / 2, PH - 9, { align: "center" });
    } catch {
      /* ignore image errors */
    }
  }

  return doc;
}
