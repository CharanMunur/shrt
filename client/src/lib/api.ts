export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  status: number;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : path.startsWith("/api") ? path : `/api/v1${path}`;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData) && typeof options.body !== "string") {
    (headers as any)["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/csv") || contentType.includes("application/octet-stream")) {
    return (await response.text()) as unknown as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = { message: response.statusText || "An error occurred" };
  }

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      code: data.code || "REQUEST_FAILED",
      message: data.message || "Request failed",
      fieldErrors: data.fieldErrors,
    };
    throw error;
  }

  return data;
}
