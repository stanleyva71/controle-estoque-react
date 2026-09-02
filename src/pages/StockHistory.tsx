import { useEffect, useMemo, useState } from 'react';

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CirclePlus,
  Pencil,
  Trash2,
  History,
  PackageOpen,
  Filter,
  RotateCcw,
} from 'lucide-react';

import type { MovementType, StockMovement } from '../types/StockMovement';

import { getStockMovements } from '../utils/stockMovements';

function StockHistory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [selectedType, setSelectedType] = useState<MovementType | 'todos'>(
    'todos'
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function loadMovements() {
    const storedMovements = getStockMovements();

    const sortedMovements = [...storedMovements].sort(
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
          className: 'bg-green-100 text-green-700 border-green-200',
        };

      case 'saida':
        return {
          label: 'Saída',
          icon: ArrowUpFromLine,
          className: 'bg-red-100 text-red-700 border-red-200',
        };

      case 'criacao':
        return {
          label: 'Criação',
          icon: CirclePlus,
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        };

      case 'atualizacao':
        return {
          label: 'Atualização',
          icon: Pencil,
          className: 'bg-amber-100 text-amber-700 border-amber-200',
        };

      case 'remocao':
        return {
          label: 'Remoção',
          icon: Trash2,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };

      default:
        return {
          label: 'Desconhecido',
          icon: History,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  function getQuantityLabel(movement: StockMovement) {
    if (movement.type === 'entrada' || movement.type === 'criacao') {
      return `+${movement.quantity}`;
    }

    if (movement.type === 'saida') {
      return `-${movement.quantity}`;
    }

    return '—';
  }

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const movementDate = new Date(movement.date);

      const matchesType =
        selectedType === 'todos' || movement.type === selectedType;

      const matchesStartDate =
        startDate === '' || movementDate >= new Date(`${startDate}T00:00:00`);

      const matchesEndDate =
        endDate === '' || movementDate <= new Date(`${endDate}T23:59:59`);

      return matchesType && matchesStartDate && matchesEndDate;
    });
  }, [movements, selectedType, startDate, endDate]);

  function clearFilters() {
    setSelectedType('todos');
    setStartDate('');
    setEndDate('');
  }

  const totalEntries = filteredMovements.filter(
    (movement) => movement.type === 'entrada'
  ).length;

  const totalExits = filteredMovements.filter(
    (movement) => movement.type === 'saida'
  ).length;

  const totalCreations = filteredMovements.filter(
    (movement) => movement.type === 'criacao'
  ).length;

  const totalUpdates = filteredMovements.filter(
    (movement) => movement.type === 'atualizacao'
  ).length;

  const totalRemovals = filteredMovements.filter(
    (movement) => movement.type === 'remocao'
  ).length;

  const hasActiveFilters =
    selectedType !== 'todos' || startDate !== '' || endDate !== '';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <History size={23} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Histórico de Movimentações
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe todas as alterações realizadas no estoque.
          </p>
        </div>
      </div>

      {/* Estado sem movimentações */}
      {movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <PackageOpen size={30} />
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            Nenhuma movimentação registrada
          </h3>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            As movimentações de entrada, saída, criação, atualização e remoção
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={19} className="text-blue-600" />

              <h3 className="font-bold text-slate-700">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Tipo */}
              <div>
                <label
                  htmlFor="movement-type"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Tipo de movimentação
                </label>

                <select
                  id="movement-type"
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(
                      event.target.value as MovementType | 'todos'
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="todos">Todos os tipos</option>

                  <option value="entrada">Entrada</option>

                  <option value="saida">Saída</option>

                  <option value="criacao">Criação</option>

                  <option value="atualizacao">Atualização</option>

                  <option value="remocao">Remoção</option>
                </select>
              </div>

              {/* Data inicial */}
              <div>
                <label
                  htmlFor="start-date"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Data inicial
                </label>

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Data final */}
              <div>
                <label
                  htmlFor="end-date"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Data final
                </label>

                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Limpar */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={18} />
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Registros
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {filteredMovements.length}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Entradas
              </p>

              <p className="mt-1 text-2xl font-bold text-green-700">
                {totalEntries}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                Saídas
              </p>

              <p className="mt-1 text-2xl font-bold text-red-700">
                {totalExits}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Criações
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-700">
                {totalCreations}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Atualizações
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-700">
                {totalUpdates}
              </p>
            </div>
          </div>

          {/* Resultado dos filtros */}
          {filteredMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Filter size={30} />
              </div>

              <h3 className="text-lg font-bold text-slate-700">
                Nenhuma movimentação encontrada
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Não existem movimentações que correspondam aos filtros
                selecionados.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={16} />
                Limpar filtros
              </button>
            </div>
          ) : (
            /* Tabela */
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[950px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Produto
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Movimento
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Descrição
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Quantidade
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Estoque
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Data
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMovements.map((movement) => {
                    const config = getMovementConfig(movement.type);

                    const Icon = config.icon;

                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        {/* Produto */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {movement.productName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID #{movement.productId}
                            </p>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
                          >
                            <Icon size={14} />
                            {config.label}
                          </span>
                        </td>

                        {/* Descrição */}
                        <td className="max-w-xs px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {movement.description || 'Sem descrição'}
                          </p>
                        </td>

                        {/* Quantidade */}
                        <td className="px-5 py-4">
                          <span
                            className={`font-bold ${
                              movement.type === 'entrada' ||
                              movement.type === 'criacao'
                                ? 'text-green-600'
                                : movement.type === 'saida'
                                  ? 'text-red-600'
                                  : 'text-slate-600'
                            }`}
                          >
                            {getQuantityLabel(movement)}
                          </span>
                        </td>

                        {/* Estoque */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-slate-500">
                              {movement.previousQuantity}
                            </span>

                            <span className="text-slate-400">→</span>

                            <span className="font-bold text-slate-800">
                              {movement.newQuantity}
                            </span>
                          </div>
                        </td>

                        {/* Data */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(movement.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default StockHistory;