import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";
import { useAuth } from "../store/useAuth";

const navLinkBase =
  "inline-flex items-center px-3 py-2 text-sm font-medium rounded-full transition-colors";

const activeNav =
  "bg-leaf-500/15 text-leaf-200 ring-1 ring-leaf-500/50 hover:bg-leaf-500/25";
const inactiveNav =
  "text-slate-300 hover:text-white hover:bg-slate-800/70 ring-1 ring-transparent";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-500/15 text-leaf-300 ring-1 ring-leaf-500/40">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-50">
                Диагностика растения по листу
              </span>
              <span className="text-xs text-slate-400">Agro/AI assistant</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
            aria-label="Открыть меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeNav : inactiveNav}`
              }
            >
              Диагностика
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeNav : inactiveNav}`
              }
            >
              История
            </NavLink>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-slate-400">Вы вошли как</span>
                  <span className="text-sm font-medium text-slate-100">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-full bg-leaf-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm hover:bg-leaf-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-800/60 bg-slate-950/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeNav : inactiveNav}`
              }
            >
              Диагностика
            </NavLink>
            <NavLink
              to="/history"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeNav : inactiveNav}`
              }
            >
              История
            </NavLink>
            <div className="mt-2 border-t border-slate-800/70 pt-2">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                >
                  Выйти
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  className="w-full rounded-full bg-leaf-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-leaf-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300"
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

