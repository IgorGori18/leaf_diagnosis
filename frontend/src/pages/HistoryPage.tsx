import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

type HistoryItem = {
  analysis_id: number;
  image_path: string;
  plant_name: string;
  plant_confidence: number;
  final_status: string;
  final_confidence: number;
  display_status: string;
  created_at: string;
};


function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });
}

function toImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/${path}`;
}



function shortPlantName(value: string): string {
  const s = (value || "").trim();
  if (!s) return "Фото";
  return s.length > 20 ? `${s.slice(0, 18)}…` : s;
}

type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get("/history")
      .then(({ data }) => setRows(data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Сессия истекла. Войдите снова.");
          navigate("/login");
          return;
        }
        setError("Не удалось загрузить историю анализов");
      });
  }, [navigate]);

  // reset to page 1 when sort changes
  useEffect(() => { setPage(1); }, [sortOrder]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
  }, [rows, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>История анализов</h2>
        <button
          type="button"
          className="btn"
          onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
        >
          {sortOrder === "newest" ? "Сначала новые ↓" : "Сначала старые ↑"}
        </button>
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      {rows.length === 0 && !error && (
        <p className="notice notice-empty">Пока нет сохранённых анализов.</p>
      )}

      {pageItems.map((row) => {
        return (
          <button
            key={row.analysis_id}
            type="button"
            onClick={() => navigate(`/history/${row.analysis_id}`)}
            className="card history-card"
            style={{ marginBottom: 12, padding: 12 }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 120 }}>
              <img
                src={toImageUrl(row.image_path)}
                alt={row.plant_name}
                className="thumb"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="thumb"
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: "center",
                  padding: 6,
                  background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                }}
              >
                {shortPlantName(row.plant_name)}
              </div>
            </div>

            <div className="stack-sm">
              <div style={{ fontWeight: 700, fontSize: 16 }}>{row.plant_name}</div>
              <div className="subtle" style={{ fontSize: 14 }}>{formatDate(row.created_at)}</div>
            </div>
          </button>
        );
      })}

      {totalPages > 1 && (
        <div className="pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`btn${page === p ? " nav-link active" : ""}`}
              onClick={() => setPage(p)}
              style={{ minWidth: 36, padding: "8px 10px" }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
