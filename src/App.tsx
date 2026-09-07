import { useEffect, useState } from 'react';

import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StockHistory from './pages/StockHistory';
import Products from './pages/Products';
import Categories from './components/Categories';

import type { Product } from './types/Product';

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }

    return [];
  });

  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'products' | 'history' | 'categories'
  >('dashboard');

  const [toastMessage, setToastMessage] = useState('');

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [focusProductForm, setFocusProductForm] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      'products',
      JSON.stringify(products)
    );
  }, [products]);

  function addProduct(product: Product) {
    setProducts([...products, product]);

    setToastMessage(
      `"${product.name}" foi adicionado com sucesso!`
    );
  }

  function deleteProduct(id: number) {
    const productToDelete = products.find(
      (product) => product.id === id
    );

    const newProducts = products.filter(
      (product) => product.id !== id
    );

    setProducts(newProducts);

    if (productToDelete) {
      setToastMessage(
        `"${productToDelete.name}" foi excluído com sucesso!`
      );
    }
  }

  function editProduct(product: Product) {
    setEditingProduct(product);

    setCurrentPage('products');
    setFocusProductForm(true);
  }

  function updateProduct(updatedProduct: Product) {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id
        ? updatedProduct
        : product
    );

    setProducts(updatedProducts);
    setEditingProduct(null);

    setToastMessage(
      `"${updatedProduct.name}" foi atualizado com sucesso!`
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      <Sidebar
        onDashboard={() => {
          setFocusProductForm(false);
          setEditingProduct(null);
          setCurrentPage('dashboard');
        }}

        onProducts={() => {
          setFocusProductForm(false);
          setCurrentPage('products');
        }}

        onNewProduct={() => {
          setEditingProduct(null);
          setFocusProductForm(true);
          setCurrentPage('products');
        }}

        onCategories={() => {
          setFocusProductForm(false);
          setCurrentPage('categories');
        }}

        onHistory={() => {
          setFocusProductForm(false);
          setCurrentPage('history');
        }}
      />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {currentPage === 'dashboard' && (
            <Dashboard products={products} />
          )}

          {currentPage === 'products' && (
            <Products
              products={products}
              addProduct={addProduct}
              editingProduct={editingProduct}
              updateProduct={updateProduct}
              setEditingProduct={setEditingProduct}
              deleteProduct={deleteProduct}
              editProduct={editProduct}
              shouldFocusForm={focusProductForm}
            />
          )}

          {currentPage === 'history' && (
            <StockHistory />
          )}

          {currentPage === 'categories' && (
            <Categories
              products={products}
              updateProducts={setProducts}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;