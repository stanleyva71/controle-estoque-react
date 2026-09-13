import { useEffect, useRef } from 'react';

import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

import type { Product } from '../types/Product';
import type { AuthUser } from '../utils/auth';

interface ProductsProps {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  editingProduct: Product | null;
  updateProduct: (product: Product) => Promise<void>;
  setEditingProduct: (product: Product | null) => void;
  deleteProduct: (id: number) => Promise<void>;
  editProduct: (product: Product) => void;
  shouldFocusForm?: boolean;
  user: AuthUser | null;
}

function Products({
  products,
  addProduct,
  editingProduct,
  updateProduct,
  setEditingProduct,
  deleteProduct,
  editProduct,
  shouldFocusForm = false,
  user,
}: ProductsProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const canEdit =
    user?.role === 'ADMIN' ||
    user?.role === 'OPERADOR';

  const canDelete =
    user?.role === 'ADMIN';

  useEffect(() => {
    if (!shouldFocusForm || !canEdit) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      document.getElementById('name')?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldFocusForm, canEdit]);

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Produtos
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {canEdit
            ? 'Cadastre e gerencie os produtos do seu estoque.'
            : 'Consulte os produtos cadastrados no estoque.'}
        </p>
      </div>

      <div
        className={
          canEdit
            ? 'grid grid-cols-1 items-start gap-8 2xl:grid-cols-[380px_minmax(0,1fr)]'
            : 'grid grid-cols-1'
        }
      >
        {canEdit && (
          <div ref={formRef}>
            <ProductForm
              key={editingProduct?.id ?? 'new'}
              addProduct={addProduct}
              editingProduct={editingProduct}
              updateProduct={updateProduct}
              setEditingProduct={setEditingProduct}
            />
          </div>
        )}

        <ProductList
          products={products}
          deleteProduct={deleteProduct}
          editProduct={editProduct}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </section>
  );
}

export default Products;