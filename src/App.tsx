import { useEffect, useState } from 'react';

import Users from './pages/Users';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StockHistory from './pages/StockHistory';
import Products from './pages/Products';
import Categories from './components/Categories';
import Login from './pages/Login';
import Settings from './pages/Settings';

import {
  login,
  logout,
  getUser,
  isAuthenticated,
  apiFetch,
  type AuthUser,
} from './utils/auth';

import type { Product } from './types/Product';

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'products' | 'history' | 'categories' | 'users' | 'settings'
  >('dashboard');

  const [toastMessage, setToastMessage] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [focusProductForm, setFocusProductForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const [user, setUser] = useState<AuthUser | null>(getUser());

  useEffect(() => {
    function handleAuthLogout() {
      setUser(null);
      setAuthenticated(false);
    }

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // =========================
  // Carregar produtos do banco
  // =========================

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        setLoading(true);

        const response = await apiFetch('/products');

        if (!response.ok) {
          throw new Error('Não foi possível carregar os produtos.');
        }

        const data: Product[] = await response.json();

        setProducts(data);
      } catch (error) {
        console.error('ERRO AO CARREGAR PRODUTOS:', error);

        setToastMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os produtos do banco de dados.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [authenticated]);

  // =========================
  // Autenticação
  // =========================

  async function handleLogin(email: string, password: string) {
    const data = await login(email, password);

    setUser(data.user);
    setAuthenticated(true);
  }

  function handleLogout() {
    logout();

    setUser(null);
    setAuthenticated(false);
  }

  // =========================
  // Criar produto
  // =========================

  async function addProduct(product: Product) {
    try {
      const response = await apiFetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          price: product.price,
          image: product.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível criar o produto.');
      }

      setProducts((currentProducts) => [data, ...currentProducts]);

      setToastMessage(`"${data.name}" foi adicionado com sucesso!`);
    } catch (error) {
      console.error('ERRO AO CRIAR PRODUTO:', error);

      setToastMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o produto.'
      );
    }
  }

  // =========================
  // Excluir produto
  // =========================

  async function deleteProduct(id: number): Promise<void> {
    const productToDelete = products.find((product) => product.id === id);

    try {
      const response = await apiFetch(`/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível excluir o produto.');
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );

      if (productToDelete) {
        setToastMessage(`"${productToDelete.name}" foi excluído com sucesso!`);
      }
    } catch (error) {
      console.error('ERRO AO EXCLUIR PRODUTO:', error);

      setToastMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o produto.'
      );

      throw error;
    }
  }

  // =========================
  // Editar produto
  // =========================

  function editProduct(product: Product) {
    setEditingProduct(product);

    setCurrentPage('products');

    setFocusProductForm(true);
  }

  // =========================
  // Atualizar produto
  // =========================

  async function updateProduct(updatedProduct: Product) {
    try {
      const response = await apiFetch(`/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedProduct.name,
          category: updatedProduct.category,
          quantity: updatedProduct.quantity,
          price: updatedProduct.price,
          image: updatedProduct.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível atualizar o produto.');
      }

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === data.id ? data : product
        )
      );

      setEditingProduct(null);

      setToastMessage(`"${data.name}" foi atualizado com sucesso!`);
    } catch (error) {
      console.error('ERRO AO ATUALIZAR PRODUTO:', error);

      setToastMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o produto.'
      );
    }
  }
  function handleUserUpdated(updatedUser: AuthUser) {
    setUser(updatedUser);
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <Sidebar
        user={user}
        activePage={focusProductForm ? 'newProduct' : currentPage}
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
        onUsers={() => {
          setFocusProductForm(false);
          setEditingProduct(null);
          setCurrentPage('users');
        }}
        onSettings={() => {
          setFocusProductForm(false);
          setEditingProduct(null);
          setCurrentPage('settings');
        }}
      />

      <div className="min-w-0 flex-1">
        <Header
          user={user}
          onLogout={handleLogout}
          onNotificationProduct={editProduct}
          products={products}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-slate-500">Carregando produtos...</p>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  products={products}
                  onEditProduct={editProduct}
                  onNewProduct={() => {
                    setEditingProduct(null);
                    setFocusProductForm(true);
                    setCurrentPage('products');
                  }}
                  onProducts={() => {
                    setFocusProductForm(false);
                    setEditingProduct(null);
                    setCurrentPage('products');
                  }}
                  onHistory={() => {
                    setFocusProductForm(false);
                    setCurrentPage('history');
                  }}
                  onCategories={() => {
                    setFocusProductForm(false);
                    setCurrentPage('categories');
                  }}
                />
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
                  user={user}
                />
              )}

              {currentPage === 'history' && <StockHistory />}

              {currentPage === 'categories' && (
                <Categories
                  products={products}
                  updateProducts={setProducts}
                  user={user}
                />
              )}

              {currentPage === 'users' && user?.role === 'ADMIN' && (
                <Users
                  onToast={setToastMessage}
                  onUserUpdated={handleUserUpdated}
                />
              )}

              {currentPage === 'settings' && <Settings user={user} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
