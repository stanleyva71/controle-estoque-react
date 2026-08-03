import { useState } from "react";
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
  // 1. Estado da busca
  const [search, setSearch] = useState("");

  // 2. Estado da categoria selecionada
  const [selectedCategory, setSelectedCategory] = useState("");

  const [sortOption, setSortOption] = useState("name");

  const [showLowStock, setShowLowStock] = useState(false);

  // 3. Lista das categorias sem repetição
  const categories = [...new Set(products.map((product) => product.category))];

  // 4. Produtos filtrados
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
    <section className="mt-6">
      <h2 className="text-2xl font-bold mb-5">Produtos cadastrados</h2>
      <input
        type="text"
        placeholder="Buscar por nome ou categoria..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        className="
        w-full
        bg-white
        border
        rounded-lg
        p-3
        mb-5
        outline-none
        focus:ring-2
        focus:ring-blue-500
    "
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <select
          value={selectedCategory}
          onChange={(event) => {
            setSelectedCategory(event.target.value);
          }}
          className="
      w-full
      bg-white
      border
      rounded-lg
      p-3
      outline-none
      focus:ring-2
      focus:ring-blue-500
    "
        >
          <option value="">Todas as categorias</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(event) => {
            setSortOption(event.target.value);
          }}
          className="
      w-full
      bg-white
      border
      rounded-lg
      p-3
      outline-none
      focus:ring-2
      focus:ring-blue-500
    "
        >
          <option value="name">Nome: A → Z</option>

          <option value="quantity-low">Menor quantidade</option>

          <option value="quantity-high">Maior quantidade</option>

          <option value="price-low">Menor preço</option>

          <option value="price-high">Maior preço</option>
        </select>
      </div>
      <label className="flex items-center gap-2 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={showLowStock}
          onChange={(event) => {
            setShowLowStock(event.target.checked);
          }}
          className="w-4 h-4"
        />

        <span className="font-medium">
          Mostrar somente produtos com estoque baixo
        </span>
      </label>
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-500">
            {products.length === 0
              ? "Nenhum produto cadastrado."
              : "Nenhum produto encontrado."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white shadow-md rounded-xl p-5">
              <h3 className="text-xl font-bold">{product.name}</h3>

              <p className="text-gray-600 mt-2">
                Categoria: {product.category}
              </p>

              <p className="text-gray-600">Quantidade: {product.quantity}</p>
              {product.quantity <= 5 ? (
                <p className="text-red-600 font-bold mt-2">⚠️ Estoque baixo</p>
              ) : (
                <p className="text-green-600 font-bold mt-2">
                  ✅ Estoque normal
                </p>
              )}

              <p className="text-gray-600 mb-4">
                Preço:
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price)}
              </p>

              <button
                onClick={() => editProduct(product)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    `Deseja realmente excluir o produto "${product.name}"?`,
                  );

                  if (confirmed) {
                    deleteProduct(product.id);
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
