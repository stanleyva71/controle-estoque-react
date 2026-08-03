import type { Product } from "../types/Product";

interface DashboardProps {
  products: Product[];
}

function Dashboard({ products }: DashboardProps) {
  const totalProducts = products.length;

  const totalValue = products.reduce((total, product) => {
    return total + product.quantity * product.price;
  }, 0);

  const lowStockProducts = products.filter((product) => {
    return product.quantity <= 5;
  });

  const lowStockCount = lowStockProducts.length;

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-5">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white shadow-md rounded-xl p-5">
          <h3 className="text-gray-500">Produtos cadastrados</h3>

          <p className="text-4xl font-bold mt-2">{totalProducts}</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5">
          <h3 className="text-gray-500">Valor em estoque</h3>

          <p className="text-4xl font-bold mt-2">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalValue)}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5">
          <h3 className="text-gray-500">Produtos com estoque baixo</h3>

          <p className="text-4xl font-bold text-red-600 mt-2">
            ⚠️ {lowStockCount}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
