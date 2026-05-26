const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://api.localhost";

let csrfPrimed = false;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : undefined;
}

/**
 * Sanctum SPA: prime the XSRF-TOKEN cookie before any state-changing request.
 * Idempotent within a session; call once on app start or before first mutation.
 */
export async function getCsrfCookie(): Promise<void> {
  if (csrfPrimed) return;
  const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to prime CSRF cookie: ${res.status}`);
  }
  csrfPrimed = true;
}

type FetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Fetch wrapper for the Laravel API.
 * - Automatically sends cookies (Sanctum session)
 * - Attaches X-XSRF-TOKEN header from the cookie set by Sanctum
 * - For mutating verbs, primes the CSRF cookie first
 */
export async function fetchApi<T = unknown>(
  path: string,
  init: FetchInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const isMutating = method !== "GET" && method !== "HEAD";

  if (isMutating) await getCsrfCookie();

  const xsrf = readCookie("XSRF-TOKEN");
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    ...init.headers,
  };

  const res = await fetch(
    `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`,
    {
      ...init,
      method,
      credentials: "include",
      headers,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} → ${res.status} ${text}`);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export { API_URL };
