import { ApiClientError } from "./errors";

/**
 * Shared API client.
 *
 * Centralizes request construction (base URL, query strings, JSON bodies,
 * credentials) and error/response normalization so that feature code never
 * has to hand-roll `fetch` calls again.
 *
 * - Non-2xx responses throw a normalized {@link ApiClientError}.
 * - JSON responses shaped as `{ success, data, message }` can be unwrapped via
 *   the `envelope: true` option, returning `data` directly.
 * - The default base URL is read from `NEXT_PUBLIC_API_BASE_URL`; when empty,
 *   requests target the current origin (e.g. the app's own `/api/*` routes).
 */

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "method" | "headers"> {
  /** Extra request headers. */
  headers?: Record<string, string>;
  /** Query parameters appended to the URL (undefined/null values are skipped). */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Request body; objects are JSON-serialized automatically. */
  body?: unknown;
  /** Override the base URL for this request. */
  baseUrl?: string;
  /**
   * Treat the JSON response as an envelope `{ success, data, message }` and
   * return `data`. A falsy `success` throws an {@link ApiClientError}.
   */
  envelope?: boolean;
  /** Credentials mode; defaults to `"include"` to send cookies/session. */
  credentials?: RequestCredentials;
}

function joinUrl(baseUrl: string, path: string): string {
  if (baseUrl === "" || /^https?:\/\//i.test(path)) {
    return path;
  }
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function withQuery(
  url: string,
  query?: ApiRequestOptions["query"]
): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  if (!qs) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

async function toApiError(res: Response): Promise<ApiClientError> {
  let message = res.statusText || `Request failed with status ${res.status}`;
  let data: unknown;

  try {
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (data && typeof data === "object") {
        const candidate = (data as Record<string, unknown>).message ??
          (data as Record<string, unknown>).error;
        if (typeof candidate === "string") {
          message = candidate;
        }
      } else if (typeof data === "string" && !/^\s*</.test(data)) {
        message = data;
      }
    }
  } catch {
    // Ignore body-parsing issues; fall back to the status-based message.
  }

  return new ApiClientError(message, res.status, res.statusText, data);
}

async function rawRequest<T>(
  method: HttpMethod,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    query,
    body,
    headers,
    envelope,
    baseUrl = DEFAULT_BASE_URL,
    credentials = "include",
    ...init
  } = options;

  const url = withQuery(joinUrl(baseUrl, path), query);

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    payload =
      typeof body === "string" || body instanceof FormData
        ? body
        : JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    credentials,
    headers: {
      ...(body !== undefined && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body: payload,
    ...init,
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return text as unknown as T;
  }

  if (envelope) {
    const env = json as Partial<ApiEnvelope<T>>;
    if (env && typeof env === "object" && "success" in env) {
      if (env.success === false) {
        throw new ApiClientError(
          env.message ?? `Request failed (${method} ${path})`,
          res.status,
          res.statusText,
          env
        );
      }
      return env.data as T;
    }
  }

  return json as T;
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return rawRequest<T>("GET", path, options);
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return rawRequest<T>("POST", path, { ...options, body });
  },
  put<T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return rawRequest<T>("PUT", path, { ...options, body });
  },
  patch<T>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return rawRequest<T>("PATCH", path, { ...options, body });
  },
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return rawRequest<T>("DELETE", path, options);
  },
  request: rawRequest,
};

export type ApiClient = typeof apiClient;
