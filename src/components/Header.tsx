import { useState } from 'react';
import { Bell, LogOut, AlertTriangle, PackageX } from 'lucide-react';

import type { AuthUser } from '../utils/auth';
import type { Product } from '../types/Product';

interface HeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
  onNotificationProduct: (product: Product) => void;
  products: Product[];
}

function Header({
  user,
  onLogout,
  onNotificationProduct,
  products,
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = products
    .filter((product) => product.quantity <= 5)
    .sort((a, b) => a.quantity - b.quantity);

  const notificationCount = notifications.length;

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
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>

            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((current) => !current)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell size={22} />

            {notificationCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Notificações
                    </h3>

                    <p className="text-xs text-slate-500">Alertas do estoque</p>
                  </div>

                  {notificationCount > 0 && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                    <Bell size={28} className="mb-2 text-green-500" />

                    <p className="text-sm font-semibold text-slate-800">
                      Tudo certo!
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Nenhum produto precisa de atenção.
                    </p>
                  </div>
                ) : (
                  notifications.map((product) => {
                    const outOfStock = product.quantity <= 0;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          onNotificationProduct(product);
                          setNotificationsOpen(false);
                        }}
                        className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 last:border-b-0"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            outOfStock
                              ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {outOfStock ? (
                            <PackageX size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>

                          <p
                            className={`mt-0.5 text-xs ${
                              outOfStock ? 'text-red-600' : 'text-amber-600'
                            }`}
                          >
                            {outOfStock
                              ? 'Estoque zerado'
                              : `Estoque baixo: ${product.quantity} unidade${
                                  product.quantity === 1 ? '' : 's'
                                }`}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Sair do sistema"
          title="Sair"
        >
          <LogOut size={20} />

          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
