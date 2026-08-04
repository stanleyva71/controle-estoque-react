import { Package, TriangleAlert, Tags, DollarSign } from "lucide-react";

import type { Product } from "../types/Product";

interface DashboardProps {
  products: Product[];
}

function Dashboard({ products }: DashboardProps) {
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.quantity <= 5,
  ).length;

  const totalCategories = new Set(products.map((product) => product.category))
    .size;

  const totalStockValue = products.reduce(
    (total, product) => total + product.quantity * product.price,
    0,
  );

  return (
    <section>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total de produtos */}
        <div
          className="
    flex
    items-center
    gap-5
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-6
    shadow-sm
    transition
    duration-200
    hover:-translate-y-1
    hover:shadow-md
  "
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Package size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Total de Produtos
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {totalProducts}
            </p>

            <p className="mt-1 text-sm text-slate-400">Produtos cadastrados</p>
          </div>
        </div>

        {/* Estoque baixo */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition
    duration-200
    hover:-translate-y-1
    hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
            <TriangleAlert size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {lowStockProducts}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Produtos com pouco estoque
            </p>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition
    duration-200
    hover:-translate-y-1
    hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Tags size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Categorias</p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {totalCategories}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Categorias cadastradas
            </p>
          </div>
        </div>

        {/* Valor total */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition
    duration-200
    hover:-translate-y-1
    hover:shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <DollarSign size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Valor Total em Estoque
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {totalStockValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Valor total dos produtos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
