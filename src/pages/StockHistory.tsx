import { useState } from "react";

import type { StockMovement } from "../types/StockMovement";
import { getStockMovements } from "../utils/stockMovements";

function StockHistory() {
  const [movements] = useState<StockMovement[]>(() =>
    getStockMovements(),
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Histórico de movimentações
        </h1>

        <p className="mt-1 text-gray-500">
          Acompanhe todas as alterações realizadas no estoque.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Data
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Produto
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Movimentação
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Quantidade
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Estoque
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Descrição
                </th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {new Date(movement.date).toLocaleString("pt-BR")}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                    {movement.productName}
                  </td>

                  <td className="px-4 py-4 text-sm capitalize text-slate-600">
                    {movement.type}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {movement.quantity}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {movement.previousQuantity} →{" "}
                    {movement.newQuantity}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {movement.description}
                  </td>
                </tr>
              ))}

              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockHistory;