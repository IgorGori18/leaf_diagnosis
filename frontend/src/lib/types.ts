export type HealthStatus = "healthy" | "warning" | "critical";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface DiseaseEntry {
  id: string;
  name: string;
  probability: number; 
}

export interface DiagnosisResponse {
  id: string;
  plantName: string;
  healthStatus: HealthStatus;
  nutrientDeficiencyPercent: number;
  pestsPercent: number;
  diseases: DiseaseEntry[];
  createdAt: string;
}

export interface AnalysisHistoryItem {
  id: string;
  userId: string;
  imageName: string;
  thumbnailDataUrl: string;
  response: DiagnosisResponse;
  createdAt: string;
}

