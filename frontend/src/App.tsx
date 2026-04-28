import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { clearSession, getToken } from "./services/session";
import leafIcon from "./assets/leaf-icon.png";

import HistoryPage from "./pages/HistoryPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResultPage from "./pages/ResultPage";
import UploadPage from "./pages/UploadPage";

function Nav({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <nav className="nav">
      {!isAuthenticated && <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/login">Вход</NavLink>}
      {!isAuthenticated && <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/register">Регистрация</NavLink>}
      <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/upload">Анализ</NavLink>
      <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/result">Результат</NavLink>
      {isAuthenticated && <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/history">История</NavLink>}
      {isAuthenticated && (
        <button className="btn" type="button" onClick={() => { clearSession(); window.location.href = "/login"; }}>
          Выход
        </button>
      )}
    </nav>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isAuthenticated = Boolean(getToken());

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="page app-header-inner">
          <div className="app-brand">
            <img src={leafIcon} alt="Лист" className="app-logo" />
            <h1 className="app-title">Диагностика растений</h1>
          </div>
          <Nav isAuthenticated={isAuthenticated} />
        </div>
      </header>

      <main className={`page app-content ${isAuthPage ? "page-auth" : ""}`.trim()}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
