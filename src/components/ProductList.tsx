import { useState } from "react";
import DeleteModal from "./DeleteModal";

import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Pencil,
  Trash2,
  PackageSearch,
} from "lucide-react";

import type { Product } from "../types/Product";

interface ProductListProps {
  products: Product[];

  deleteProduct: (id: number) => void;

  editProduct: (product: Product) => void;
}

function ProductList({
  products,
  deleteProduct,
  editProduct,
}: ProductListProps) {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [sortOption, setSortOption] = useState("name");

  const [showLowStock, setShowLowStock] = useState(false);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;

    const matchesLowStock = !showLowStock || product.quantity <= 5;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sortOption === "quantity-low") {
      return a.quantity - b.quantity;
    }

    if (sortOption === "quantity-high") {
      return b.quantity - a.quantity;
    }

    if (sortOption === "price-low") {
      return a.price - b.price;
    }

    if (sortOption === "price-high") {
      return b.price - a.price;
    }

    return 0;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Produtos em Estoque
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {products.length}{" "}
            {products.length === 1
              ? "produto cadastrado"
              : "produtos cadastrados"}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {filteredProducts.length} encontrados
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          className="
            w-full
            rounded-xl
            border
            border-slate-300
            bg-slate-50
            py-3
            pl-12
            pr-4
            text-slate-800
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-500
            focus:bg-white
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </div>

      {/* Filtros */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="relative">
          <Filter
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value);
            }}
            className="
              w-full
              appearance-none
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              py-3
              pl-11
              pr-4
              text-slate-700
              outline-none
              transition
              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <option value="">Todas as categorias</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <ArrowUpDown
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={sortOption}
            onChange={(event) => {
              setSortOption(event.target.value);
            }}
            className="
              w-full
              appearance-none
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              py-3
              pl-11
              pr-4
              text-slate-700
              outline-none
              transition
              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <option value="name">Nome: A → Z</option>

            <option value="quantity-low">Menor quantidade</option>

            <option value="quantity-high">Maior quantidade</option>

            <option value="price-low">Menor preço</option>

            <option value="price-high">Maior preço</option>
          </select>
        </div>
      </div>

      {/* Estoque baixo */}
      <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <input
          type="checkbox"
          checked={showLowStock}
          onChange={(event) => {
            setShowLowStock(event.target.checked);
          }}
          className="
            h-5
            w-5
            cursor-pointer
            accent-blue-600
          "
        />

        <AlertTriangle size={20} className="text-amber-500" />

        <span className="text-sm font-medium text-slate-700">
          Mostrar somente produtos com estoque baixo
        </span>
      </label>

      {/* Nenhum produto */}
      {sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <PackageSearch size={30} />
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            {products.length === 0
              ? "Nenhum produto cadastrado"
              : "Nenhum produto encontrado"}
          </h3>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {products.length === 0
              ? "Cadastre seu primeiro produto usando o formulário ao lado."
              : "Tente alterar a busca ou os filtros selecionados."}
          </p>
        </div>
      ) : (
        /* Tabela */
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Produto
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Categoria
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Quantidade
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preço
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedProducts.map((product) => {
                const lowStock = product.quantity <= 5;

                return (
                  <tr
                    key={product.id}
                    className="
    border-b
    border-slate-100
    transition
    duration-150
    hover:bg-blue-50/40
  "
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="
      h-10
      w-10
      rounded-lg
      object-cover
      border
      border-slate-200
    "
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-800">
                            {product.name}
                          </p>

                          {lowStock && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                              <AlertTriangle size={13} />
                              Estoque baixo
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          lowStock
                            ? "font-bold text-red-600"
                            : "font-semibold text-green-600"
                        }
                      >
                        {product.quantity}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            editProduct(product);
                          }}
                          className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-50
                              text-blue-600
                              transition
                              hover:bg-blue-100
                            "
                          aria-label={`Editar ${product.name}`}
                          title="Editar produto"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProductToDelete(product);
                          }}
                          className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-lg
                              bg-red-50
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                          aria-label={`Excluir ${product.name}`}
                          title="Excluir produto"
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
      )}

      {productToDelete && (
        <DeleteModal
          productName={productToDelete.name}
          onCancel={() => {
            setProductToDelete(null);
          }}
          onConfirm={() => {
            deleteProduct(productToDelete.id);

            setProductToDelete(null);
          }}
        />
      )}
    </section>
  );
}

export default ProductList;
