import { useEffect, useState, useRef } from "react";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import StockHistory from "./pages/StockHistory";

import type { Product } from "./types/Product";

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("products");

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }

    return [];
  });

  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "history"
  >("dashboard");

  const formRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  function addProduct(product: Product) {
    setProducts([...products, product]);

    setToastMessage(`"${product.name}" foi adicionado com sucesso!`);
  }

  function deleteProduct(id: number) {
    const productToDelete = products.find(
      (product) => product.id === id,
    );

    const newProducts = products.filter(
      (product) => product.id !== id,
    );

    setProducts(newProducts);

    if (productToDelete) {
      setToastMessage(
        `"${productToDelete.name}" foi excluído com sucesso!`,
      );
    }
  }

  function editProduct(product: Product) {
    setEditingProduct(product);
  }

  function updateProduct(updatedProduct: Product) {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id
        ? updatedProduct
        : product,
    );

    setProducts(updatedProducts);
    setEditingProduct(null);

    setToastMessage(
      `"${updatedProduct.name}" foi atualizado com sucesso!`,
    );
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

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      )}

      <Sidebar
        onNewProduct={() => {
          setCurrentPage("dashboard");

          setTimeout(scrollToForm, 0);
        }}
        onHistory={() => setCurrentPage("history")}
      />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {currentPage === "dashboard" ? (
            <>
              <Dashboard products={products} />

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
            </>
          ) : (
            <StockHistory />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;