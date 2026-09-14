export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZACAO' | string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'estoque-auth-token';
const USER_KEY = 'estoque-auth-user';

const API_URL = 'http://localhost:3001/api';

// =========================
// Login
// =========================

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
    throw new Error(
      data.error || 'Não foi possível realizar o login.'
    );
  }

  if (
    typeof data.token !== 'string' ||
    !data.user
  ) {
    throw new Error(
      'Resposta de autenticação inválida.'
    );
  }

  localStorage.setItem(
    TOKEN_KEY,
    data.token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(data.user)
  );

  return data;
}

// =========================
// Token
// =========================

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// =========================
// Usuário
// =========================

export function getUser(): AuthUser | null {
  const storedUser =
    localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser
    ) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);

    return null;
  }
}

export function updateStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// =========================
// Logout
// =========================

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// =========================
// Verificar autenticação
// =========================

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

// =========================
// Requisições autenticadas
// =========================

/**
 * Realiza requisições à API
 * enviando automaticamente
 * o token JWT.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  // =========================
  // Sessão expirada/inválida
  // =========================

  if (response.status === 401) {
    logout();

    window.dispatchEvent(
      new Event('auth:logout')
    );
  }

  return response;
}