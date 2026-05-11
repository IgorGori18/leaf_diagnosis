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
  sessionStorage.setItem(TOKEN_KEY, token);
  const userId = decodeUserId(token);
  if (userId) {
    sessionStorage.setItem(USER_ID_KEY, userId);
  }
  sessionStorage.removeItem(RESULT_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(RESULT_KEY);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setLatestResult(result: AnalysisResult) {
  const ownerId = sessionStorage.getItem(USER_ID_KEY);
  const payload = { ownerId, result };
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(payload));
}

export function getLatestResult() {
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as { ownerId?: string; result?: AnalysisResult };
    const currentUserId = sessionStorage.getItem(USER_ID_KEY);
    if (payload.ownerId && payload.ownerId !== currentUserId) {
      return null;
    }
    return payload.result ?? null;
  } catch {
    return null;
  }
}
