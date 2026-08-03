import { useState, useEffect } from "react";

import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";

import type { Product } from "./types/Product";

function App() {
  const [products, setProducts] = useState<Product[]>(() => {

    const savedProducts = localStorage.getItem("products");

    if(savedProducts){
        return JSON.parse(savedProducts);
    }

    return [];

});


const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  function addProduct(product: Product) {
    setProducts([...products, product]);
  }
  function deleteProduct(id: number) {
    const newProducts = products.filter((product) => product.id !== id);

    setProducts(newProducts);
  }
  function editProduct(product: Product) {

    setEditingProduct(product);

}
  function updateProduct(updatedProduct: Product){

    const updatedProducts = products.map(product =>

        product.id === updatedProduct.id
        ? updatedProduct
        : product

    );

    setProducts(updatedProducts);

    setEditingProduct(null);

}

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto">
        <Dashboard products={products} />

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
      </main>
    </>
  );
}

export default App;
