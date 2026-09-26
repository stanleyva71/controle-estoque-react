import { jsPDF } from 'jspdf';
import { FileText } from 'lucide-react';

interface StockReportProps {
  analysis: string;
}

function StockReport({ analysis }: StockReportProps) {

  function downloadPDF() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    let y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório de Análise Automática', margin, y);

    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);

    doc.text(
      `Gerado em ${new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date())}`,
      margin,
      y
    );

    y += 10;

    doc.setTextColor(40);
    doc.setFontSize(11);

    const lines = analysis
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        y += 3;
        continue;
      }

      const isSection =
        trimmedLine.length < 100 &&
        (
          /^Análise Automática do Estoque$/i.test(trimmedLine) ||
          /^\d+\./.test(trimmedLine) ||
          /^Visão Geral do Estoque$/i.test(trimmedLine) ||
          /^Situação dos Produtos$/i.test(trimmedLine) ||
          /^Destaques de Quantidade em Estoque$/i.test(trimmedLine) ||
          /^Análise de Preços$/i.test(trimmedLine) ||
          /^Distribuição por Categoria$/i.test(trimmedLine) ||
          /^Pontos de Atenção$/i.test(trimmedLine) ||
          /^Sugestões para o Gestor$/i.test(trimmedLine) ||
          /^Conclusão$/i.test(trimmedLine)
        );

      if (isSection) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);

        const wrappedHeading = doc.splitTextToSize(
          trimmedLine,
          contentWidth
        );

        doc.text(wrappedHeading, margin, y);

        y += wrappedHeading.length * 6 + 3;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(40);

        continue;
      }

      const wrappedText = doc.splitTextToSize(
        trimmedLine,
        contentWidth
      );

      if (y + wrappedText.length * 5 > pageHeight - 15) {
        doc.addPage();
        y = 18;
      }

      doc.text(wrappedText, margin, y);

      y += wrappedText.length * 5 + 2;
    }

    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130);

      doc.text(
        `Página ${page} de ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        {
          align: 'right',
        }
      );
    }

    doc.save(
      `relatorio-estoque-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />

            <h3 className="text-lg font-bold text-slate-800">
              Análise automática
            </h3>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Relatório gerado pela inteligência artificial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FileText size={17} />
            Baixar PDF
          </button>

        </div>
      </div>

      <div className="p-5">
        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {analysis}
        </div>
      </div>
    </div>
  );
}

export default StockReport;