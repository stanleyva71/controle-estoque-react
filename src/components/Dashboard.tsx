import {
  Package,
  TriangleAlert,
  Tags,
  DollarSign,
  AlertTriangle,
  Bot,
  Loader2,
  Send,
  User,
} from "lucide-react";

import { useState } from "react";
import type { Product } from "../types/Product";

interface DashboardProps {
  products: Product[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function Dashboard({ products }: DashboardProps) {
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [question, setQuestion] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou o assistente de estoque. Você pode me perguntar sobre seus produtos, estoque baixo, reposições, categorias ou qualquer outra informação relacionada ao seu estoque.",
    },
  ]);

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5,
  );

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

  async function sendQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loadingChat || products.length === 0) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoadingChat(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/chat-estoque",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products,
            question: trimmedQuestion,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar pergunta.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro no chat:", error);

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          error instanceof Error
            ? `Não foi possível responder: ${error.message}`
            : "Não foi possível responder à pergunta.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoadingChat(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendQuestion();
    }
  }

  return (
    <section>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot size={24} className="text-blue-600" />

          <h2 className="text-xl font-bold text-slate-800">
            Assistente inteligente de estoque
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Faça perguntas sobre os produtos cadastrados e receba respostas da
          IA.
        </p>

        <div className="mt-5 h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
                    {message.role === "user" ? (
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
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
            <h3 className="mb-3 font-bold text-blue-900">
              Análise automática
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