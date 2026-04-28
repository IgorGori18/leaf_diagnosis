import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { setLatestResult } from "../services/session";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;
    setFile(nextFile);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : "");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/identify-plant", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLatestResult({ ...data, finalAnalysis: null });
      navigate("/result");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(String(err.response?.data?.detail ?? err.message));
      } else {
        setError("Не удалось распознать растение");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 780 }}>
      <div className="card-header">
        <div>
          <h2 className="section-title">Загрузка фото</h2>
        </div>
      </div>

      <p className="subtle" style={{ marginTop: 0 }}>
        Загрузите фото листа или всего растения. После распознавания вы сможете уточнить анализ по симптомам.
      </p>

      <form className="form-grid" onSubmit={onSubmit}>
        <input className="file-input" type="file" accept="image/*" onChange={onFileChange} />

        {preview && (
          <div className="card-soft">
            <p className="section-label">Предпросмотр</p>
            <img src={preview} alt="preview" className="preview" />
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={!file || loading}>
          {loading ? "Распознавание…" : "Распознать растение"}
        </button>
      </form>

      {error && <p className="notice notice-error" style={{ marginTop: 12 }}>{error}</p>}
    </div>
  );
}
