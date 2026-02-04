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
  red: [239, 68, 68] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
};

function formatCurrencyPdf(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
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

function formatDatePdf(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

interface FinanceiroEntry {
  id?: string;
  tipo: string;
  categoria?: string;
  descricao?: string;
  valor: number;
  dataVencimento?: string | Date;
  dataPagamento?: string | Date;
  status?: string;
  formaPagamento?: string;
  cliente?: { nome: string } | null;
  tecnico?: { nome: string } | null;
}

interface RelatorioData {
  entries: FinanceiroEntry[];
  receitas: number;
  despesas: number;
  lucro: number;
  tenantNome?: string;
}

const tipoLabels: Record<string, string> = {
  financeiro: "Financeiro",
  receitas: "Receitas",
  despesas: "Despesas",
  geral: "Geral",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

export function generateRelatorioPdf(
  data: RelatorioData,
  tipo: string,
  periodo: string
): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.green);
  doc.roundedRect(margin, y, 30, 16, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LOGO", margin + 15, y + 9, { align: "center" });

  const companyX = margin + 36;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text(data.tenantNome || "ServiPro", companyX, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text("Relatorio Financeiro", companyX, y + 12);

  y += 22;

  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ========== TITLE ==========
  const tipoLabel = tipoLabels[tipo] || tipo || "Financeiro";
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Relatorio de ${tipoLabel}`, margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMedium);
  doc.text(`Periodo: ${periodo}`, margin, y);
  y += 10;

  // ========== SUMMARY CARDS ==========
  const cardWidth = (contentWidth - 10) / 3;
  const cardHeight = 22;

  // Receitas card
  doc.setFillColor(236, 253, 245); // green-50
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(167, 243, 208); // green-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "S");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textLight);
  doc.text("RECEITAS", margin + cardWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.green);
  doc.text(formatCurrencyPdf(data.receitas), margin + cardWidth / 2, y + 16, { align: "center" });

  // Despesas card
  const card2X = margin + cardWidth + 5;
  doc.setFillColor(254, 242, 242); // red-50
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "S");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textLight);
  doc.text("DESPESAS", card2X + cardWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.red);
  doc.text(formatCurrencyPdf(data.despesas), card2X + cardWidth / 2, y + 16, { align: "center" });

  // Lucro card
  const card3X = margin + (cardWidth + 5) * 2;
  const lucroPositive = data.lucro >= 0;
  doc.setFillColor(lucroPositive ? 236 : 254, lucroPositive ? 253 : 242, lucroPositive ? 245 : 242);
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(lucroPositive ? 167 : 254, lucroPositive ? 243 : 202, lucroPositive ? 208 : 202);
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, "S");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.textLight);
  doc.text("LUCRO", card3X + cardWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const lucroColor = lucroPositive ? COLORS.green : COLORS.red;
  doc.setTextColor(lucroColor[0], lucroColor[1], lucroColor[2]);
  doc.text(formatCurrencyPdf(data.lucro), card3X + cardWidth / 2, y + 16, { align: "center" });

  y += cardHeight + 10;

  // ========== TABLE ==========
  doc.setFillColor(...COLORS.green);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LANCAMENTOS", margin + 4, y + 5.5);
  y += 12;

  const tableHeaders = [
    "Tipo",
    "Descricao",
    "Categoria",
    "Valor",
    "Vencimento",
    "Status",
  ];

  const tableBody = (data.entries || []).map((entry) => {
    return [
      entry.tipo === "receita" ? "Receita" : "Despesa",
      entry.descricao || "-",
      entry.categoria || "-",
      formatCurrencyPdf(entry.valor),
      formatDatePdf(entry.dataVencimento),
      statusLabels[entry.status || ""] || entry.status || "-",
    ];
  });

  if (tableBody.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableBody,
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
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 28 },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 25 },
        5: { cellWidth: 22 },
      },
      didParseCell: (hookData) => {
        // Color the "Valor" column based on type
        if (hookData.section === "body" && hookData.column.index === 3) {
          const tipoCell = hookData.row.cells[0];
          if (tipoCell && tipoCell.text[0] === "Receita") {
            hookData.cell.styles.textColor = COLORS.green;
            hookData.cell.styles.fontStyle = "bold";
          } else {
            hookData.cell.styles.textColor = COLORS.red;
            hookData.cell.styles.fontStyle = "bold";
          }
        }
      },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMedium);
    doc.text("Nenhum lancamento encontrado no periodo.", margin, y + 6);
  }

  // ========== FOOTER ==========
  const footerY = pageHeight - 12;
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Documento gerado pelo ServiPro - www.servipro.com.br", margin, footerY);
  doc.text(`Gerado em: ${formatDateTimePdf()}`, pageWidth - margin, footerY, { align: "right" });

  // Save
  const filename = `Relatorio_${tipoLabel}_${periodo.replace(/[\/\s]/g, "-")}.pdf`;
  doc.save(filename);
}
