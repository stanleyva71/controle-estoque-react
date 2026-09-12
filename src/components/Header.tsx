import { Bell, LogOut } from 'lucide-react';

import type { AuthUser } from '../utils/auth';

interface HeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
}

function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="flex min-h-24 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Gerencie seus produtos e acompanhe seu estoque
        </p>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name}
            </p>

            <p className="text-xs text-slate-500">
              {user.email}
            </p>
          </div>
        )}

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell size={22} />

          <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            3
          </span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Sair do sistema"
          title="Sair"
        >
          <LogOut size={20} />

          <span className="hidden sm:inline">
            Sair
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;