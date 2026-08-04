import { useState } from "react";
import { PackagePlus, Save, RotateCcw, X } from "lucide-react";

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

  const [image, setImage] = useState(
  editingProduct ? editingProduct.image ?? "" : "",
);

  const [error, setError] = useState("");

  function clearForm() {
    setName("");
    setCategory("");
    setQuantity(0);
    setPrice(0);
    setImage("");
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

    const product: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),

      name,
      category,
      quantity,
      price,
      image,
    };

    if (editingProduct) {
      updateProduct(product);
    } else {
      addProduct(product);
    }

    clearForm();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <PackagePlus size={23} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {editingProduct ? "Editar Produto" : "Adicionar Produto"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {editingProduct
              ? "Atualize as informações do produto"
              : "Preencha os dados para cadastrar"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mensagem de erro */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Imagem */}
        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Imagem do produto
          </label>

          <input
            id="image"
            type="text"
            placeholder="Cole a URL da imagem"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            className="
      w-full
      rounded-xl
      border
      border-slate-300
      bg-slate-50
      px-4
      py-3
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

        {/* Nome */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Nome do produto
          </label>

          <input
            id="name"
            type="text"
            placeholder="Ex: Mouse Logitech"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              px-4
              py-3
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

        {/* Categoria */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Categoria
          </label>

          <input
            id="category"
            type="text"
            placeholder="Ex: Periféricos"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              px-4
              py-3
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

        {/* Quantidade */}
        <div>
          <label
            htmlFor="quantity"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Quantidade
          </label>

          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            min="0"
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              px-4
              py-3
              text-slate-800
              outline-none
              transition
              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          />
        </div>

        {/* Preço */}
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Preço unitário
          </label>

          <input
            id="price"
            type="number"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            min="0"
            step="0.01"
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              px-4
              py-3
              text-slate-800
              outline-none
              transition
              focus:border-blue-500
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          />
        </div>

        {/* Botão principal */}
        <button
          type="submit"
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3.5
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
            hover:shadow-md
            active:scale-[0.98]
          "
        >
          <Save size={20} />

          {editingProduct ? "Salvar alterações" : "Adicionar produto"}
        </button>

        {/* Cancelar edição */}
        {editingProduct && (
          <button
            type="button"
            onClick={clearForm}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-5
              py-3
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
              active:scale-[0.98]
            "
          >
            <X size={19} />
            Cancelar edição
          </button>
        )}

        {/* Limpar */}
        {!editingProduct && (
          <button
            type="button"
            onClick={clearForm}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-800
              px-5
              py-3
              font-semibold
              text-white
              transition
              hover:bg-slate-900
              active:scale-[0.98]
            "
          >
            <RotateCcw size={19} />
            Limpar campos
          </button>
        )}
      </form>
    </section>
  );
}

export default ProductForm;
