import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

type DetailResponse = {
  analysis_id: number;
  image_path: string;
  created_at: string;
  result: {
    plant_name: string;
    plant_confidence: number;
    final_status: string;
    final_confidence: number;
    display_status: string;
    analysis_json: Record<string, unknown>;
    recommendations_text?: string | null;
  };
};

function formatPercentOrNull(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return `${(value * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
}

function toImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x));
}

type StoredDiseaseRow = {
  name?: unknown;
  confidence?: unknown;
  score?: unknown;
  probability_percent?: unknown;
};

function parseDiseasesTop3ForHistory(plantnet: unknown): { name: string; percent: number }[] {
  const p = plantnet as { diseases_top3?: unknown } | null | undefined;
  const raw = p?.diseases_top3;
  if (!Array.isArray(raw)) return [];
  const out: { name: string; percent: number }[] = [];
  for (const item of raw) {
    const row = item as StoredDiseaseRow;
    const name = String(row.name ?? "").trim();
    if (!name || name.toLowerCase() === "unknown") continue;
    let percent = 0;
    const pp = row.probability_percent;
    if (typeof pp === "number" && Number.isFinite(pp)) {
      percent = Math.round(pp);
    } else {
      const c = row.confidence ?? row.score;
      if (typeof c === "number" && Number.isFinite(c)) {
        percent = Math.round(c * 100);
      }
    }
    out.push({ name, percent });
  }
  return out;
}


export default function HistoryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/history/${id}`)
      .then(({ data: payload }) => setData(payload))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Сессия истекла. Войдите снова.");
          navigate("/login");
          return;
        }
        setError("Не удалось загрузить анализ");
      });
  }, [id, navigate]);

  const modelRu = useMemo(() => {
    return (data?.result.analysis_json?.model as { ru?: Record<string, unknown> } | undefined)?.ru ?? {};
  }, [data]);

  const diseasesTop3 = useMemo(
    () => parseDiseasesTop3ForHistory(data?.result?.analysis_json?.plantnet),
    [data],
  );

  if (!data) {
    return (
      <div>
        <h2 className="section-title">Анализ</h2>
        {error ? <p className="notice notice-error">{error}</p> : <p className="notice notice-empty">Загрузка…</p>}
      </div>
    );
  }

  const symptoms = asArray((data.result.analysis_json?.symptoms as { selected_symptoms_ru?: unknown } | undefined)?.selected_symptoms_ru);
  const recommendations = asArray(modelRu?.recommendations);
  const comment = typeof modelRu?.comment === "string" ? modelRu.comment : "";
  const plantConfidence = formatPercentOrNull(data.result.plant_confidence);
  const preliminaryStatus = String(
    (data.result.analysis_json?.plantnet as { preliminary_status?: string } | undefined)?.preliminary_status ?? "",
  );

  return (
    <div className="card" style={{ maxWidth: 900, lineHeight: 1.55 }}>
      <button type="button" className="btn" onClick={() => navigate("/history")} style={{ marginBottom: 12 }}>
        Назад к истории
      </button>

      <div className="card-header">
        <div>
          <p className="section-label">Детали</p>
          <h2 className="section-title">Полный результат анализа</h2>
        </div>
      </div>

      <img
        src={toImageUrl(data.image_path)}
        alt={data.result.plant_name}
        style={{ width: "100%", maxWidth: 620, maxHeight: 380, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb" }}
      />

      <div className="stack-md" style={{ marginTop: 12 }}>
        {plantConfidence && <p><strong>Уверенность определения:</strong> {plantConfidence}</p>}
        <p><strong>Предварительная оценка по фото:</strong> {preliminaryStatus}</p>

        {diseasesTop3.length > 0 ? (
          <div className="card-soft">
            <strong>Возможные болезни по фото:</strong>
            <ul className="list">
              {diseasesTop3.map((d) => (
                <li key={`${d.name}-${d.percent}`}>
                  {d.name} — {d.percent}%
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="notice notice-empty">По фото сложно определить состояние растения</p>
        )}

        {symptoms.length > 0 && (
          <div className="card-soft">
            <strong>Выбранные симптомы:</strong>
            <ul className="list">{symptoms.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="card-soft">
            <strong>Рекомендации:</strong>
            <ul className="list">{recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}

        {comment && (
          <p><strong>Комментарий:</strong> {comment}</p>
        )}
      </div>

    </div>
  );
}
