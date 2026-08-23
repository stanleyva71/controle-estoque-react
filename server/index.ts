import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Teste da API
app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

// Análise de estoque com Ollama
app.post("/api/analisar-estoque", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Lista de produtos inválida.",
      });
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

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ERRO DO OLLAMA:", errorText);

      return res.status(500).json({
        error: "Erro ao se comunicar com o Ollama.",
      });
    }

    const data = await response.json();

    res.json({
      analysis: data.response,
    });
  } catch (error) {
    console.error("ERRO COMPLETO DO OLLAMA:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});