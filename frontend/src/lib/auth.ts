import { AuthPayload, User } from "./types";

const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

function persistAuth(payload: AuthPayload) {
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem(TOKEN_KEY, payload.token);
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  // TODO: replace mock with backend
  if (!email || !password) {
    throw new Error("Введите email и пароль");
  }

  const existingRaw = localStorage.getItem(USER_KEY);
  let user: User;
  if (existingRaw) {
    user = JSON.parse(existingRaw) as User;
  } else {
    user = {
      id: crypto.randomUUID(),
      name: email.split("@")[0] || "Guest",
      email
    };
  }

  const token = `mock-token-${user.id}`;
  const payload: AuthPayload = { user, token };
  persistAuth(payload);
  return payload;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthPayload> {
  // TODO: replace mock with backend
  if (!name || !email || !password) {
    throw new Error("Заполните все поля");
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email
  };
  const token = `mock-token-${user.id}`;
  const payload: AuthPayload = { user, token };
  persistAuth(payload);
  return payload;
}

