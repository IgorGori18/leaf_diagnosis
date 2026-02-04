import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Leaf Diagnosis. Исследовательский интерфейс для агро‑аналитики.</p>
        <p className="text-[11px]">
          Демо‑клиент. Для производства подключите свой Python backend через переменную окружения
          <span className="font-mono text-slate-300"> VITE_API_BASE</span>.
        </p>
      </div>
    </footer>
  );
};

