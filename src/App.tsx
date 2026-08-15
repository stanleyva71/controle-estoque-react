import Toast from "./components/Toast";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";

import type { Product } from "./types/Product";

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("products");

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }

    return [];
  });

  const formRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  function addProduct(product: Product) {
    setProducts([...products, product]);

    setToastMessage(`"${product.name}" foi adicionado com sucesso!`);
  }

  function deleteProduct(id: number) {
    const productToDelete = products.find((product) => product.id === id);

    const newProducts = products.filter((product) => product.id !== id);

    setProducts(newProducts);

    if (productToDelete) {
      setToastMessage(`"${productToDelete.name}" foi excluído com sucesso!`);
    }
  }

  function editProduct(product: Product) {
    setEditingProduct(product);
  }

  function updateProduct(updatedProduct: Product) {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product,
    );

    setProducts(updatedProducts);

    setEditingProduct(null);

    setToastMessage(`"${updatedProduct.name}" foi atualizado com sucesso!`);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      const nameInput = document.getElementById("name");

      nameInput?.focus();
    }, 500);
  }

  async function analyzeStock() {
  try {
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

    console.log("Status da API:", response.status);

    const data = await response.json();

    console.log("Resposta da API:", data);

    if (!response.ok) {
      throw new Error(data.error || "Erro na API");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao analisar estoque:", error.message);
    } else {
      console.error("Erro desconhecido:", error);
    }
  }
}

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
      <Sidebar onNewProduct={scrollToForm} />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Dashboard products={products} />

          <button type="button" onClick={analyzeStock} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            🤖 Analisar estoque
          </button>

          <div className="mt-8 grid grid-cols-1 items-start gap-8 2xl:grid-cols-[380px_minmax(0,1fr)]">
            <div ref={formRef}>
              <ProductForm
                key={editingProduct?.id ?? "new"}
                addProduct={addProduct}
                editingProduct={editingProduct}
                updateProduct={updateProduct}
                setEditingProduct={setEditingProduct}
              />
            </div>

            <ProductList
              products={products}
              deleteProduct={deleteProduct}
              editProduct={editProduct}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;