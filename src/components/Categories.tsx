import { useEffect, useState } from 'react';

import {
  FolderTree,
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  Save,
} from 'lucide-react';

import type { Category } from '../types/Category.ts';
import type { Product } from '../types/Product';

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../utils/categories.ts';

interface CategoriesProps {
  products: Product[];
}

function Categories({ products }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');

  const [categoryName, setCategoryName] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  function loadCategories() {
    setCategories(getCategories());
  }

  useEffect(() => {
    loadCategories();

    const handleCategoriesUpdated = () => {
      loadCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
    };
  }, []);

  function openCreateForm() {
    setEditingCategory(null);
    setCategoryName('');
    setError('');
    setShowForm(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setEditingCategory(null);
    setCategoryName('');
    setError('');
    setShowForm(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError('Digite o nome da categoria.');
      return;
    }

    const success = editingCategory
      ? updateCategory(editingCategory.id, trimmedName)
      : addCategory(trimmedName);

    if (!success) {
      setError('Já existe uma categoria com esse nome.');
      return;
    }

    closeForm();
  }

  function handleDelete(category: Category) {
    const productsUsingCategory = products.filter(
      (product) =>
        product.category.toLowerCase() === category.name.toLowerCase()
    );

    if (productsUsingCategory.length > 0) {
      alert(
        `Não é possível excluir "${category.name}" porque existem ${productsUsingCategory.length} produto(s) associados a essa categoria.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente excluir a categoria "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    deleteCategory(category.id);
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  function getProductCount(categoryName: string) {
    return products.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    ).length;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FolderTree size={23} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">Categorias</h2>

            <p className="mt-1 text-sm text-slate-500">
              Organize os produtos do seu estoque.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Nova categoria
        </button>
      </div>

      {/* Resumo */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Categorias
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Produtos cadastrados
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {products.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sem produtos
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-700">
            {
              categories.filter(
                (category) => getProductCount(category.name) === 0
              ).length
            }
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-5">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Buscar categoria..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">
                {editingCategory ? 'Editar categoria' : 'Nova categoria'}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Defina um nome para a categoria.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 transition hover:bg-slate-100"
              aria-label="Fechar formulário"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              placeholder="Ex: Periféricos"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              autoFocus
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Save size={18} />

              {editingCategory ? 'Salvar' : 'Criar'}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Lista */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <FolderTree size={30} />
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            {categories.length === 0
              ? 'Nenhuma categoria cadastrada'
              : 'Nenhuma categoria encontrada'}
          </h3>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {categories.length === 0
              ? 'Crie sua primeira categoria para começar a organizar os produtos.'
              : 'Tente utilizar outro termo na busca.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Categoria
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Produtos
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Criada em
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => {
                  const productCount = getProductCount(category.name);

                  return (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <FolderTree size={18} />
                          </div>

                          <span className="font-semibold text-slate-800">
                            {category.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                          <Package size={15} />
                          {productCount}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Intl.DateTimeFormat('pt-BR', {
                          dateStyle: 'short',
                        }).format(new Date(category.createdAt))}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            title="Editar categoria"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Excluir categoria"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categories;