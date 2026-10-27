const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ code?: string; message?: string }>;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to the API. Check that the backend is running.");
  }

  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new Error(
      body?.message || body?.errors?.[0]?.message || `Request failed (${response.status})`,
    );
  }
  return body.data as T;
}

export const jsonBody = (value: unknown): string => JSON.stringify(value);
