import {
  Package,
  TriangleAlert,
  Tags,
  DollarSign,
  Bot,
  Loader2,
  Send,
  User,
  Trash2,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

import type { Product } from '../types/Product';

interface DashboardProps {
  products: Product[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StoredChat {
  messages: ChatMessage[];
  updatedAt: number;
}

const CHAT_STORAGE_KEY = 'estoque-chat';
const CHAT_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Olá! 👋 Sou o assistente de estoque. Você pode me perguntar sobre seus produtos, estoque baixo, reposições, categorias ou qualquer outra informação relacionada ao seu estoque.',
};

/**
 * Limpa alguns resíduos que podem eventualmente vir da resposta
 * do modelo de IA antes de enviar o conteúdo para o Markdown.
 */
function cleanAIResponse(content: string): string {
  return content
    .replace(/^(\s*)\\(#{1,6})/gm, '$1$2')
    .replace(/svgAssistente/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Componentes usados pelo ReactMarkdown.
 */
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-3 mt-2 text-lg font-bold text-slate-800">
      {children}
    </h1>
  ),

  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2 mt-5 text-base font-bold text-slate-800 first:mt-0">
      {children}
    </h2>
  ),

  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-sm font-bold text-slate-800 first:mt-0">
      {children}
    </h3>
  ),

  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 leading-6 last:mb-0">{children}</p>
  ),

  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
  ),

  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
  ),

  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-6">{children}</li>
  ),

  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),

  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),

  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-3 border-l-4 border-blue-300 pl-4 italic text-slate-600">
      {children}
    </blockquote>
  ),

  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
      {children}
    </code>
  ),
};

function Dashboard({ products }: DashboardProps) {
  const [analysis, setAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const [question, setQuestion] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);

      if (!stored) {
        return [INITIAL_MESSAGE];
      }

      const parsed: StoredChat = JSON.parse(stored);

      const isExpired =
        Date.now() - parsed.updatedAt > CHAT_EXPIRATION_TIME;

      if (
        isExpired ||
        !Array.isArray(parsed.messages) ||
        parsed.messages.length === 0
      ) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        return [INITIAL_MESSAGE];
      }

      return parsed.messages;
    } catch (error) {
      console.error('Erro ao carregar conversa salva:', error);

      localStorage.removeItem(CHAT_STORAGE_KEY);

      return [INITIAL_MESSAGE];
    }
  });

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5
  );

  const lowStockCount = lowStockProducts.length;

  const totalCategories = new Set(
    products.map((product) => product.category)
  ).size;

  const totalStockValue = products.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );

  /**
   * Salva a conversa sempre que as mensagens mudarem.
   */
  useEffect(() => {
    try {
      const storedChat: StoredChat = {
        messages,
        updatedAt: Date.now(),
      };

      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(storedChat)
      );
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
    }
  }, [messages]);

  /**
   * Verifica periodicamente se a conversa expirou.
   *
   * Isso permite que uma conversa seja apagada mesmo
   * enquanto o Dashboard permanece aberto.
   */
  useEffect(() => {
    const expirationCheck = window.setInterval(() => {
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);

        if (!stored) {
          return;
        }

        const parsed: StoredChat = JSON.parse(stored);

        if (
          Date.now() - parsed.updatedAt >
          CHAT_EXPIRATION_TIME
        ) {
          localStorage.removeItem(CHAT_STORAGE_KEY);
          setMessages([INITIAL_MESSAGE]);
        }
      } catch (error) {
        console.error(
          'Erro ao verificar expiração da conversa:',
          error
        );
      }
    }, 60 * 1000);

    return () => {
      window.clearInterval(expirationCheck);
    };
  }, []);

  function clearConversation() {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([INITIAL_MESSAGE]);
    setQuestion('');
  }

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
        throw new Error(
          data.error || 'Erro ao analisar estoque.'
        );
      }

      setAnalysis(
        typeof data.analysis === 'string'
          ? cleanAIResponse(data.analysis)
          : 'A análise não retornou uma resposta válida.'
      );
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

  async function sendQuestion() {
    const trimmedQuestion = question.trim();

    if (
      !trimmedQuestion ||
      loadingChat ||
      products.length === 0
    ) {
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
      const response = await fetch(
        'http://localhost:3001/api/chat-estoque',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products,
            question: trimmedQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erro ao enviar pergunta.'
        );
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content:
          typeof data.answer === 'string'
            ? cleanAIResponse(data.answer)
            : 'A IA não retornou uma resposta válida.',
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error('Erro no chat:', error);

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          error instanceof Error
            ? `Não foi possível responder: ${error.message}`
            : 'Não foi possível responder à pergunta.',
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setLoadingChat(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Enter') {
      sendQuestion();
    }
  }

  return (
    <section>
      {/* ========================= */}
      {/* Cards do Dashboard */}
      {/* ========================= */}

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
              {totalStockValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Valor total dos produtos
            </p>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Assistente de IA */}
      {/* ========================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bot size={24} className="text-blue-600" />

              <h2 className="text-xl font-bold text-slate-800">
                Assistente inteligente de estoque
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Faça perguntas sobre os produtos cadastrados e
              receba respostas da IA.
            </p>
          </div>

          <button
            type="button"
            onClick={clearConversation}
            disabled={messages.length <= 1 && !loadingChat}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            title="Limpar conversa"
          >
            <Trash2 size={17} />
            Limpar conversa
          </button>
        </div>

        {/* Área do chat */}
        <div className="mt-5 h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
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

                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-6">
                      <ReactMarkdown
                        components={markdownComponents}
                      >
                        {cleanAIResponse(message.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-6 text-white">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loadingChat && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Analisando...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campo de pergunta */}
        {products.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Cadastre pelo menos um produto para conversar com
            a IA.
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ex.: Quais produtos precisam de reposição?"
              disabled={loadingChat}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={sendQuestion}
              disabled={
                !question.trim() || loadingChat
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingChat ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <Send size={20} />
              )}

              Enviar
            </button>
          </div>
        )}

        {/* Botão de análise automática */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={analyzeStock}
            disabled={
              loadingAnalysis ||
              products.length === 0
            }
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAnalysis ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

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

        {/* Erro da análise */}
        {analysisError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Erro:</strong> {analysisError}
          </div>
        )}

        {/* Resultado da análise */}
        {analysis && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h3 className="mb-3 font-bold text-blue-900">
              Análise automática
            </h3>

            <div className="text-sm leading-7 text-slate-700">
              <ReactMarkdown
                components={markdownComponents}
              >
                {cleanAIResponse(analysis)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;