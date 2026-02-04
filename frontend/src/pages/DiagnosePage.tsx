import React, { useState } from "react";
import { diagnoseImage } from "../lib/api";
import { DiagnosisResponse } from "../lib/types";
import { UploadCard } from "../components/UploadCard";
import { ResultsCard } from "../components/ResultsCard";
import { saveAnalysis } from "../lib/history";
import { useAuth } from "../store/useAuth";

export const DiagnosePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!file) {
      setError("Пожалуйста, выберите изображение листа для анализа.");
      return;
    }
    setError(null);
    setSaved(false);
    try {
      setLoading(true);
      const res = await diagnoseImage(file);
      setResult(res);

      // persist in history if logged in
      if (user) {
        const reader = new FileReader();
        reader.onload = () => {
          const thumbnailDataUrl = typeof reader.result === "string" ? reader.result : "";
          saveAnalysis({
            userId: user.id,
            imageName: file.name,
            thumbnailDataUrl,
            response: res,
            createdAt: res.createdAt
          });
          setSaved(true);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось выполнить анализ.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (data: DiagnosisResponse) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosis-${data.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="gradient-bg min-h-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            Диагностика растения по изображению листа
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Загрузите фото листа, и модель оценит общее состояние растения,
            возможный дефицит питания, риск вредителей и наиболее вероятные заболевания.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <UploadCard
              onFileSelected={(f) => {
                setFile(f);
                setError(null);
              }}
            />
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="inline-flex items-center justify-center rounded-full bg-leaf-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-leaf-500/30 hover:bg-leaf-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300"
              >
                {loading ? "Анализируем…" : "Запустить анализ"}
              </button>
              {!user && (
                <p className="flex-1 text-right text-[11px] text-slate-400">
                  Вход не обязателен, но{" "}
                  <span className="font-medium text-leaf-300">
                    авторизованные пользователи
                  </span>{" "}
                  могут сохранять историю анализов и возвращаться к ней на вкладке
                  «История».
                </p>
              )}
            </div>
            {error && (
              <p className="rounded-lg border border-rose-700/70 bg-rose-950/60 px-3 py-2 text-xs text-rose-100">
                {error}
              </p>
            )}
            {saved && user && (
              <p className="rounded-lg border border-emerald-700/60 bg-emerald-950/50 px-3 py-2 text-xs text-emerald-100">
                Анализ сохранён в истории для пользователя{" "}
                <span className="font-semibold">{user.name || user.email}</span>.
              </p>
            )}
          </div>

          <ResultsCard result={result} loading={loading} onDownload={handleDownload} />
        </div>
      </div>
    </main>
  );
};

