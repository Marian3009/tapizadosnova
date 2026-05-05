import jsPDF from "jspdf";

export type BudgetData = {
  cliente: { nombre: string; email: string; telefono?: string; direccion?: string };
  modalidad: "tapizado" | "funda";
  muebleLabel: string;
  telaLabel: string;
  tejidoNombre?: string;
  metraje: number;
  unidades: number;
  base: number;
  iva: number;
  total: number;
  anticipo: number;
  iban: string;
  numero: string;
  fecha: string;
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
  if (data.tejidoNombre) { doc.text(`Tejido seleccionado: ${data.tejidoNombre}`, 14, y); y += 5; }
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
  doc.text("Tapizados Nova – Tapicería artesanal en Rubí, Barcelona desde 2003", W / 2, 290, { align: "center" });

  return doc;
}
