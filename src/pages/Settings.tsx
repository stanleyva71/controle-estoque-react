import { useEffect, useState } from 'react';

import {
  User,
  Shield,
  SlidersHorizontal,
  Package,
  Bot,
  Server,
  ChevronRight,
  Mail,
  Database,
  Cpu,
  ArrowLeft,
  Lock,
  CircleCheck,
  TriangleAlert,
  CircleX,
  Boxes,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
} from 'lucide-react';

import {
  apiFetch,
  logout,
  type AuthUser,
} from '../utils/auth';

interface SettingsProps {
  user: AuthUser | null;
}

type SettingsSection =
  | 'overview'
  | 'profile'
  | 'security'
  | 'preferences'
  | 'stock'
  | 'ai'
  | 'system';

interface StockProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface CategorySummary {
  category: string;
  products: number;
  quantity: number;
}

function Settings({ user }: SettingsProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('overview');

  const [apiStatus, setApiStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');

  const [apiMessage, setApiMessage] =
    useState('Verificando conexão...');

  const [aiAnalysisEnabled, setAiAnalysisEnabled] =
    useState<boolean>(() => {
      return (
        localStorage.getItem(
          'estoque-ai-analysis-enabled'
        ) !== 'false'
      );
    });

  const [aiAssistantEnabled, setAiAssistantEnabled] =
    useState<boolean>(() => {
      return (
        localStorage.getItem(
          'estoque-ai-assistant-enabled'
        ) !== 'false'
      );
    });

  const [stockProducts, setStockProducts] =
    useState<StockProduct[]>([]);

  const [stockLoading, setStockLoading] =
    useState(false);

  const [stockError, setStockError] =
    useState('');

  // =========================
  // Segurança
  // =========================

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordSuccess, setPasswordSuccess] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  useEffect(() => {
    if (activeSection !== 'system') {
      return;
    }

    async function checkApiStatus() {
      setApiStatus('checking');
      setApiMessage('Verificando conexão...');

      try {
        const response = await apiFetch('/test');

        if (!response.ok) {
          throw new Error('API indisponível.');
        }

        setApiStatus('online');
        setApiMessage('Serviço disponível');
      } catch (error) {
        console.error(
          'ERRO AO VERIFICAR API:',
          error
        );

        setApiStatus('offline');
        setApiMessage(
          'Não foi possível conectar à API'
        );
      }
    }

    checkApiStatus();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'stock') {
      return;
    }

    async function loadStockData() {
      setStockLoading(true);
      setStockError('');

      try {
        const response = await apiFetch('/products');

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Não foi possível carregar os dados do estoque.'
          );
        }

        const productsData = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : [];

        setStockProducts(
          productsData.map(
            (product: StockProduct) => ({
              id: Number(product.id),
              name: String(product.name || ''),
              category: String(
                product.category ||
                  'Sem categoria'
              ),
              quantity:
                Number(product.quantity) || 0,
              price:
                Number(product.price) || 0,
            })
          )
        );
      } catch (error) {
        console.error(
          'Erro ao carregar dados do estoque:',
          error
        );

        setStockError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados do estoque.'
        );
      } finally {
        setStockLoading(false);
      }
    }

    loadStockData();
  }, [activeSection]);

  const settingsSections = [
    {
      id: 'profile' as const,
      icon: User,
      title: 'Perfil',
      description:
        'Visualize as informações da sua conta.',
      items: ['Nome e e-mail da conta'],
    },

    {
      id: 'security' as const,
      icon: Shield,
      title: 'Segurança',
      description:
        'Gerencie a senha e a sessão da sua conta.',
      items: [
        'Alteração de senha e sessão',
      ],
    },

    {
      id: 'preferences' as const,
      icon: SlidersHorizontal,
      title: 'Preferências',
      description:
        'Personalize o comportamento da aplicação.',
      items: ['Tema da interface'],
    },

    {
      id: 'stock' as const,
      icon: Package,
      title: 'Estoque',
      description:
        'Visualize indicadores e informações importantes sobre o estoque.',
      items: [
        'Resumo, situação e distribuição do estoque',
      ],
    },

    {
      id: 'ai' as const,
      icon: Bot,
      title: 'Inteligência Artificial',
      description:
        'Configurações dos recursos de IA do sistema.',
      items: [
        'Análise automática e assistente',
      ],
    },

    {
      id: 'system' as const,
      icon: Server,
      title: 'Sistema',
      description:
        'Consulte informações técnicas da aplicação.',
      items: [
        'API, banco de dados e versão',
      ],
    },
  ];

  function getRoleLabel(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';

      case 'OPERADOR':
        return 'Operador';

      case 'VISUALIZACAO':
        return 'Visualização';

      default:
        return role;
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function handleBack() {
    setActiveSection('overview');

    setPasswordSuccess('');
    setPasswordError('');
  }

  function toggleAiAnalysis() {
    const newValue = !aiAnalysisEnabled;

    setAiAnalysisEnabled(newValue);

    localStorage.setItem(
      'estoque-ai-analysis-enabled',
      String(newValue)
    );

    window.dispatchEvent(
      new Event('preferences:updated')
    );
  }

  function toggleAiAssistant() {
    const newValue = !aiAssistantEnabled;

    setAiAssistantEnabled(newValue);

    localStorage.setItem(
      'estoque-ai-assistant-enabled',
      String(newValue)
    );

    window.dispatchEvent(
      new Event('preferences:updated')
    );
  }

  async function handleChangePassword() {
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError(
        'Informe sua senha atual.'
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        'Informe a nova senha.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        'A nova senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError(
        'Confirme a nova senha.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'A confirmação da senha não corresponde à nova senha.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'A nova senha deve ser diferente da senha atual.'
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiFetch(
        '/auth/change-password',
        {
          method: 'POST',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Não foi possível alterar a senha.'
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordSuccess(
        'Senha alterada com sucesso.'
      );
    } catch (error) {
      console.error(
        'Erro ao alterar senha:',
        error
      );

      setPasswordError(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a senha.'
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function handleLogout() {
    logout();

    window.dispatchEvent(
      new Event('auth:logout')
    );
  }

  function renderPasswordToggle(
    visible: boolean,
    onClick: () => void,
    label: string
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label={label}
      >
        {visible ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    );
  }

  function renderSectionContent() {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-5">
            {/* Cabeçalho */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                    {user?.name
                      ?.charAt(0)
                      .toUpperCase() || 'U'}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Perfil
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Visualize as informações da sua conta.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Perfil de acesso
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {getRoleLabel(
                      user?.role || ''
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações pessoais */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Informações pessoais
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Dados básicos vinculados à sua conta.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nome
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pl-11 text-sm text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pl-11 text-sm text-slate-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Perfil de acesso */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Perfil de acesso
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  O nível de acesso é definido pelo administrador do sistema.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Shield
                    size={20}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {getRoleLabel(
                        user?.role || ''
                      )}
                    </p>

                    <p className="text-xs text-slate-400">
                      Esse campo não pode ser alterado nesta tela.
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  Bloqueado
                </span>
              </div>
            </div>

            {/* Informações da conta */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Informações da conta
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Informações internas da conta do usuário.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    ID do usuário
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    #{user?.id ?? '—'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Conta ativa
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-5">
            {/* Cabeçalho */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Shield size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Segurança
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Gerencie a senha e o acesso à sua conta.
                  </p>
                </div>
              </div>
            </div>

            {/* Alterar senha */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <KeyRound size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Alterar senha
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Atualize a senha utilizada para acessar o sistema.
                    </p>
                  </div>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CircleCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm font-medium text-emerald-700">
                    {passwordSuccess}
                  </p>
                </div>
              )}

              {passwordError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <CircleX
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm font-medium text-red-700">
                    {passwordError}
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {/* Senha atual */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Senha atual
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showCurrentPassword
                          ? 'text'
                          : 'password'
                      }
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      placeholder="Digite sua senha atual"
                      disabled={changingPassword}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    {renderPasswordToggle(
                      showCurrentPassword,
                      () =>
                        setShowCurrentPassword(
                          (value) => !value
                        ),
                      showCurrentPassword
                        ? 'Ocultar senha atual'
                        : 'Mostrar senha atual'
                    )}
                  </div>
                </div>

                {/* Nova senha */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nova senha
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showNewPassword
                          ? 'text'
                          : 'password'
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Digite a nova senha"
                      disabled={changingPassword}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    {renderPasswordToggle(
                      showNewPassword,
                      () =>
                        setShowNewPassword(
                          (value) => !value
                        ),
                      showNewPassword
                        ? 'Ocultar nova senha'
                        : 'Mostrar nova senha'
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    A senha deve possuir pelo menos 6 caracteres.
                  </p>
                </div>

                {/* Confirmar senha */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirmar nova senha
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter'
                        ) {
                          event.preventDefault();
                          handleChangePassword();
                        }
                      }}
                      placeholder="Digite novamente a nova senha"
                      disabled={changingPassword}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    {renderPasswordToggle(
                      showConfirmPassword,
                      () =>
                        setShowConfirmPassword(
                          (value) => !value
                        ),
                      showConfirmPassword
                        ? 'Ocultar confirmação'
                        : 'Mostrar confirmação'
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Alterar senha
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sessão */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Sessão atual
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Informações sobre a autenticação atual da sua conta.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Autenticação
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    JWT
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Sessão protegida por token
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Validade
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    8 horas
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Configuração atual do sistema
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Sessão ativa
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Usuário autenticado
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={18} />
                  Encerrar sessão
                </button>
              </div>
            </div>

            {/* Proteção da conta */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CircleCheck size={23} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Proteção da conta
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Sua conta utiliza autenticação JWT e controle de permissões para proteger os recursos do sistema.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Autenticação
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Ativa
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Permissões
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Por função
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Senha
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Protegida
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SlidersHorizontal size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Preferências
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Personalize o comportamento da aplicação.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800">
                Aparência
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                As opções de tema da interface serão configuradas aqui.
              </p>
            </div>
          </div>
        );

      case 'stock': {
        const totalProducts = stockProducts.length;

        const totalQuantity =
          stockProducts.reduce(
            (total, product) =>
              total + product.quantity,
            0
          );

        const totalValue =
          stockProducts.reduce(
            (total, product) =>
              total +
              product.quantity *
                product.price,
            0
          );

        const lowStockProducts =
          stockProducts.filter(
            (product) =>
              product.quantity > 0 &&
              product.quantity <= 5
          );

        const zeroStockProducts =
          stockProducts.filter(
            (product) =>
              product.quantity <= 0
          );

        const normalStockProducts =
          stockProducts.filter(
            (product) =>
              product.quantity > 5
          );

        const categoryMap =
          new Map<string, CategorySummary>();

        stockProducts.forEach(
          (product) => {
            const current =
              categoryMap.get(
                product.category
              );

            if (current) {
              current.products += 1;
              current.quantity +=
                product.quantity;
            } else {
              categoryMap.set(
                product.category,
                {
                  category:
                    product.category,
                  products: 1,
                  quantity:
                    product.quantity,
                }
              );
            }
          }
        );

        const categorySummary =
          Array.from(
            categoryMap.values()
          ).sort(
            (a, b) =>
              b.quantity - a.quantity
          );

        const highestStockProduct =
          stockProducts.length > 0
            ? [...stockProducts].sort(
                (a, b) =>
                  b.quantity -
                  a.quantity
              )[0]
            : null;

        const lowestStockProduct =
          stockProducts.length > 0
            ? [...stockProducts].sort(
                (a, b) =>
                  a.quantity -
                  b.quantity
              )[0]
            : null;

        const highestPriceProduct =
          stockProducts.length > 0
            ? [...stockProducts].sort(
                (a, b) =>
                  b.price - a.price
              )[0]
            : null;

        const lowestPriceProduct =
          stockProducts.length > 0
            ? [...stockProducts].sort(
                (a, b) =>
                  a.price - b.price
              )[0]
            : null;

        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Estoque
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Visualize indicadores e informações importantes sobre o estoque.
                  </p>
                </div>
              </div>
            </div>

            {stockLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Carregando dados do estoque...
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Buscando informações atualizadas.
                  </p>
                </div>
              </div>
            ) : stockError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <CircleX
                    size={22}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <h3 className="font-semibold text-red-800">
                      Não foi possível carregar o estoque
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {stockError}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Resumo */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      Resumo do estoque
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Visão geral dos principais indicadores atuais.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Boxes size={20} />
                      </div>

                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Produtos
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-800">
                        {totalProducts}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        produtos cadastrados
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <Package size={20} />
                      </div>

                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Unidades
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-800">
                        {totalQuantity}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        unidades em estoque
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <DollarSign size={20} />
                      </div>

                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Valor total
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {formatCurrency(
                          totalValue
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        valor do estoque
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <TrendingUp size={20} />
                      </div>

                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                        Categorias
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-800">
                        {categorySummary.length}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        categorias utilizadas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Situação */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      Situação do estoque
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribuição atual dos produtos conforme a quantidade disponível.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <CircleCheck size={21} />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                            Estoque normal
                          </p>

                          <p className="mt-1 text-2xl font-bold text-emerald-800">
                            {
                              normalStockProducts.length
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-emerald-700">
                        Produtos com quantidade acima de 5 unidades.
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                          <TriangleAlert size={21} />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                            Estoque baixo
                          </p>

                          <p className="mt-1 text-2xl font-bold text-amber-800">
                            {
                              lowStockProducts.length
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-amber-700">
                        Produtos com até 5 unidades disponíveis.
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <CircleX size={21} />
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                            Sem estoque
                          </p>

                          <p className="mt-1 text-2xl font-bold text-red-800">
                            {
                              zeroStockProducts.length
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-red-700">
                        Produtos atualmente sem nenhuma unidade disponível.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categorias */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      Distribuição por categoria
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Quantidade de produtos e unidades por categoria.
                    </p>
                  </div>

                  {categorySummary.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <Package
                        size={32}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Nenhum produto cadastrado
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Cadastre produtos para visualizar a distribuição.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categorySummary.map(
                        (category) => {
                          const percentage =
                            totalQuantity >
                            0
                              ? Math.round(
                                  (category.quantity /
                                    totalQuantity) *
                                    100
                                )
                              : 0;

                          return (
                            <div
                              key={
                                category.category
                              }
                              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {
                                      category.category
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      category.products
                                    }{' '}
                                    {category.products ===
                                    1
                                      ? 'produto'
                                      : 'produtos'}{' '}
                                    •{' '}
                                    {
                                      category.quantity
                                    }{' '}
                                    unidades
                                  </p>
                                </div>

                                <span className="text-sm font-semibold text-blue-600">
                                  {percentage}%
                                </span>
                              </div>

                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Destaques */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      Destaques do estoque
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Produtos que se destacam pelos principais indicadores.
                    </p>
                  </div>

                  {stockProducts.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <Boxes
                        size={32}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Ainda não existem produtos cadastrados.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Maior quantidade
                        </p>

                        <p className="mt-2 text-base font-bold text-slate-800">
                          {
                            highestStockProduct?.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            highestStockProduct?.quantity
                          }{' '}
                          unidades
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Menor quantidade
                        </p>

                        <p className="mt-2 text-base font-bold text-slate-800">
                          {
                            lowestStockProduct?.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            lowestStockProduct?.quantity
                          }{' '}
                          unidades
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Produto mais caro
                        </p>

                        <p className="mt-2 text-base font-bold text-slate-800">
                          {
                            highestPriceProduct?.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(
                            highestPriceProduct?.price ||
                              0
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Produto mais barato
                        </p>

                        <p className="mt-2 text-base font-bold text-slate-800">
                          {
                            lowestPriceProduct?.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(
                            lowestPriceProduct?.price ||
                              0
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }

      case 'ai':
        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bot size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Inteligência Artificial
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure os recursos de IA do sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Gemini
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Serviço de inteligência artificial utilizado pela aplicação.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Configurado
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Serviço configurado no backend
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Provedor
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Google Gemini
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Inteligência artificial em nuvem
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Modelo
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Configurado no servidor
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Gerenciado pelo backend
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Análise automática
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Controle o recurso responsável por analisar o estoque utilizando IA.
                </p>
              </div>

              <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Bot size={20} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Análise automática habilitada
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Permite utilizar a IA para gerar análises e recomendações com base nos dados do estoque.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleAiAnalysis}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    aiAnalysisEnabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300'
                  }`}
                  aria-label={
                    aiAnalysisEnabled
                      ? 'Desativar análise automática'
                      : 'Ativar análise automática'
                  }
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      aiAnalysisEnabled
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  {aiAnalysisEnabled
                    ? 'A análise automática está habilitada.'
                    : 'A análise automática está desabilitada.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Assistente de estoque
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Controle o assistente usado para consultar informações do estoque em linguagem natural.
                </p>
              </div>

              <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Bot size={20} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Assistente habilitado
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Permite fazer perguntas sobre os produtos e o estoque através do Dashboard.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleAiAssistant}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    aiAssistantEnabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300'
                  }`}
                  aria-label={
                    aiAssistantEnabled
                      ? 'Desativar assistente'
                      : 'Ativar assistente'
                  }
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      aiAssistantEnabled
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-600">
                  O assistente utiliza os dados do estoque disponíveis para responder perguntas e auxiliar na consulta das informações.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Informações
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Os recursos de IA são executados através da API do sistema.
                </p>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  A chave de API não é exibida nesta interface. As credenciais permanecem protegidas no ambiente do servidor.
                </p>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Server size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Sistema
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Consulte informações técnicas da aplicação.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Status dos serviços
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Estado atual dos principais serviços utilizados pelo sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Server size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        API
                      </p>

                      <p
                        className={`mt-1 flex items-center gap-2 text-sm font-semibold ${
                          apiStatus === 'online'
                            ? 'text-emerald-600'
                            : apiStatus === 'offline'
                              ? 'text-red-600'
                              : 'text-amber-500'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            apiStatus === 'online'
                              ? 'bg-emerald-500'
                              : apiStatus === 'offline'
                                ? 'bg-red-500'
                                : 'bg-amber-400'
                          }`}
                        />

                        {apiStatus === 'online'
                          ? 'Online'
                          : apiStatus === 'offline'
                            ? 'Offline'
                            : 'Verificando...'}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {apiMessage}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <Database size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Banco de dados
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        PostgreSQL
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Banco utilizado pela aplicação
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <Cpu size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Inteligência Artificial
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        Gemini
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Provedor de IA utilizado pelo sistema
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Informações da aplicação
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Informações técnicas do sistema atual.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Nome da aplicação
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Estoque
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Versão
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    1.0.0
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Ambiente
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Desenvolvimento
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Autenticação
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    JWT
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  Tecnologias
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Principais tecnologias utilizadas na aplicação.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Front-end
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    React + TypeScript
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Back-end
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Node.js + Express
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Banco de dados
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    PostgreSQL + Prisma
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Inteligência Artificial
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Google Gemini
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  if (activeSection !== 'overview') {
    return (
      <section className="space-y-6">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Voltar para Configurações
          </button>

          {renderSectionContent()}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Configurações
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Gerencie as preferências e configurações do sistema.
        </p>
      </div>

      {/* Perfil resumido */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User size={28} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {user?.name || 'Usuário'}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {user?.email ||
                    'E-mail não disponível'}
                </span>

                <span className="hidden sm:inline">
                  •
                </span>

                <span className="font-medium text-blue-600">
                  {getRoleLabel(
                    user?.role || ''
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Conta atual
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Configurações pessoais
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {settingsSections.map(
          (section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setActiveSection(
                    section.id
                  )
                }
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {section.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={20}
                    className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {section.items.map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-slate-600"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                        <span>{item}</span>
                      </div>
                    )
                  )}
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Status do sistema */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            Status do sistema
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Informações gerais sobre os serviços utilizados pela aplicação.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Server size={20} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                API
              </p>

              <p className="text-sm font-semibold text-slate-700">
                Conectada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Database size={20} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Banco de dados
              </p>

              <p className="text-sm font-semibold text-slate-700">
                PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Cpu size={20} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                IA
              </p>

              <p className="text-sm font-semibold text-slate-700">
                Gemini
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;