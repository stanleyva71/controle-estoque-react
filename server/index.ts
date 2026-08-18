import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

app.post("/api/analisar-estoque", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Lista de produtos inválida.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `
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
      `,
    });

    res.json({
      analysis: response.output_text,
    });
  } catch (error) {
    console.error("ERRO COMPLETO DA OPENAI:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
