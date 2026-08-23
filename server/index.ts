import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

const PORT = 3001;

// =========================
// Configurações de segurança
// =========================

// Permite requisições apenas do frontend local
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Adiciona headers de segurança
app.use(helmet());

// Limita o tamanho do JSON recebido
app.use(express.json({ limit: "1mb" }));

// Limita a quantidade de requisições
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Tente novamente mais tarde.",
  },
});

app.use("/api/", apiLimiter);

// =========================
// Teste da API
// =========================

app.get("/api/test", (_req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

// =========================
// Análise de estoque com Ollama
// =========================

app.post("/api/analisar-estoque", async (req, res) => {
  try {
    const { products } = req.body;

    // Verifica se products existe e é um array
    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: "Lista de produtos inválida.",
      });
    }

    // Evita requisições com uma quantidade absurda de produtos
    if (products.length > 100) {
      return res.status(400).json({
        error: "A análise pode conter no máximo 100 produtos.",
      });
    }

    // Valida os produtos recebidos
    for (const product of products) {
      if (!product || typeof product !== "object") {
        return res.status(400).json({
          error: "Um ou mais produtos possuem formato inválido.",
        });
      }

      if (
        typeof product.name !== "string" ||
        product.name.trim().length === 0
      ) {
        return res.status(400).json({
          error: "Todo produto precisa possuir um nome válido.",
        });
      }
    }

    const prompt = `
Você é um assistente especializado em gestão de estoque.

Analise os produtos abaixo:

${JSON.stringify(products, null, 2)}

Identifique:

- produtos com estoque baixo;
- produtos que precisam de reposição;
- produtos com maior quantidade;
- prioridades;
- recomendações para o gestor.

Responda em português do Brasil.

Seja objetivo e organize a resposta de forma clara.
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen2.5:3b",
          prompt,
          stream: false,
        }),
      },
    );

    // Verifica se o Ollama respondeu corretamente
    if (!response.ok) {
      const errorText = await response.text();

      console.error("ERRO DO OLLAMA:", errorText);

      return res.status(502).json({
        error: "Erro ao se comunicar com o Ollama.",
      });
    }

    const data = await response.json();

    return res.json({
      analysis: data.response,
    });
  } catch (error) {
    console.error("ERRO INTERNO DA API:", error);

    return res.status(500).json({
      error: "Não foi possível analisar o estoque.",
    });
  }
});

// =========================
// Inicialização do servidor
// =========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});