import {
  Box,
  ChartNoAxesCombined,
  Package,
  Plus,
  Tags,
  FileText,
  Settings,
  User,
  Users,
} from 'lucide-react';
import type { AuthUser } from '../utils/auth';

interface SidebarProps {
  user: AuthUser | null;

  activePage:
    | 'dashboard'
    | 'products'
    | 'newProduct'
    | 'history'
    | 'categories'
    | 'users'
    | 'settings';

  onDashboard: () => void;
  onProducts: () => void;
  onCategories: () => void;
  onNewProduct: () => void;
  onHistory: () => void;
  onUsers: () => void;
  onSettings: () => void;
}

function Sidebar({
  user,
  activePage,
  onDashboard,
  onProducts,
  onNewProduct,
  onCategories,
  onHistory,
  onUsers,
  onSettings,
}: SidebarProps) {
  function getButtonClass(
    page:
      | 'dashboard'
      | 'products'
      | 'newProduct'
      | 'history'
      | 'categories'
      | 'users'
      | 'settings'
  ) {
    return `flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left font-medium transition ${
      activePage === page
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;
  }

  return (
    <aside className="flex w-full flex-col bg-slate-950 text-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0 lg:border-r lg:border-slate-800">
      {/* Logo */}

      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <Box size={24} />
        </div>

        <h1 className="text-2xl font-bold">Estoque</h1>
      </div>

      {/* Menu */}

      <nav className="flex-1 space-y-2 px-4 py-6">
        {/* Dashboard */}

        <button
          type="button"
          onClick={onDashboard}
          className={getButtonClass('dashboard')}
        >
          <ChartNoAxesCombined size={22} />
          Dashboard
        </button>

        {/* Produtos */}

        <button
          type="button"
          onClick={onProducts}
          className={getButtonClass('products')}
        >
          <Package size={22} />
          Produtos
        </button>

        {/* Novo Produto */}

        <button
          type="button"
          onClick={onNewProduct}
          className={getButtonClass('newProduct')}
        >
          <Plus size={22} />
          Novo Produto
        </button>

        {/* Categorias */}

        <button
          type="button"
          onClick={onCategories}
          className={getButtonClass('categories')}
        >
          <Tags size={22} />
          Categorias
        </button>

        {/* Histórico */}

        <button
          type="button"
          onClick={onHistory}
          className={getButtonClass('history')}
        >
          <FileText size={22} />
          Histórico de Movimentações
        </button>

        {/* Usuários - somente ADMIN */}

        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={onUsers}
            className={getButtonClass('users')}
          >
            <Users size={22} />
            Usuários
          </button>
        )}

        {/* Configurações */}

        <button
          type="button"
          onClick={onSettings}
          className={getButtonClass('settings')}
        >
          <Settings size={21} />
          <span>Configurações</span>
        </button>
      </nav>

      {/* Usuário */}

      <div className="m-4 flex items-center gap-3 rounded-xl border border-slate-700 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700">
          <User size={22} />
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium">{user?.name || 'Usuário'}</p>

          <p className="truncate text-sm text-slate-400">
            {user?.role === 'ADMIN'
              ? 'Administrador'
              : user?.role === 'OPERADOR'
                ? 'Operador'
                : 'Visualização'}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
