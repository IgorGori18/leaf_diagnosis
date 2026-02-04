import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/useAuth";
import { deleteAnalysis, listAnalyses } from "../lib/history";
import { AnalysisHistoryItem } from "../lib/types";
import { Modal } from "../components/ui/Modal";
import { HealthBadge } from "../components/ui/Badge";

type SortOrder = "newest" | "oldest";

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [selected, setSelected] = useState<AnalysisHistoryItem | null>(null);

  useEffect(() => {
    if (!user) return;
    const data = listAnalyses(user.id);
    setItems(data);
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let res = items;
    if (q) {
      res = res.filter((item) => {
        const plant = item.response.plantName.toLowerCase();
        const diseases = item.response.diseases
          .map((d) => d.name.toLowerCase())
          .join(" ");
        return plant.includes(q) || diseases.includes(q);
      });
    }
    res = [...res].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return res;
  }, [items, query, sort]);

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    setItems((cur) => cur.filter((i) => i.id !== id));
    if (selected?.id === id) {
      setSelected(null);
    }
  };

  if (!user) {
    return (
      <main className="gradient-bg min-h-full">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            История анализов
          </h1>
          <p className="max-w-xl text-sm text-slate-400">
            История доступна только авторизованным пользователям. Войдите в систему,
            чтобы сохранять снимки листьев и возвращаться к предыдущим анализам.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg min-h-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            История анализов
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Здесь отображаются все сохранённые анализы для пользователя{" "}
            <span className="font-semibold text-slate-100">
              {user.name || user.email}
            </span>
            .
          </p>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Поиск по растению или заболеванию
            </label>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: томат, фитофтороз, мучнистая роса…"
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 shadow-sm placeholder:text-slate-500 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            />
          </div>
          <div className="mt-3 w-full space-y-2 sm:mt-0 sm:w-44">
            <label
              htmlFor="sort"
              className="block text-xs font-medium text-slate-300"
            >
              Сортировка
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 shadow-sm focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500/60"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-sm text-slate-400">
            Пока нет сохранённых анализов. Выполните диагностику на главной странице,
            чтобы пополнить историю.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-sm"
              >
                <div className="relative h-32 w-full bg-slate-900">
                  {item.thumbnailDataUrl ? (
                    <img
                      src={item.thumbnailDataUrl}
                      alt={item.imageName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                      Без превью
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-[11px] text-slate-200">
                    <span className="truncate">{item.imageName}</span>
                    <span className="ml-2 text-slate-300">
                      {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="line-clamp-2 text-xs font-medium text-slate-50">
                      {item.response.plantName}
                    </p>
                    <HealthBadge status={item.response.healthStatus} />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Топ заболевание:{" "}
                    <span className="font-medium text-slate-100">
                      {item.response.diseases[0]?.name || "—"}
                    </span>
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                    >
                      Подробнее
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center justify-center rounded-full border border-rose-700/70 bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70"
                    >
                      Удалить
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {new Date(item.createdAt).toLocaleString("ru-RU", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={selected ? selected.response.plantName : "Детали анализа"}
        >
          {selected && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-50">
                    {selected.response.plantName}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(selected.createdAt).toLocaleString("ru-RU", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <HealthBadge status={selected.response.healthStatus} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Дефицит питания
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-300">
                    {selected.response.nutrientDeficiencyPercent.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Вероятность вредителей
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-300">
                    {selected.response.pestsPercent.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Вероятные заболевания
                </p>
                <ul className="mt-2 space-y-1.5">
                  {selected.response.diseases.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-1.5"
                    >
                      <span className="text-xs text-slate-100">{d.name}</span>
                      <span className="text-xs text-slate-300">
                        {(d.probability * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <details className="mt-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-medium text-slate-300">
                  JSON‑ответ модели
                </summary>
                <pre className="mt-2 max-h-64 overflow-x-auto overflow-y-auto rounded bg-slate-950/80 p-2 text-[10px] leading-snug text-slate-100">
                  {JSON.stringify(selected.response, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Modal>
      </div>
    </main>
  );
};

