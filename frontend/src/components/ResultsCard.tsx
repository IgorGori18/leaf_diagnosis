import React from "react";
import { Download } from "lucide-react";
import { DiagnosisResponse } from "../lib/types";
import { HealthBadge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";

interface ResultsCardProps {
  result: DiagnosisResponse | null;
  loading: boolean;
  onDownload: (data: DiagnosisResponse) => void;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ result, loading, onDownload }) => {
  if (!result && !loading) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400 sm:p-6">
        <p>Здесь появится результат анализа после загрузки изображения листа.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-50">
            {loading ? "Анализ изображения…" : "Результат анализа"}
          </h2>
          {result && (
            <p className="text-xs text-slate-400">
              {new Date(result.createdAt).toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </p>
          )}
        </div>
        {result && (
          <HealthBadge status={result.healthStatus} />
        )}
      </div>

      {loading && (
        <div className="space-y-3 text-sm">
          <div className="h-2 w-24 animate-pulse rounded-full bg-slate-700" />
          <div className="space-y-2">
            <div className="h-2 w-full animate-pulse rounded-full bg-slate-800" />
            <div className="h-2 w-5/6 animate-pulse rounded-full bg-slate-800" />
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-slate-800" />
          </div>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              РАСТЕНИЕ
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">
              {result.plantName}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                ДЕФИЦИТ ПИТАНИЯ
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="flex-1">
                  <ProgressBar value={result.nutrientDeficiencyPercent} />
                </div>
                <span className="text-xs font-semibold text-amber-300">
                  {result.nutrientDeficiencyPercent.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                ВЕРОЯТНОСТЬ ВРЕДИТЕЛЕЙ
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="flex-1">
                  <ProgressBar value={result.pestsPercent} />
                </div>
                <span className="text-xs font-semibold text-rose-300">
                  {result.pestsPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                НАЙДЕННЫЕ ЗАБОЛЕВАНИЯ
              </p>
              <span className="text-[11px] text-slate-500">
                Топ {Math.min(result.diseases.length, 5)}
              </span>
            </div>
            <div className="space-y-2">
              {result.diseases.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-slate-50">{d.name}</p>
                    <span className="text-xs text-slate-300">
                      {(d.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar value={d.probability * 100} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onDownload(result)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-100 shadow-sm hover:border-leaf-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
            >
              <Download className="h-4 w-4" />
              <span>Скачать JSON‑отчёт</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};

