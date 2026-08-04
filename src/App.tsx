import { useEffect, useState } from "react";

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

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "products",
      JSON.stringify(products)
    );
  }, [products]);

  function addProduct(product: Product) {
    setProducts([...products, product]);
  }

  function deleteProduct(id: number) {
    const newProducts = products.filter(
      (product) => product.id !== id
    );

    setProducts(newProducts);
  }

  function editProduct(product: Product) {
    setEditingProduct(product);
  }

  function updateProduct(
    updatedProduct: Product
  ) {
    const updatedProducts = products.map(
      (product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
    );

    setProducts(updatedProducts);

    setEditingProduct(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">

  <Sidebar />

  <div className="min-w-0 flex-1">

    <Header />

    <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">

      <Dashboard products={products} />

      <div
        className="
          mt-8
          grid
          grid-cols-1
          items-start
          gap-8
          2xl:grid-cols-[380px_minmax(0,1fr)]
        "
      >

        <ProductForm
          key={editingProduct?.id ?? "new"}
          addProduct={addProduct}
          editingProduct={editingProduct}
          updateProduct={updateProduct}
          setEditingProduct={setEditingProduct}
        />

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