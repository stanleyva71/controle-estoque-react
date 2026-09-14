import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/auth';
import {
  Package,
  TriangleAlert,
  Tags,
  DollarSign,
  Bot,
  Loader2,
  Send,
  User,
  PackageX,
  ArrowRight,
  Plus,
  History,
  FolderTree,
  Pencil,
  CheckCircle2,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Activity,
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import type { Product } from '../types/Product';

interface DashboardProps {
  products: Product[];

  onEditProduct: (product: Product) => void;

  onNewProduct: () => void;

  onProducts: () => void;

  onHistory: () => void;

  onCategories: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'entrada' | 'saida' | 'criacao' | 'atualizacao' | 'remocao';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  description?: string;
  date: string;
}

type MovementPeriod = 'all' | '7days' | '30days';

const CHART_COLORS = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

function Dashboard({
  products,
  onEditProduct,
  onNewProduct,
  onProducts,
  onHistory,
  onCategories,
}: DashboardProps) {
  // ==========================================
  // IA
  // ==========================================

  const [analysis, setAnalysis] = useState('');

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [analysisError, setAnalysisError] = useState('');

  const [question, setQuestion] = useState('');

  const [loadingChat, setLoadingChat] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Olá! 👋 Sou o assistente de estoque. Você pode me perguntar sobre seus produtos, estoque baixo, reposições, categorias ou qualquer outra informação relacionada ao seu estoque.',
    },
  ]);

  // ==========================================
  // MOVIMENTAÇÕES
  // ==========================================

  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [loadingMovements, setLoadingMovements] = useState(true);

  const [movementsError, setMovementsError] = useState('');

  const [movementPeriod, setMovementPeriod] = useState<MovementPeriod>('all');

  // ==========================================
  // INDICADORES
  // ==========================================

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const lowStockProducts = products.filter(
    (product) => product.quantity > 0 && product.quantity <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => product.quantity <= 0
  );

  const normalStockProducts = products.filter(
    (product) => product.quantity > 5
  );

  const lowStockCount = lowStockProducts.length;

  const outOfStockCount = outOfStockProducts.length;

  const normalStockCount = normalStockProducts.length;

  const totalCategories = new Set(products.map((product) => product.category))
    .size;

  const totalStockValue = products.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );

  // ==========================================
  // SAÚDE DO ESTOQUE
  // ==========================================

  const stockHealthTotal = normalStockCount + lowStockCount + outOfStockCount;

  const normalPercentage =
    stockHealthTotal > 0
      ? Math.round((normalStockCount / stockHealthTotal) * 100)
      : 0;

  const lowPercentage =
    stockHealthTotal > 0
      ? Math.round((lowStockCount / stockHealthTotal) * 100)
      : 0;

  const outPercentage =
    stockHealthTotal > 0
      ? Math.round((outOfStockCount / stockHealthTotal) * 100)
      : 0;

  // ==========================================
  // PRODUTOS QUE PRECISAM DE ATENÇÃO
  // ==========================================

  const attentionProducts = [...products]
    .filter((product) => product.quantity <= 5)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 6);

  // ==========================================
  // ESTOQUE POR CATEGORIA
  // ==========================================

  const categoryChartData = useMemo(() => {
    const stockByCategory = products.reduce(
      (acc, product) => {
        const category = product.category || 'Sem categoria';

        acc[category] = (acc[category] || 0) + product.quantity;

        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(stockByCategory)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // ==========================================
  // PRODUTOS COM ESTOQUE BAIXO
  // ==========================================

  const lowStockChartData = useMemo(() => {
    return [...lowStockProducts]
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 8)
      .map((product) => ({
        name:
          product.name.length > 18
            ? `${product.name.slice(0, 18)}...`
            : product.name,
        quantidade: product.quantity,
      }));
  }, [lowStockProducts]);

  // ==========================================
  // BUSCAR MOVIMENTAÇÕES
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadMovements() {
      try {
        setLoadingMovements(true);
        setMovementsError('');

        const response = await apiFetch('/movements');

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Não foi possível carregar as movimentações.'
          );
        }

        if (!cancelled) {
          setMovements(data);
        }
      } catch (error) {
        console.error('ERRO AO CARREGAR MOVIMENTAÇÕES:', error);

        if (!cancelled) {
          setMovementsError(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar as movimentações.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMovements(false);
        }
      }
    }

    loadMovements();

    return () => {
      cancelled = true;
    };
  }, [products]);

  // ==========================================
  // FILTRO DE MOVIMENTAÇÕES
  // ==========================================

  const filteredMovements = useMemo(() => {
    if (movementPeriod === 'all') {
      return movements;
    }

    const days = movementPeriod === '7days' ? 7 : 30;

    const limitDate = new Date().getTime() - days * 24 * 60 * 60 * 1000;

    return movements.filter(
      (movement) => new Date(movement.date).getTime() >= limitDate
    );
  }, [movements, movementPeriod]);

  // ==========================================
  // RESUMO DAS MOVIMENTAÇÕES
  // ==========================================

  const totalEntries = filteredMovements
    .filter((movement) => movement.type === 'entrada')
    .reduce((total, movement) => total + movement.quantity, 0);

  const totalExits = filteredMovements
    .filter((movement) => movement.type === 'saida')
    .reduce((total, movement) => total + movement.quantity, 0);

  const totalCreated = filteredMovements.filter(
    (movement) => movement.type === 'criacao'
  ).length;

  const totalRemoved = filteredMovements.filter(
    (movement) => movement.type === 'remocao'
  ).length;

  const netMovement = totalEntries - totalExits;

  const recentMovements = filteredMovements.slice(0, 5);

  // ==========================================
  // IA - ANÁLISE AUTOMÁTICA
  // ==========================================

  async function analyzeStock() {
    try {
      setLoadingAnalysis(true);

      setAnalysis('');

      setAnalysisError('');

      const response = await fetch(
        'http://localhost:3001/api/analisar-estoque',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            products,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar estoque.');
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Erro ao analisar estoque:', error);

      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'Não foi possível analisar o estoque.'
      );
    } finally {
      setLoadingAnalysis(false);
    }
  }

  // ==========================================
  // IA - CHAT
  // ==========================================

  async function sendQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loadingChat || products.length === 0) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion('');

    setLoadingChat(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat-estoque', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          products,
          question: trimmedQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar pergunta.');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);

      const errorMessage: ChatMessage = {
        role: 'assistant',

        content:
          error instanceof Error
            ? `Não foi possível responder: ${error.message}`
            : 'Não foi possível responder à pergunta.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoadingChat(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      sendQuestion();
    }
  }

  // ==========================================
  // FORMATAÇÃO
  // ==========================================

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatMovementDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="space-y-6">
      {/* ==========================================
          CABEÇALHO
      ========================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Visão geral do seu estoque e das principais informações do sistema.
        </p>
      </div>

      {/* ==========================================
          INDICADORES
      ========================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {/* Produtos */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Package size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Produtos</p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {totalProducts}
            </p>

            <p className="mt-1 text-xs text-slate-400">Cadastrados</p>
          </div>
        </div>

        {/* Unidades */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Package size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Unidades</p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {totalUnits}
            </p>

            <p className="mt-1 text-xs text-slate-400">Em estoque</p>
          </div>
        </div>

        {/* Estoque baixo */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
            <TriangleAlert size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Estoque baixo</p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {lowStockCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">Precisam de atenção</p>
          </div>
        </div>

        {/* Categorias */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Tags size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Categorias</p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {totalCategories}
            </p>

            <p className="mt-1 text-xs text-slate-400">Cadastradas</p>
          </div>
        </div>

        {/* Valor */}

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <DollarSign size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              Valor em estoque
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {formatCurrency(totalStockValue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">Valor estimado</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          GRÁFICOS
      ========================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Estoque por categoria */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Estoque por categoria
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribuição das unidades atualmente em estoque.
            </p>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <p className="text-sm text-slate-400">Nenhum dado disponível.</p>
            </div>
          ) : (
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={105}
                    paddingAngle={2}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [`${value ?? 0} unidades`, 'Estoque']}
                  />

                  <Legend verticalAlign="bottom" height={45} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Estoque baixo */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Produtos com estoque baixo
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Produtos com até 5 unidades disponíveis.
            </p>
          </div>

          {lowStockChartData.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Nenhum produto com estoque baixo.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={lowStockChartData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" domain={[0, 5]} allowDecimals={false} />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="quantidade"
                    fill="#f59e0b"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          SAÚDE DO ESTOQUE + AÇÕES
      ========================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Saúde */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Saúde do estoque
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Situação atual dos produtos cadastrados.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {totalProducts} produtos
            </div>
          </div>

          <div className="mt-6">
            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-full">
                {normalPercentage > 0 && (
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${normalPercentage}%`,
                    }}
                  />
                )}

                {lowPercentage > 0 && (
                  <div
                    className="bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${lowPercentage}%`,
                    }}
                  />
                )}

                {outPercentage > 0 && (
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{
                      width: `${outPercentage}%`,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />

                    <span className="text-sm font-semibold text-emerald-700">
                      Normal
                    </span>
                  </div>

                  <span className="text-sm font-bold text-emerald-700">
                    {normalPercentage}%
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-emerald-800">
                  {normalStockCount}
                </p>

                <p className="mt-1 text-xs text-emerald-600">produtos</p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-600" />

                    <span className="text-sm font-semibold text-amber-700">
                      Baixo
                    </span>
                  </div>

                  <span className="text-sm font-bold text-amber-700">
                    {lowPercentage}%
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-amber-800">
                  {lowStockCount}
                </p>

                <p className="mt-1 text-xs text-amber-600">produtos</p>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageX size={18} className="text-red-600" />

                    <span className="text-sm font-semibold text-red-700">
                      Zerado
                    </span>
                  </div>

                  <span className="text-sm font-bold text-red-700">
                    {outPercentage}%
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-red-800">
                  {outOfStockCount}
                </p>

                <p className="mt-1 text-xs text-red-600">produtos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Ações rápidas</h2>

          <p className="mt-1 text-sm text-slate-500">
            Acesse rapidamente os principais módulos.
          </p>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={onNewProduct}
              className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Plus size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Novo produto
                  </p>

                  <p className="text-xs text-slate-500">Cadastrar produto</p>
                </div>
              </div>

              <ArrowRight size={18} className="text-blue-600" />
            </button>

            <button
              type="button"
              onClick={onProducts}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  <Package size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Ver produtos
                  </p>

                  <p className="text-xs text-slate-500">Consultar estoque</p>
                </div>
              </div>

              <ArrowRight size={18} className="text-slate-500" />
            </button>

            <button
              type="button"
              onClick={onHistory}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  <History size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Histórico
                  </p>

                  <p className="text-xs text-slate-500">Ver movimentações</p>
                </div>
              </div>

              <ArrowRight size={18} className="text-slate-500" />
            </button>

            <button
              type="button"
              onClick={onCategories}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  <FolderTree size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Categorias
                  </p>

                  <p className="text-xs text-slate-500">Organizar categorias</p>
                </div>
              </div>

              <ArrowRight size={18} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          PRODUTOS QUE PRECISAM DE ATENÇÃO
      ========================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TriangleAlert size={21} className="text-amber-500" />

              <h2 className="text-lg font-bold text-slate-800">
                Produtos que precisam de atenção
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Produtos com estoque zerado ou baixo.
            </p>
          </div>

          {attentionProducts.length > 0 && (
            <button
              type="button"
              onClick={onProducts}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Ver todos
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {attentionProducts.length === 0 ? (
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <p className="font-semibold text-emerald-800">
                Tudo certo com o estoque!
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Nenhum produto está com estoque baixo ou zerado.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="divide-y divide-slate-100">
              {attentionProducts.map((product) => {
                const outOfStock = product.quantity <= 0;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <span
                          className={
                            outOfStock
                              ? 'inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700'
                              : 'inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700'
                          }
                        >
                          {outOfStock ? 'Estoque zerado' : 'Estoque baixo'}
                        </span>

                        <p
                          className={
                            outOfStock
                              ? 'mt-1 text-sm font-bold text-red-600'
                              : 'mt-1 text-sm font-bold text-amber-600'
                          }
                        >
                          {product.quantity} unidades
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Editar produto"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MOVIMENTAÇÕES
      ========================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Resumo */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity size={21} className="text-blue-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Movimentações
              </h2>

              <p className="text-sm text-slate-500">
                Resumo do período selecionado
              </p>
            </div>
          </div>

          {/* Filtro */}

          <div className="mt-5 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMovementPeriod('all')}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                movementPeriod === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tudo
            </button>

            <button
              type="button"
              onClick={() => setMovementPeriod('7days')}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                movementPeriod === '7days'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              7 dias
            </button>

            <button
              type="button"
              onClick={() => setMovementPeriod('30days')}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                movementPeriod === '30days'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              30 dias
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {/* Entrada */}

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ArrowDownRight size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Entradas
                  </p>

                  <p className="text-xs text-slate-500">Unidades adicionadas</p>
                </div>
              </div>

              <p className="text-xl font-bold text-emerald-700">
                +{totalEntries}
              </p>
            </div>

            {/* Saída */}

            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <ArrowUpRight size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Saídas</p>

                  <p className="text-xs text-slate-500">Unidades removidas</p>
                </div>
              </div>

              <p className="text-xl font-bold text-red-700">-{totalExits}</p>
            </div>

            {/* Saldo */}

            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <RefreshCw size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Saldo</p>

                  <p className="text-xs text-slate-500">Entradas − saídas</p>
                </div>
              </div>

              <p
                className={`text-xl font-bold ${
                  netMovement >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}
              >
                {netMovement >= 0 ? '+' : ''}
                {netMovement}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Produtos criados
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalCreated}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Produtos removidos
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalRemoved}
              </p>
            </div>
          </div>
        </div>

        {/* Histórico recente */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History size={21} className="text-blue-600" />

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Movimentações recentes
                </h2>

                <p className="text-sm text-slate-500">
                  Últimas alterações realizadas no estoque.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onHistory}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Ver histórico
              <ArrowRight size={16} />
            </button>
          </div>

          {loadingMovements ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Carregando histórico...
              </div>
            </div>
          ) : movementsError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {movementsError}
            </div>
          ) : recentMovements.length === 0 ? (
            <div className="mt-5 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <History size={32} className="text-slate-300" />

              <p className="mt-3 font-semibold text-slate-600">
                Nenhuma movimentação encontrada
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Não existem registros no período selecionado.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {recentMovements.map((movement) => {
                const isEntry = movement.type === 'entrada';

                const isExit = movement.type === 'saida';

                const isCreation = movement.type === 'criacao';

                const isRemoval = movement.type === 'remocao';

                let label = 'Atualização';

                let icon = <RefreshCw size={17} />;

                let iconClass = 'bg-blue-100 text-blue-600';

                let quantityClass = 'text-slate-600';

                if (isEntry) {
                  label = 'Entrada';

                  icon = <ArrowDownRight size={17} />;

                  iconClass = 'bg-emerald-100 text-emerald-600';

                  quantityClass = 'text-emerald-600';
                }

                if (isExit) {
                  label = 'Saída';

                  icon = <ArrowUpRight size={17} />;

                  iconClass = 'bg-red-100 text-red-600';

                  quantityClass = 'text-red-600';
                }

                if (isCreation) {
                  label = 'Criação';

                  icon = <Package size={17} />;

                  iconClass = 'bg-blue-100 text-blue-600';

                  quantityClass = 'text-blue-600';
                }

                if (isRemoval) {
                  label = 'Remoção';

                  icon = <PackageX size={17} />;

                  iconClass = 'bg-slate-200 text-slate-600';

                  quantityClass = 'text-slate-600';
                }

                return (
                  <div
                    key={movement.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {movement.productName}
                        </p>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {label}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {movement.description || label}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatMovementDate(movement.date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {(isEntry || isExit || isCreation) && (
                        <p className={`text-sm font-bold ${quantityClass}`}>
                          {isEntry || isCreation ? '+' : '-'}
                          {movement.quantity}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        Estoque: {movement.newQuantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          IA
      ========================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot size={24} className="text-blue-600" />

          <h2 className="text-xl font-bold text-slate-800">
            Assistente inteligente de estoque
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Faça perguntas sobre os produtos cadastrados e receba respostas da IA.
        </p>

        <div className="mt-5 h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
                    {message.role === 'user' ? (
                      <>
                        <User size={14} />
                        Você
                      </>
                    ) : (
                      <>
                        <Bot size={14} />
                        Assistente
                      </>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loadingChat && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Analisando...
                </div>
              </div>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Cadastre pelo menos um produto para conversar com a IA.
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex.: Quais produtos precisam de reposição?"
              disabled={loadingChat}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={sendQuestion}
              disabled={!question.trim() || loadingChat}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingChat ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
              Enviar
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={analyzeStock}
            disabled={loadingAnalysis || products.length === 0}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAnalysis ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Gerando análise...
              </>
            ) : (
              <>
                <Bot size={18} />
                Gerar análise automática
              </>
            )}
          </button>
        </div>

        {analysisError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Erro:</strong> {analysisError}
          </div>
        )}

        {analysis && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h3 className="mb-3 font-bold text-blue-900">Análise automática</h3>

            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
