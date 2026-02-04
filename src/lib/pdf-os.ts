import jsPDF from "jspdf";

const COLORS = {
  green: [16, 185, 129] as [number, number, number],
  darkBg: [30, 41, 59] as [number, number, number],
  border: [51, 65, 85] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [15, 23, 42] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMedium: [71, 85, 105] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
};

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_deslocamento: "Em Deslocamento",
  em_andamento: "Em Andamento",
  concluida: "Concluida",
  faturada: "Faturada",
  cancelada: "Cancelada",
};

function formatCurrencyPdf(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDatePdf(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function formatDateTimePdf(): string {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function drawSectionTitle(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...COLORS.green);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(title, margin + 4, y + 5.5);

  return y + 12;
}

function drawInfoRow(doc: jsPDF, label: string, value: string, x: number, y: number, maxWidth: number): number {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textLight);
  doc.text(label, x, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textDark);
  const lines = doc.splitTextToSize(value || "-", maxWidth);
  doc.text(lines, x, y + 4);

  return y + 4 + lines.length * 4;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 30) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function generateOSPdf(os: any, tenant: any): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // ========== HEADER ==========
  // Logo placeholder
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(margin, y, 30, 16, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LOGO", margin + 15, y + 9, { align: "center" });

  // Company info
  const companyX = margin + 36;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text(tenant?.nome || "Servicfy", companyX, y + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  let infoY = y + 11;
  if (tenant?.cnpj) {
    doc.text(`CNPJ: ${tenant.cnpj}`, companyX, infoY);
    infoY += 4;
  }
  const contactParts: string[] = [];
  if (tenant?.telefone) contactParts.push(tenant.telefone);
  if (tenant?.email) contactParts.push(tenant.email);
  if (contactParts.length > 0) {
    doc.text(contactParts.join("  |  "), companyX, infoY);
    infoY += 4;
  }
  if (tenant?.endereco) {
    doc.text(tenant.endereco, companyX, infoY);
  }

  y += 22;

  // Divider line
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ========== TITLE AND OS NUMBER ==========
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text("ORDEM DE SERVICO", margin, y);

  // OS number badge on right side
  const osNumero = os.numero || "OS-0000";
  doc.setFillColor(...COLORS.darkBg);
  const badgeWidth = doc.getTextWidth(osNumero) * 1.4 + 10;
  doc.roundedRect(pageWidth - margin - badgeWidth, y - 7, badgeWidth, 10, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(osNumero, pageWidth - margin - badgeWidth / 2, y - 1, { align: "center" });

  y += 5;

  // Status badge
  const statusText = statusLabels[os.status] || os.status || "Aberta";
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const statusBadgeW = doc.getTextWidth(statusText) + 10;

  if (os.status === "concluida" || os.status === "faturada") {
    doc.setFillColor(16, 185, 129);
  } else if (os.status === "cancelada") {
    doc.setFillColor(239, 68, 68);
  } else if (os.status === "em_andamento" || os.status === "em_deslocamento") {
    doc.setFillColor(245, 158, 11);
  } else {
    doc.setFillColor(59, 130, 246);
  }
  doc.roundedRect(margin, y, statusBadgeW, 7, 1.5, 1.5, "F");
  doc.setTextColor(...COLORS.white);
  doc.text(statusText, margin + statusBadgeW / 2, y + 5, { align: "center" });

  // Date on the right
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text(`Data: ${formatDatePdf(os.dataExecucao || os.createdAt)}`, pageWidth - margin, y + 5, { align: "right" });

  y += 14;

  // ========== CLIENT INFO ==========
  y = checkPageBreak(doc, y, 40);
  y = drawSectionTitle(doc, "DADOS DO CLIENTE", y, pageWidth);

  doc.setFillColor(...COLORS.lightGray);
  const clientBoxHeight = 32;
  doc.roundedRect(margin, y, contentWidth, clientBoxHeight, 2, 2, "F");
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, clientBoxHeight, 2, 2, "S");

  const cx = margin + 5;
  const colWidth = contentWidth / 2 - 8;
  let cy = y + 6;

  const cliente = os.cliente || {};

  // Left column
  drawInfoRow(doc, "Nome:", cliente.nome || os.clienteNome || "-", cx, cy, colWidth);
  cy += 10;
  drawInfoRow(doc, "CPF/CNPJ:", cliente.cpfCnpj || "-", cx, cy, colWidth);

  // Right column
  cy = y + 6;
  const cx2 = margin + contentWidth / 2 + 3;
  drawInfoRow(doc, "Telefone:", cliente.telefone || cliente.whatsapp || "-", cx2, cy, colWidth);
  cy += 10;
  drawInfoRow(doc, "Email:", cliente.email || "-", cx2, cy, colWidth);

  y += clientBoxHeight + 2;

  // Address row
  const enderecoParts: string[] = [];
  if (cliente.endereco) enderecoParts.push(cliente.endereco);
  if (cliente.numero) enderecoParts.push(`n ${cliente.numero}`);
  if (cliente.complemento) enderecoParts.push(cliente.complemento);
  if (cliente.bairro) enderecoParts.push(cliente.bairro);
  if (cliente.cidade) enderecoParts.push(cliente.cidade);
  if (cliente.estado) enderecoParts.push(cliente.estado);
  if (cliente.cep) enderecoParts.push(`CEP: ${cliente.cep}`);
  const enderecoFull = enderecoParts.join(", ") || "-";

  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "S");
  drawInfoRow(doc, "Endereco:", enderecoFull, cx, y + 4, contentWidth - 10);

  y += 18;

  // ========== SERVICE INFO ==========
  y = checkPageBreak(doc, y, 40);
  y = drawSectionTitle(doc, "DADOS DO SERVICO", y, pageWidth);

  doc.setFillColor(...COLORS.lightGray);
  const serviceBoxHeight = 32;
  doc.roundedRect(margin, y, contentWidth, serviceBoxHeight, 2, 2, "F");
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, serviceBoxHeight, 2, 2, "S");

  let sy = y + 6;
  drawInfoRow(doc, "Tipo de Servico:", os.servico?.nome || os.servicoNome || "-", cx, sy, colWidth);
  sy += 10;
  drawInfoRow(doc, "Data de Execucao:", formatDatePdf(os.dataExecucao), cx, sy, colWidth);

  sy = y + 6;
  drawInfoRow(doc, "Horario:", `${os.horaInicio || "--:--"} ate ${os.horaFim || "--:--"}`, cx2, sy, colWidth);
  sy += 10;
  drawInfoRow(doc, "Tecnico Responsavel:", os.tecnico?.nome || os.tecnicoNome || "-", cx2, sy, colWidth);

  y += serviceBoxHeight + 6;

  // ========== DESCRIPTION ==========
  y = checkPageBreak(doc, y, 40);
  y = drawSectionTitle(doc, "DESCRICAO DO SERVICO", y, pageWidth);

  const descricao = os.descricao || "Sem descricao.";
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textDark);
  const descLines = doc.splitTextToSize(descricao, contentWidth - 10);

  const descBoxHeight = Math.max(16, descLines.length * 4.5 + 8);
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, y, contentWidth, descBoxHeight, 2, 2, "F");
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, y, contentWidth, descBoxHeight, 2, 2, "S");
  doc.text(descLines, cx, y + 6);

  y += descBoxHeight + 4;

  // Technical observations (if present)
  if (os.obsTecnico) {
    y = checkPageBreak(doc, y, 30);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textLight);
    doc.text("Observacoes do Tecnico:", cx, y);
    y += 4;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textDark);
    const obsLines = doc.splitTextToSize(os.obsTecnico, contentWidth - 10);
    const obsBoxHeight = Math.max(12, obsLines.length * 4.5 + 6);
    doc.setFillColor(255, 251, 235); // light yellow
    doc.roundedRect(margin, y, contentWidth, obsBoxHeight, 2, 2, "F");
    doc.setDrawColor(217, 189, 97);
    doc.roundedRect(margin, y, contentWidth, obsBoxHeight, 2, 2, "S");
    doc.text(obsLines, cx, y + 5);
    y += obsBoxHeight + 4;
  }

  // ========== CONTRACT INFO (if linked) ==========
  if (os.contrato) {
    y = checkPageBreak(doc, y, 30);
    y = drawSectionTitle(doc, "INFORMACOES DO CONTRATO", y, pageWidth);

    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "S");

    drawInfoRow(doc, "Contrato:", os.contrato.descricao || "-", cx, y + 5, colWidth);
    drawInfoRow(doc, "Valor Mensal:", formatCurrencyPdf(os.contrato.valorMensal), cx2, y + 5, colWidth);

    y += 22;
  }

  // ========== VALUE SECTION ==========
  y = checkPageBreak(doc, y, 30);

  doc.setFillColor(...COLORS.darkBg);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.lightGray);
  doc.text("VALOR DO SERVICO", margin + 8, y + 9);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.green);
  doc.text(formatCurrencyPdf(os.valor), pageWidth - margin - 8, y + 13, { align: "right" });

  y += 28;

  // ========== SIGNATURE LINES ==========
  y = checkPageBreak(doc, y, 45);

  // Ensure signatures are near bottom but with enough space
  const signatureY = Math.max(y + 10, pageHeight - 65);

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);

  // Client signature
  const sigWidth = contentWidth / 2 - 10;
  const sigLeftX = margin;
  doc.line(sigLeftX, signatureY, sigLeftX + sigWidth, signatureY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text("Assinatura do Cliente", sigLeftX + sigWidth / 2, signatureY + 5, { align: "center" });

  // Tech signature
  const sigRightX = margin + contentWidth / 2 + 10;
  doc.line(sigRightX, signatureY, sigRightX + sigWidth, signatureY);
  doc.text("Assinatura do Tecnico", sigRightX + sigWidth / 2, signatureY + 5, { align: "center" });

  // ========== FOOTER ==========
  const footerY = pageHeight - 12;
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Documento gerado pelo Servicfy - www.servicfy.com.br", margin, footerY);
  doc.text(`Gerado em: ${formatDateTimePdf()}`, pageWidth - margin, footerY, { align: "right" });

  // Save the file
  const filename = `${os.numero || "OS"}_${formatDatePdf(os.dataExecucao || os.createdAt).replace(/\//g, "-")}.pdf`;
  doc.save(filename);
}
