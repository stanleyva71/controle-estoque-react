const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'estoque-auth-token';
const USER_KEY = 'estoque-auth-user';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZACAO';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ==========================================
// TOKEN
// ==========================================

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ==========================================
// USUÁRIO
// ==========================================

export function getUser(): AuthUser | null {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function updateStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ==========================================
// LOGIN
// ==========================================

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível realizar o login.');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

// ==========================================
// LOGOUT
// ==========================================

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ==========================================
// AUTENTICAÇÃO
// ==========================================

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ==========================================
// API
// ==========================================

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
  logout();

  window.dispatchEvent(
    new Event('auth:logout')
  );
}

  return response;
}