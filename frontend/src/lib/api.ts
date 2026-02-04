import { DiagnosisResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function diagnoseImage(file: File): Promise<DiagnosisResponse> {
  if (!USE_MOCK && API_BASE) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE}/diagnose`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Failed to diagnose image");
    }
    return (await res.json()) as DiagnosisResponse;
  }

  // TODO: replace mock with backend
  await delay(1200);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    plantName: "Tomato (Solanum lycopersicum)",
    healthStatus: "warning",
    nutrientDeficiencyPercent: 35,
    pestsPercent: 10,
    diseases: [
      { id: "late-blight", name: "Late blight", probability: 0.78 },
      { id: "early-blight", name: "Early blight", probability: 0.41 },
      { id: "septoria-leaf-spot", name: "Septoria leaf spot", probability: 0.23 }
    ],
    createdAt: now
  };
}


// TODO: replace mock with backend
export async function apiLogin(email: string, password: string) {
  if (!API_BASE || USE_MOCK) {
    throw new Error("apiLogin is not implemented in mock mode; use local auth instead.");
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// TODO: replace mock with backend
export async function apiRegister(name: string, email: string, password: string) {
  if (!API_BASE || USE_MOCK) {
    throw new Error("apiRegister is not implemented in mock mode; use local auth instead.");
  }

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// TODO: replace mock with backend
export async function apiListAnalyses() {
  if (!API_BASE || USE_MOCK) {
    throw new Error("apiListAnalyses is not implemented in mock mode; use local history instead.");
  }
  const res = await fetch(`${API_BASE}/analyses`);
  if (!res.ok) throw new Error("Failed to load analyses");
  return res.json();
}

// TODO: replace mock with backend
export async function apiDeleteAnalysis(id: string) {
  if (!API_BASE || USE_MOCK) {
    throw new Error("apiDeleteAnalysis is not implemented in mock mode; use local history instead.");
  }
  const res = await fetch(`${API_BASE}/analyses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete analysis");
}

