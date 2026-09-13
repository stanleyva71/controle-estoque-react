import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { StockMovement } from '../types/StockMovement';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

function getMovementLabel(
  type: StockMovement['type'],
) {
  switch (type) {
    case 'entrada':
      return 'Entrada';

    case 'saida':
      return 'Saída';

    case 'criacao':
      return 'Criação';

    case 'atualizacao':
      return 'Atualização';

    case 'remocao':
      return 'Remoção';

    default:
      return 'Desconhecido';
  }
}

function escapeCsvValue(
  value: string | number,
) {
  const stringValue = String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function getUserName(
  movement: StockMovement,
) {
  return movement.user?.name || 'Não identificado';
}

function getUserEmail(
  movement: StockMovement,
) {
  return movement.user?.email || '—';
}

export function exportMovementsToCSV(
  movements: StockMovement[],
) {
  if (movements.length === 0) {
    return;
  }

  const headers = [
    'Produto',
    'ID',
    'Movimento',
    'Descrição',
    'Quantidade',
    'Estoque anterior',
    'Novo estoque',
    'Usuário',
    'E-mail do usuário',
    'Data',
  ];

  const rows = movements.map((movement) => [
    movement.productName,
    movement.productId,
    getMovementLabel(movement.type),
    movement.description || 'Sem descrição',
    movement.quantity,
    movement.previousQuantity,
    movement.newQuantity,
    getUserName(movement),
    getUserEmail(movement),
    formatDate(movement.date),
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(';'),
    ...rows.map((row) =>
      row.map(escapeCsvValue).join(';'),
    ),
  ].join('\n');

  const blob = new Blob(
    ['\uFEFF' + csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    },
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  link.download = `historico-estoque-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportMovementsToPDF(
  movements: StockMovement[],
) {
  if (movements.length === 0) {
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();

  doc.setFontSize(18);

  doc.text(
    'Histórico de Movimentações',
    14,
    15,
  );

  doc.setFontSize(10);

  doc.text(
    `Relatório gerado em ${formatDate(
      now.toISOString(),
    )}`,
    14,
    22,
  );

  doc.text(
    `Total de registros: ${movements.length}`,
    14,
    28,
  );

  autoTable(doc, {
    startY: 34,

    head: [[
      'Produto',
      'Movimento',
      'Descrição',
      'Qtd.',
      'Anterior',
      'Novo',
      'Usuário',
      'Data',
    ]],

    body: movements.map((movement) => [
      movement.productName,
      getMovementLabel(movement.type),
      movement.description || 'Sem descrição',
      movement.quantity,
      movement.previousQuantity,
      movement.newQuantity,
      getUserName(movement),
      formatDate(movement.date),
    ]),

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: 'bold',
    },

    columnStyles: {
      0: {
        cellWidth: 32,
      },

      1: {
        cellWidth: 24,
      },

      2: {
        cellWidth: 55,
      },

      3: {
        cellWidth: 15,
      },

      4: {
        cellWidth: 18,
      },

      5: {
        cellWidth: 18,
      },

      6: {
        cellWidth: 45,
      },

      7: {
        cellWidth: 32,
      },
    },

    didDrawPage: (data) => {
      const pageCount =
        doc.getNumberOfPages();

      doc.setFontSize(8);

      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        270,
        200,
        {
          align: 'right',
        },
      );
    },
  });

  doc.save(
    `historico-estoque-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`,
  );
}