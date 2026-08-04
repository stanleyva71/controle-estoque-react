import {
  Box,
  ChartNoAxesCombined,
  Package,
  Plus,
  Tags,
  FileText,
  Settings,
  User,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-700 bg-slate-950 text-white">
      
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <Box size={24} />
        </div>

        <h1 className="text-2xl font-bold">
          Estoque Fácil
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 px-4 py-6">

        <button className="flex w-full items-center gap-4 rounded-xl bg-blue-600 px-5 py-4 text-left font-medium shadow-lg">
          <ChartNoAxesCombined size={22} />
          Dashboard
        </button>

        <button className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <Package size={22} />
          Produtos
        </button>

        <button className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <Plus size={22} />
          Novo Produto
        </button>

        <button className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <Tags size={22} />
          Categorias
        </button>

        <button className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <FileText size={22} />
          Relatórios
        </button>

        <button className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <Settings size={22} />
          Configurações
        </button>

      </nav>

      {/* Usuário */}
      <div className="m-4 flex items-center gap-3 rounded-xl border border-slate-700 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700">
          <User size={22} />
        </div>

        <div>
          <p className="font-medium">
            Stanley Vale
          </p>

          <p className="text-sm text-slate-400">
            Administrador
          </p>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;