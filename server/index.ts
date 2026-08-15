import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

app.post("/api/analisar-estoque", (req, res) => {
  const { products } = req.body;

  console.log("Produtos recebidos:", products);

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({
      error: "Lista de produtos inválida.",
    });
  }

  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5,
  );

  return res.json({
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});