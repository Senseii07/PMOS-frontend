/**
 * Typed API client for the Django backend.
 *
 * Usage (server component / route handler):
 *   import { createApiClient } from "@/lib/api";
 *   const api = createApiClient(session.accessToken);
 *   const meals = await api.health.listMeals();
 *
 * Usage (client component — access token from useSession):
 *   const { data: session } = useSession();
 *   const api = createApiClient(session?.accessToken);
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://pmos-backend-ss6g.onrender.com";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  detail: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface MealLog {
  id: number;
  food_query: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  timestamp: string;
}

export interface SymptomLog {
  id: number;
  symptom: string;
  severity: 1 | 2 | 3;
  notes: string;
  timestamp: string;
}

export interface WaterLog {
  id: number;
  amount_ml: number;
  timestamp: string;
}

export interface WeightLog {
  id: number;
  weight_kg: number;
  timestamp: string;
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatResponse {
  session_id: number;
  user_message: { role: "user"; content: string };
  assistant_message: { role: "assistant"; content: string };
}

export interface UserProfile {
  display_name: string;
  bio: string;
  avatar_url: string;
  consent_symptom_logging: boolean;
  consent_ai_context: boolean;
}

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string | undefined,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      // ignore JSON parse errors
    }
    const err: ApiError = { status: res.status, detail };
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Client factory ────────────────────────────────────────────────────────────

export function createApiClient(token: string | undefined) {
  const get = <T>(path: string) => apiFetch<T>(path, token);
  const post = <T>(path: string, body: unknown) =>
    apiFetch<T>(path, token, { method: "POST", body: JSON.stringify(body) });
  const patch = <T>(path: string, body: unknown) =>
    apiFetch<T>(path, token, { method: "PATCH", body: JSON.stringify(body) });
  const del = (path: string) =>
    apiFetch<void>(path, token, { method: "DELETE" });

  return {
    health: {
      listMeals: () => get<PaginatedResponse<MealLog>>("/api/health/meals/"),
      createMeal: (data: { food_query: string }) =>
        post<MealLog>("/api/health/meals/", data),
      deleteMeal: (id: number) => del(`/api/health/meals/${id}/`),

      listSymptoms: () =>
        get<PaginatedResponse<SymptomLog>>("/api/health/symptoms/"),
      createSymptom: (data: Omit<SymptomLog, "id" | "timestamp">) =>
        post<SymptomLog>("/api/health/symptoms/", data),

      listWater: () =>
        get<PaginatedResponse<WaterLog>>("/api/health/water/"),
      createWater: (data: { amount_ml: number }) =>
        post<WaterLog>("/api/health/water/", data),

      listWeight: () =>
        get<PaginatedResponse<WeightLog>>("/api/health/weight/"),
      createWeight: (data: { weight_kg: number }) =>
        post<WeightLog>("/api/health/weight/", data),
    },

    campaigns: {
      list: () => get<PaginatedResponse<Campaign>>("/api/campaigns/"),
      get: (id: number) => get<Campaign>(`/api/campaigns/${id}/`),
    },

    assistant: {
      listSessions: () =>
        get<PaginatedResponse<ChatSession>>("/api/assistant/sessions/"),
      getSession: (id: number) =>
        get<ChatSession>(`/api/assistant/sessions/${id}/`),
      deleteSession: (id: number) =>
        del(`/api/assistant/sessions/${id}/`),
      chat: (message: string, sessionId?: number) =>
        post<ChatResponse>("/api/assistant/chat/", {
          message,
          session_id: sessionId ?? null,
        }),
    },

    users: {
      me: () => get<{ id: number; email: string; role: string }>("/api/auth/me/"),
      profile: () => get<UserProfile>("/api/auth/profile/"),
      updateProfile: (data: Partial<UserProfile>) =>
        patch<UserProfile>("/api/auth/profile/", data),
    },
  };
}
