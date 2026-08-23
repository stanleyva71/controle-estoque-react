import {
  Package,
  TriangleAlert,
  Tags,
  DollarSign,
  AlertTriangle,
  Bot,
  Loader2,
} from "lucide-react";

import { useState } from "react";

import type { Product } from "../types/Product";

interface DashboardProps {
  products: Product[];
}

function Dashboard({ products }: DashboardProps) {
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const totalProducts = products.length;

  // Lista dos produtos com estoque baixo
  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5,
  );

  // Quantidade de produtos com estoque baixo
  const lowStockCount = lowStockProducts.length;

  const totalCategories = new Set(
    products.map((product) => product.category),
  ).size;

  const totalStockValue = products.reduce(
    (total, product) => total + product.quantity * product.price,
    0,
  );

  async function analyzeStock() {
    try {
      setLoadingAnalysis(true);
      setAnalysis("");
      setAnalysisError("");

      const response = await fetch(
        "http://localhost:3001/api/analisar-estoque",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar estoque.");
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Erro ao analisar estoque:", error);

      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Não foi possível analisar o estoque.",
      );
    } finally {
      setLoadingAnalysis(false);
    }
  }

  return (
    <section>
      {/* Alerta de estoque baixo */}
      {lowStockCount > 0 && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle size={23} />
          </div>

          <div>
            <h3 className="font-bold text-amber-900">
              Atenção ao estoque
            </h3>

            <p className="mt-1 text-sm text-amber-700">
              {lowStockCount}{" "}
              {lowStockCount === 1
                ? "produto está com estoque baixo."
                : "produtos estão com estoque baixo."}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total de produtos */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Package size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Total de Produtos
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {totalProducts}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Produtos cadastrados
            </p>
          </div>
        </div>

        {/* Estoque baixo */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
            <TriangleAlert size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Estoque Baixo
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {lowStockCount}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Produtos com pouco estoque
            </p>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Tags size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Categorias
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {totalCategories}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Categorias cadastradas
            </p>
          </div>
        </div>

        {/* Valor total */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <DollarSign size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Valor Total em Estoque
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {totalStockValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Valor total dos produtos
            </p>
          </div>
        </div>
      </div>

      {/* Análise com IA */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot size={24} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-800">
                Análise inteligente do estoque
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Utilize a IA para identificar problemas e prioridades no
              estoque.
            </p>
          </div>

          <button
            onClick={analyzeStock}
            disabled={loadingAnalysis || products.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAnalysis ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Bot size={20} />
                Analisar Estoque
              </>
            )}
          </button>
        </div>

        {analysisError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Erro:</strong> {analysisError}
          </div>
        )}

        {analysis && (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h3 className="mb-3 font-bold text-blue-900">
              Resultado da análise
            </h3>

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