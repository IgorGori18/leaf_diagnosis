import { AnalysisHistoryItem, DiagnosisResponse } from "./types";

const ANALYSES_KEY = "analyses";

function readAll(): AnalysisHistoryItem[] {
  const raw = localStorage.getItem(ANALYSES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AnalysisHistoryItem[];
  } catch {
    return [];
  }
}

function writeAll(items: AnalysisHistoryItem[]) {
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(items));
}

export function saveAnalysis(params: {
  userId: string;
  imageName: string;
  thumbnailDataUrl: string;
  response: DiagnosisResponse;
  createdAt: string;
}): AnalysisHistoryItem {
  const all = readAll();
  const item: AnalysisHistoryItem = {
    id: crypto.randomUUID(),
    ...params
  };
  all.unshift(item);
  writeAll(all);
  return item;
}

export function listAnalyses(userId: string): AnalysisHistoryItem[] {
  return readAll().filter((a) => a.userId === userId);
}

export function deleteAnalysis(id: string): void {
  const all = readAll();
  const next = all.filter((a) => a.id !== id);
  writeAll(next);
}

