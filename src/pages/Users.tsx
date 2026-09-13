import { useEffect, useMemo, useState } from 'react';

import type { FormEvent } from 'react';

import {
  Edit,
  Plus,
  Shield,
  Trash2,
  UserRound,
  X,
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

import { apiFetch } from '../utils/auth';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZACAO';
  createdAt: string;
}

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: User['role'];
};

interface UsersProps {
  onToast: (message: string) => void;
}

const USERS_PER_PAGE = 5;

function Users({ onToast }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    User['role'] | 'todos'
  >('todos');

  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'OPERADOR',
  });

  // =========================
  // Carregar usuários
  // =========================

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await apiFetch('/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível carregar os usuários.'
        );
      }

      setUsers(data);
    } catch (error) {
      console.error('ERRO AO CARREGAR USUÁRIOS:', error);

      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os usuários.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // Erro
  // =========================

  function showError(message: string) {
    setErrorMessage(message);
  }

  // =========================
  // Formulário
  // =========================

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'OPERADOR',
    });

    setEditingUser(null);
    setShowForm(false);
  }

  function handleEdit(user: User) {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });

    setShowForm(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Preencha nome e e-mail.');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      showError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (
      editingUser &&
      formData.password.length > 0 &&
      formData.password.length < 6
    ) {
      showError(
        'A nova senha deve possuir pelo menos 6 caracteres.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload: {
        name: string;
        email: string;
        role: User['role'];
        password?: string;
      } = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const endpoint = editingUser
        ? `/users/${editingUser.id}`
        : '/users';

      const method = editingUser ? 'PUT' : 'POST';

      const response = await apiFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível salvar o usuário.'
        );
      }

      if (editingUser) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === editingUser.id ? data : user
          )
        );

        onToast('Usuário atualizado com sucesso.');
      } else {
        setUsers((currentUsers) => [data, ...currentUsers]);

        onToast('Usuário criado com sucesso.');

        setCurrentPage(1);
      }

      resetForm();
    } catch (error) {
      console.error('ERRO AO SALVAR USUÁRIO:', error);

      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o usuário.'
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // Excluir usuário
  // =========================

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o usuário "${user.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);

      const response = await apiFetch(`/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível excluir o usuário.'
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id
        )
      );

      onToast(
        data.message || 'Usuário excluído com sucesso.'
      );
    } catch (error) {
      console.error('ERRO AO EXCLUIR USUÁRIO:', error);

      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o usuário.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================
  // Labels e ícones
  // =========================

  function getRoleLabel(role: User['role']) {
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

  function getRoleIcon(role: User['role']) {
    switch (role) {
      case 'ADMIN':
        return <Shield size={15} />;

      case 'OPERADOR':
        return <UserRound size={15} />;

      default:
        return <UserRound size={15} />;
    }
  }

  // =========================
  // Filtros
  // =========================

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch === '' ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        selectedRole === 'todos' ||
        user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRole]);

  // =========================
  // Paginação
  // =========================

  const totalPages = Math.ceil(
    filteredUsers.length / USERS_PER_PAGE
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;

    return filteredUsers.slice(
      startIndex,
      startIndex + USERS_PER_PAGE
    );
  }, [filteredUsers, currentPage]);

  // Voltar para página 1 quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole]);

  // Garantir que a página continue válida
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function clearFilters() {
    setSearch('');
    setSelectedRole('todos');
    setCurrentPage(1);
  }

  const hasActiveFilters =
    search.trim() !== '' || selectedRole !== 'todos';

  return (
    <>
      {/* Modal de erro */}
      {errorMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setErrorMessage('')}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X size={22} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                ❌ Operação não realizada!
              </h2>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              {errorMessage}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Usuários
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gerencie os usuários e suas permissões de acesso.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo usuário
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser ? 'Editar usuário' : 'Novo usuário'}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingUser
                    ? 'Atualize os dados e permissões do usuário.'
                    : 'Cadastre um novo usuário no sistema.'}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nome
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  E-mail
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {editingUser ? 'Nova senha' : 'Senha'}
                </label>

                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder={
                    editingUser
                      ? 'Deixe vazio para manter a senha atual'
                      : 'Mínimo de 6 caracteres'
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Perfil
                </label>

                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      role: event.target.value as User['role'],
                    }))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                >
                  <option value="ADMIN">
                    Administrador
                  </option>

                  <option value="OPERADOR">
                    Operador
                  </option>

                  <option value="VISUALIZACAO">
                    Visualização
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row md:col-span-2 md:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? 'Salvando...'
                    : editingUser
                      ? 'Salvar alterações'
                      : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={19} className="text-slate-600" />

            <h2 className="font-bold text-slate-800">
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Busca */}
            <div>
              <label
                htmlFor="user-search"
                className="mb-2 block text-sm font-semibold text-slate-600"
              >
                Buscar usuário
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="user-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Nome ou e-mail..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Perfil */}
            <div>
              <label
                htmlFor="user-role"
                className="mb-2 block text-sm font-semibold text-slate-600"
              >
                Perfil
              </label>

              <select
                id="user-role"
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(
                    event.target.value as User['role'] | 'todos'
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                <option value="todos">
                  Todos os perfis
                </option>

                <option value="ADMIN">
                  Administrador
                </option>

                <option value="OPERADOR">
                  Operador
                </option>

                <option value="VISUALIZACAO">
                  Visualização
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <RotateCcw size={18} />
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-slate-500"
              />
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <UserRound
                size={40}
                className="mb-3 text-slate-300"
              />

              <h3 className="text-base font-semibold text-slate-800">
                Nenhum usuário encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre o primeiro usuário para começar.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <Search
                size={40}
                className="mb-3 text-slate-300"
              />

              <h3 className="text-base font-semibold text-slate-800">
                Nenhum usuário encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Nenhum usuário corresponde aos filtros selecionados.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RotateCcw size={16} />
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Usuário
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        E-mail
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Perfil
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Criado em
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <UserRound size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {user.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID #{user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            {getRoleIcon(user.role)}
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              disabled={deletingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Edit size={16} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              disabled={deletingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === user.id ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}

                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row">
                  <p className="text-sm text-slate-500">
                    Mostrando{' '}
                    <span className="font-semibold text-slate-700">
                      {(currentPage - 1) * USERS_PER_PAGE + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        currentPage * USERS_PER_PAGE,
                        filteredUsers.length
                      )}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-slate-700">
                      {filteredUsers.length}
                    </span>{' '}
                    usuários
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(page - 1, 1)
                        )
                      }
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                      Anterior
                    </button>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-bold text-white">
                      {currentPage}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Próxima
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Users;