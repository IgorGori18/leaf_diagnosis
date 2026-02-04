import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Пароль и подтверждение не совпадают.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось завершить регистрацию.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg flex min-h-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl">
        <h1 className="text-lg font-semibold text-slate-50">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-400">
          Создайте учётную запись, чтобы сохранять и просматривать историю анализов
          снимков листьев.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-slate-200"
            >
              Имя
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="reg-email"
              className="block text-xs font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="reg-password"
              className="block text-xs font-medium text-slate-200"
            >
              Пароль
            </label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="reg-confirm"
              className="block text-xs font-medium text-slate-200"
            >
              Подтверждение пароля
            </label>
            <input
              id="reg-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-700/70 bg-rose-950/60 px-3 py-2 text-xs text-rose-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-leaf-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-leaf-500/30 hover:bg-leaf-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300"
          >
            {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-medium text-leaf-300 hover:text-leaf-200">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
};

