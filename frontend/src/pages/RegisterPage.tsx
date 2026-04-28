import { FormEvent, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { setSession } from "../services/session";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      setSession(data.access_token);
      navigate("/upload");
    } catch (err) {
      if (axios.isAxiosError(err)) setError(String(err.response?.data?.detail ?? err.message));
      else setError("Не удалось зарегистрироваться");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2 className="section-title" style={{ textAlign: "center" }}>Регистрация</h2>
      <p className="subtle" style={{ textAlign: "center", marginTop: -2 }}>Создайте аккаунт для сохранения истории анализов.</p>
      <form className="form-grid" onSubmit={onSubmit}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" />
        <input className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" type="password" />
        <button className="btn btn-primary" type="submit">Создать аккаунт</button>
      </form>
      {error && <p className="notice notice-error">{error}</p>}
      <p className="subtle" style={{ textAlign: "center" }}>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
}
