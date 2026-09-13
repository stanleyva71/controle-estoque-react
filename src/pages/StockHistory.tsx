import { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../utils/auth';

import {
  exportMovementsToCSV,
  exportMovementsToPDF,
} from '../utils/exportHistory';

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
  Download,
  FileText,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type { MovementType, StockMovement } from '../types/StockMovement';

const HISTORY_PER_PAGE = 10;

function StockHistory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [selectedType, setSelectedType] = useState<
    MovementType | 'todos'
  >('todos');

  const [selectedUser, setSelectedUser] = useState<string>('todos');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================
  // Carregar histórico da API
  // =========================

  useEffect(() => {
    async function loadMovements() {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch('/movements');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Não foi possível carregar o histórico.'
          );
        }

        const sortedMovements = [...data].sort(
          (a: StockMovement, b: StockMovement) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setMovements(sortedMovements);
      } catch (error) {
        console.error('ERRO AO CARREGAR HISTÓRICO:', error);

        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o histórico.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovements();
  }, []);

  // =========================
  // Configuração dos movimentos
  // =========================

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

  // =========================
  // Formatar data
  // =========================

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  // =========================
  // Quantidade exibida
  // =========================

  function getQuantityLabel(movement: StockMovement) {
    if (movement.type === 'entrada' || movement.type === 'criacao') {
      return `+${movement.quantity}`;
    }

    if (movement.type === 'saida') {
      return `-${movement.quantity}`;
    }

    return '—';
  }

  // =========================
  // Usuários disponíveis
  // =========================

  const availableUsers = useMemo(() => {
    const usersMap = new Map<
      number,
      {
        id: number;
        name: string;
        email: string;
      }
    >();

    movements.forEach((movement) => {
      if (movement.user) {
        usersMap.set(movement.user.id, movement.user);
      }
    });

    return Array.from(usersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR')
    );
  }, [movements]);

  // =========================
  // Filtros
  // =========================

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const movementDate = new Date(movement.date);

      const matchesType =
        selectedType === 'todos' || movement.type === selectedType;

      const matchesUser =
        selectedUser === 'todos' ||
        movement.user?.id === Number(selectedUser);

      const matchesStartDate =
        startDate === '' ||
        movementDate >= new Date(`${startDate}T00:00:00`);

      const matchesEndDate =
        endDate === '' ||
        movementDate <= new Date(`${endDate}T23:59:59`);

      return (
        matchesType &&
        matchesUser &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [movements, selectedType, selectedUser, startDate, endDate]);

  // =========================
  // Paginação
  // =========================

  const totalPages = Math.ceil(
    filteredMovements.length / HISTORY_PER_PAGE
  );

  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * HISTORY_PER_PAGE;
    const endIndex = startIndex + HISTORY_PER_PAGE;

    return filteredMovements.slice(startIndex, endIndex);
  }, [filteredMovements, currentPage]);

  // Voltar para página 1 quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedUser, startDate, endDate]);

  // Garantir que a página atual continue válida
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =========================
  // Limpar filtros
  // =========================

  function clearFilters() {
    setSelectedType('todos');
    setSelectedUser('todos');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  }

  // =========================
  // Resumo
  // =========================

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
    selectedType !== 'todos' ||
    selectedUser !== 'todos' ||
    startDate !== '' ||
    endDate !== '';

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <History size={30} />
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            Carregando histórico...
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Buscando as movimentações no banco de dados.
          </p>
        </div>
      </section>
    );
  }

  // =========================
  // Erro
  // =========================

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <History size={30} />
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            Não foi possível carregar o histórico
          </h3>

          <p className="mt-2 max-w-md text-sm text-red-500">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => exportMovementsToCSV(filteredMovements)}
            disabled={filteredMovements.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={18} />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => exportMovementsToPDF(filteredMovements)}
            disabled={filteredMovements.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileText size={18} />
            Exportar PDF
          </button>
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

              {/* Usuário */}
              <div>
                <label
                  htmlFor="movement-user"
                  className="mb-2 block text-sm font-semibold text-slate-600"
                >
                  Usuário
                </label>

                <select
                  id="movement-user"
                  value={selectedUser}
                  onChange={(event) => setSelectedUser(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="todos">Todos os usuários</option>

                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
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
            </div>

            {/* Limpar filtros */}
            <div className="mt-4 flex justify-center sm:justify-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <RotateCcw size={18} />
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Resumo */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Remoções
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-700">
                {totalRemovals}
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
            <>
              {/* Tabela */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-[1100px] w-full">
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
                        Realizado por
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Data
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedMovements.map((movement) => {
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

                          {/* Movimento */}
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

                          {/* Usuário */}
                          <td className="px-5 py-4">
                            {movement.user ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  <UserCircle size={19} />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-700">
                                    {movement.user.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {movement.user.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <UserCircle size={18} />
                                <span>Não identificado</span>
                              </div>
                            )}
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-slate-500">
                    Mostrando{' '}
                    <span className="font-semibold text-slate-700">
                      {(currentPage - 1) * HISTORY_PER_PAGE + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        currentPage * HISTORY_PER_PAGE,
                        filteredMovements.length
                      )}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-slate-700">
                      {filteredMovements.length}
                    </span>{' '}
                    registros
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                      Anterior
                    </button>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-bold text-white">
                      {currentPage}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Próxima
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default StockHistory;