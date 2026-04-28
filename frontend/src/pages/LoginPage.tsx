import { FormEvent, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { setSession } from "../services/session";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setSession(data.access_token);
      navigate("/upload");
    } catch (err) {
      if (axios.isAxiosError(err)) setError(String(err.response?.data?.detail ?? err.message));
      else setError("Не удалось войти");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2 className="section-title" style={{ textAlign: "center" }}>Вход</h2>
      <p className="subtle" style={{ textAlign: "center", marginTop: -2 }}>Введите email и пароль, чтобы продолжить.</p>
      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
        <button className="btn btn-primary" type="submit">Войти</button>
      </form>
      {error && <p className="notice notice-error">{error}</p>}
      <p className="subtle" style={{ textAlign: "center" }}>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
    </div>
  );
}
