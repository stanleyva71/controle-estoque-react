import { useEffect, useRef } from 'react';

import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

import type { Product } from '../types/Product';

interface ProductsProps {
  products: Product[];

  addProduct: (product: Product) => Promise<void>;

  editingProduct: Product | null;

  updateProduct: (product: Product) => Promise<void>;

  setEditingProduct: (product: Product | null) => void;

  deleteProduct: (id: number) => Promise<void>;

  editProduct: (product: Product) => void;

  shouldFocusForm?: boolean;
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
}: ProductsProps) {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldFocusForm) {
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
  }, [shouldFocusForm]);

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Produtos
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Cadastre e gerencie os produtos do seu estoque.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <div ref={formRef}>
          <ProductForm
            key={editingProduct?.id ?? 'new'}
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
    </section>
  );
}

export default Products;