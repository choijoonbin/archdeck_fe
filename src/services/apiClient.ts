import { Topic, ComparisonMatrix, GlossaryTerm, ChecklistItem } from "../types";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
let csrf: { token: string; headerName: string } | null = null;
export async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method || "GET";
  const headers = new Headers(options.headers);
  if (!["GET", "HEAD"].includes(method)) {
    if (!csrf) csrf = await request("/auth/csrf");
    headers.set(csrf.headerName || "X-CSRF-TOKEN", csrf.token);
    if (options.body && !(options.body instanceof URLSearchParams))
      headers.set("Content-Type", "application/json");
  }
  const res = await fetch("/api" + path, {
    ...options,
    headers,
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal || AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("archdeck-session-expired"));
    let message =
      res.status === 401
        ? "아이디 또는 비밀번호를 확인해 주세요."
        : res.status === 403
          ? "이 작업을 수행할 권한이 없습니다."
          : res.status === 409
            ? "다른 변경이 있습니다. 새로고침 후 다시 확인해 주세요."
            : "요청을 완료하지 못했습니다. 다시 시도해 주세요.";
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}
export function resetCsrf() {
  csrf = null;
}
export const apiService = {
  getTopics: () => request<Topic[]>("/topics"),
  getComparisons: () => request<ComparisonMatrix[]>("/comparisons"),
  getGlossary: () => request<GlossaryTerm[]>("/glossary"),
  getChecklists: () => request<ChecklistItem[]>("/checklists"),
  saveCustomTopic: async (topic: Topic) => {
    await request("/topics", { method: "POST", body: JSON.stringify(topic) });
    return true;
  },
  saveCustomGlossary: async (term: GlossaryTerm) => {
    await request("/glossary", { method: "POST", body: JSON.stringify(term) });
    return true;
  },
};
