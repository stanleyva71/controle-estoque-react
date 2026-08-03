import { useState } from "react";
import type { Product } from "../types/Product";

interface ProductFormProps {
  addProduct: (product: Product) => void;

  editingProduct: Product | null;

  updateProduct: (product: Product) => void;

  setEditingProduct: (product: Product | null) => void;
}

function ProductForm({
  addProduct,

  editingProduct,

  updateProduct,

  setEditingProduct,
}: ProductFormProps) {
  const [name, setName] = useState(editingProduct ? editingProduct.name : "");

  const [category, setCategory] = useState(
    editingProduct ? editingProduct.category : "",
  );

  const [quantity, setQuantity] = useState(
    editingProduct ? editingProduct.quantity : 0,
  );

  const [price, setPrice] = useState(editingProduct ? editingProduct.price : 0);

  const [error, setError] = useState("");

  function clearForm() {
    setName("");
    setCategory("");
    setQuantity(0);
    setPrice(0);
    setError("");

    setEditingProduct(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim() === "") {
      setError("Digite o nome do produto.");
      return;
    }

    if (category.trim() === "") {
      setError("Digite a categoria do produto.");
      return;
    }

    if (quantity < 0) {
      setError("A quantidade não pode ser negativa.");
      return;
    }

    if (price < 0) {
      setError("O preço não pode ser negativo.");
      return;
    }

    setError("");

    const product = {
      id: editingProduct ? editingProduct.id : Date.now(),

      name,
      category,
      quantity,
      price,
    };

    if (editingProduct) {
      updateProduct(product);

      setEditingProduct(null);
    } else {
      addProduct(product);
    }

    clearForm();
  }
  return (
    <section className="bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-5">
        {editingProduct ? "Editar Produto" : "Cadastro de Produto"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-3">
            {error}
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium">Nome do produto</label>

          <input
            type="text"
            placeholder="Ex: Mouse Logitech"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                    "
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Categoria</label>

          <input
            type="text"
            placeholder="Ex: Periférico"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                    "
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Quantidade</label>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="
                            w-full
                            border
                            rounded-lg
                            p-3
                        "
              min="0"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Preço</label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="
                            w-full
                            border
                            rounded-lg
                            p-3
                        "
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="
      bg-blue-600
      text-white
      px-6
      py-3
      rounded-lg
      hover:bg-blue-700
      transition
      font-medium
    "
          >
            {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
              }}
              className="
        bg-gray-300
        text-gray-800
        px-6
        py-3
        rounded-lg
        hover:bg-gray-400
        transition
        font-medium
      "
            >
              Cancelar
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={clearForm}
          className="
    bg-gray-500
    text-white
    px-6
    py-3
    rounded-lg
    hover:bg-gray-600
    transition
    font-medium
    ml-3
  "
        >
          Limpar
        </button>
      </form>
    </section>
  );
}

export default ProductForm;
