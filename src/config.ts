declare global {
  interface Window {
    PUC_ENCONTRA_CONFIG?: {
      apiBaseUrl?: string;
    };
  }
}

const runtimeApiBaseUrl = window.PUC_ENCONTRA_CONFIG?.apiBaseUrl?.trim().replace(/\/+$/, "");

export const DEFAULT_API_BASE_URL = runtimeApiBaseUrl || "http://127.0.0.1:8000/api";

export const STORAGE_KEYS = {
  token: "puc-token",
  user: "puc-user",
  bootstrap: "puc-bootstrap",
} as const;

export const FALLBACK_OBJECT_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80";
