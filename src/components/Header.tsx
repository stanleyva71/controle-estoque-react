import { Bell } from 'lucide-react';

function Header() {
  return (
    <header className="flex h-24 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Gerencie seus produtos e acompanhe seu estoque
        </p>
      </div>

      <button
        type="button"
        className="relative flex h-12 w-12 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
        aria-label="Notificações"
      >
        <Bell size={25} />

        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          3
        </span>
      </button>
    </header>
  );
}

export default Header;