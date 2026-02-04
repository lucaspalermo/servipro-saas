import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = {
  green: [16, 185, 129] as [number, number, number],
  darkBg: [30, 41, 59] as [number, number, number],
  border: [51, 65, 85] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMedium: [71, 85, 105] as [number, number, number],
  textLight: [148, 163, 184] as [number, number, number],
};

interface ClienteRow {
  nome: string;
  tipoPessoa: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  cidade?: string;
  status: string;
}

interface ClienteReportData {
  clientes: ClienteRow[];
  totalAtivos: number;
  totalInativos: number;
  tenantNome?: string;
}

export function generateClientesPdf(data: ClienteReportData): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Header
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(margin, y, 30, 16, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LOGO", margin + 15, y + 9, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text(data.tenantNome || "Servicfy", margin + 36, y + 6);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text("Relatorio de Clientes", margin + 36, y + 12);
  y += 22;

  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text("Relatorio de Clientes", margin, y);
  y += 7;

  const now = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text(`Gerado em: ${now}`, margin, y);
  y += 10;

  // Summary
  const cardWidth = (contentWidth - 5) / 2;
  const cardHeight = 20;

  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textLight);
  doc.text("ATIVOS", margin + cardWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.green);
  doc.text(String(data.totalAtivos), margin + cardWidth / 2, y + 15, { align: "center" });

  const card2X = margin + cardWidth + 5;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("INATIVOS", card2X + cardWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(239, 68, 68);
  doc.text(String(data.totalInativos), card2X + cardWidth / 2, y + 15, { align: "center" });

  y += cardHeight + 10;

  // Table
  const headers = ["Nome", "Tipo", "Telefone", "WhatsApp", "Cidade", "Status"];
  const body = data.clientes.map((c) => [
    c.nome,
    c.tipoPessoa === "PF" ? "Pessoa Fisica" : "Pessoa Juridica",
    c.telefone || "-",
    c.whatsapp || "-",
    c.cidade || "-",
    c.status === "ativo" ? "Ativo" : "Inativo",
  ]);

  if (body.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [headers],
      body,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.textDark,
        lineColor: COLORS.border,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: COLORS.darkBg,
        textColor: COLORS.white,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
    });
  }

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Documento gerado pelo Servicfy - www.servicfy.com.br", margin, footerY);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  doc.save(`Relatorio_Clientes_${now.replace(/\//g, "-")}.pdf`);
}
