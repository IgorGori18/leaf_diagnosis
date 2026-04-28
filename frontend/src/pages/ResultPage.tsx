import { FormEvent, useMemo, useState } from "react";

import api from "../services/api";
import { getLatestResult, setLatestResult } from "../services/session";

type SymptomAnalysis = {
  analysis_id: number;
  plant_name: string;
  plant_confidence_percent: number;
  final_status: string;
  confidence_percent: number;
  possible_causes: string[];
  recommendations: string[];
  comment: string;
  status_adjusted?: boolean;
  raw_model_result?: Record<string, unknown>;
  selected_symptoms?: string[];
  affected_area?: string;
  analysis_json: Record<string, unknown>;
};

type IdentifyResult = {
  analysis_id: number;
  plant_name: string;
  plant_confidence_percent: number;
  preliminary_status: string;
  preliminary_comment: string;
  top_diseases: { name: string; score: number; probability_percent: number }[];
  diseases_fallback_text: string;
  analysis_json: Record<string, unknown>;
  finalAnalysis?: SymptomAnalysis | null;
};

const SYMPTOMS = [
  "Жёлтые листья", "Коричневые пятна", "Чёрные пятна", "Белый налёт", "Есть налёт на листьях", "Лист скручивается",
  "Лист деформирован", "Края листа засыхают", "Лист вянет", "Есть дырки или повреждения", "Есть следы вредителей",
  "Есть насекомые", "Лист теряет цвет", "Рост растения замедлился", "Листья опадают", "Пятна быстро распространяются", "Пятна с жёлтой каймой",
];
const AFFECTED_AREAS = ["Нижние листья", "Верхние листья", "Всё растение"];
const fmt = (x: number) => `${x.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
const fixSpaces = (s: string) => s.replace(/([\u0400-\u04FF])([A-Za-z])/g, "$1 $2").replace(/([A-Za-z])([\u0400-\u04FF])/g, "$1 $2");

function topDiseasesFromAnalysisJson(
  analysisJson: Record<string, unknown> | undefined,
): IdentifyResult["top_diseases"] {
  const plantnet = analysisJson?.plantnet as { diseases_top3?: unknown } | undefined;
  const raw = plantnet?.diseases_top3;
  if (!Array.isArray(raw)) return [];
  const out: IdentifyResult["top_diseases"] = [];
  for (const item of raw) {
    const row = item as { name?: string; confidence?: number; score?: number; probability_percent?: number };
    const name = String(row.name ?? "").trim();
    if (!name) continue;
    let c = 0;
    if (typeof row.confidence === "number" && Number.isFinite(row.confidence)) c = row.confidence;
    else if (typeof row.score === "number" && Number.isFinite(row.score)) c = row.score;
    const probabilityPercent =
      typeof row.probability_percent === "number" && Number.isFinite(row.probability_percent)
        ? Math.round(row.probability_percent)
        : Math.round(c * 100);
    out.push({ name, score: c, probability_percent: probabilityPercent });
  }
  return out;
}


export default function ResultPage() {
  const initial = getLatestResult() as IdentifyResult | null;
  const [data, setData] = useState<IdentifyResult | null>(initial);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [affectedArea, setAffectedArea] = useState<string>(AFFECTED_AREAS[0]);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAnalysis = data?.finalAnalysis ?? null;
  const selectedSet = useMemo(() => new Set(selectedSymptoms), [selectedSymptoms]);
  const topDiseases = useMemo(() => {
    if (!data) return [];
    if (data.top_diseases?.length) return data.top_diseases;
    return topDiseasesFromAnalysisJson(data.analysis_json);
  }, [data]);

  if (!data) {
    return <p className="notice notice-empty">Нет данных для результата. Сначала загрузите фото.</p>;
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const submitSymptoms = async (e: FormEvent) => {
    e.preventDefault();
    setAnalyzeLoading(true);
    setError("");
    try {
      const { data: payload } = await api.post<SymptomAnalysis>("/analyze-symptoms", {
        analysis_id: data.analysis_id,
        selected_symptoms: selectedSymptoms,
        affected_area: affectedArea,
      });
      const next = { ...data, finalAnalysis: payload, analysis_json: payload.analysis_json };
      setData(next);
      setLatestResult(next);
    } catch {
      setError("Не удалось выполнить уточняющий анализ.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="section-title">Предварительный результат</h2>
          </div>
        </div>

        <div className="stack-sm">
          <p><strong>Растение:</strong> {data.plant_name}</p>
          <p><strong>Уверенность определения:</strong> {fmt(data.plant_confidence_percent)}</p>
          <p className="subtle">{fixSpaces(data.preliminary_comment)}</p>
          {topDiseases.length > 0 && (
            <div>
              <strong>Возможные болезни:</strong>
              <ul className="list">
                {topDiseases.map((disease) => (
                  <li key={`${disease.name}-${disease.probability_percent}`}>
                    {disease.name} — {disease.probability_percent}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="button" onClick={() => setShowSymptoms((v) => !v)}>
            {showSymptoms ? "Скрыть симптомы" : "Уточнить анализ"}
          </button>
        </div>
      </div>

      {showSymptoms && (
        <div className="card">
          <h3 className="section-title" style={{ fontSize: 20 }}>Выбор симптомов</h3>
          <form className="form-grid" onSubmit={submitSymptoms}>
            <div className="card-soft">
              <strong>Выберите симптомы:</strong>
              <div className="symptom-grid" style={{ marginTop: 10 }}>
                {SYMPTOMS.map((symptom) => (
                  <label key={symptom} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <input type="checkbox" checked={selectedSet.has(symptom)} onChange={() => toggleSymptom(symptom)} />
                    <span>{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card-soft">
              <strong>Где проявляется проблема:</strong>
              <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                {AFFECTED_AREAS.map((area) => (
                  <label key={area} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="radio"
                      name="affectedArea"
                      checked={affectedArea === area}
                      onChange={() => setAffectedArea(area)}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={analyzeLoading}>
              {analyzeLoading ? "Анализируем…" : "Получить анализ"}
            </button>
          </form>
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}

      {finalAnalysis && (
        <div className="card">
          <div className="card-header">
            <div>
              <p className="section-label">Финальный итог</p>
              <h3 className="section-title" style={{ fontSize: 20 }}>Результат по симптомам</h3>
            </div>
          </div>

          <div className="stack-md">
            <p><strong>Уверенность:</strong> {fmt(finalAnalysis.confidence_percent)}</p>

            {finalAnalysis.recommendations.length > 0 && (
              <div>
                <strong>Рекомендации:</strong>
                <ul className="list">{finalAnalysis.recommendations.map((item) => <li key={item}>{fixSpaces(item)}</li>)}</ul>
              </div>
            )}

            {finalAnalysis.comment && (
              <p><strong>Комментарий:</strong> {fixSpaces(finalAnalysis.comment)}</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
