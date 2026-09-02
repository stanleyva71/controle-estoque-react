import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CirclePlus,
  Pencil,
  Trash2,
  History,
} from 'lucide-react';

import type { MovementType, StockMovement } from '../types/StockMovement';

import { getStockMovements } from '../utils/stockMovements';

function StockHistory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  function loadMovements() {
    const data = getStockMovements();

    const sortedMovements = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setMovements(sortedMovements);
  }

  useEffect(() => {
    loadMovements();

    const handleMovementsUpdated = () => {
      loadMovements();
    };

    window.addEventListener('stockMovementsUpdated', handleMovementsUpdated);

    return () => {
      window.removeEventListener(
        'stockMovementsUpdated',
        handleMovementsUpdated
      );
    };
  }, []);

  function getMovementConfig(type: MovementType) {
    switch (type) {
      case 'entrada':
        return {
          label: 'Entrada',
          icon: ArrowDownToLine,
          className:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };

      case 'saida':
        return {
          label: 'Saída',
          icon: ArrowUpFromLine,
          className:
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };

      case 'criacao':
        return {
          label: 'Criação',
          icon: CirclePlus,
          className:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };

      case 'atualizacao':
        return {
          label: 'Atualização',
          icon: Pencil,
          className:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };

      case 'remocao':
        return {
          label: 'Remoção',
          icon: Trash2,
          className:
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        };

      default:
        return {
          label: 'Desconhecido',
          icon: History,
          className:
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        };
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(date));
  }

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <History size={22} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Histórico de Movimentações
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe todas as alterações realizadas no estoque.
          </p>
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
          <History size={42} className="mb-3 text-gray-400" />

          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Nenhuma movimentação encontrada
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            As movimentações realizadas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Produto
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Movimento
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Quantidade
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Estoque
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Data
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => {
                  const config = getMovementConfig(movement.type);
                  const Icon = config.icon;

                  return (
                    <tr
                      key={movement.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {movement.productName}
                          </p>

                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID #{movement.productId}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}
                        >
                          <Icon size={14} />
                          {config.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {movement.quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {movement.previousQuantity}
                          </span>

                          <span className="text-gray-400">→</span>

                          <span className="font-semibold text-gray-900 dark:text-white">
                            {movement.newQuantity}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(movement.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default StockHistory;
