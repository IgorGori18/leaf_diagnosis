type AnalysisResult = any;

const TOKEN_KEY = "token";
const USER_ID_KEY = "current_user_id";
const RESULT_KEY = "latest_result";

function decodeUserId(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return String(json.sub ?? "");
  } catch {
    return null;
  }
}

export function setSession(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  const userId = decodeUserId(token);
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  }
  localStorage.removeItem(RESULT_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(RESULT_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setLatestResult(result: AnalysisResult) {
  const ownerId = localStorage.getItem(USER_ID_KEY);
  const payload = { ownerId, result };
  localStorage.setItem(RESULT_KEY, JSON.stringify(payload));
}

export function getLatestResult() {
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as { ownerId?: string; result?: AnalysisResult };
    const currentUserId = localStorage.getItem(USER_ID_KEY);
    if (payload.ownerId && payload.ownerId !== currentUserId) {
      return null;
    }
    return payload.result ?? null;
  } catch {
    return null;
  }
}
