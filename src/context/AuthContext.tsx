import React, { createContext, useContext, useState, useEffect } from "react";
import { request, resetCsrf } from "../services/apiClient";
export interface User {
  id: string;
  username: string;
  displayName: string;
  role: "ADMIN" | "READER";
  mustChangePassword: boolean;
}
const Context = createContext<any>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = async () => {
    try {
      setUser(await request<User>("/auth/me"));
      setError("");
    } catch (e) {
      setUser(null);
      if (!(e as any).status) setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    const expire = () => {
      setUser(null);
      resetCsrf();
      sessionStorage.removeItem("archdeck-active");
    };
    window.addEventListener("archdeck-session-expired", expire);
    const storage = (e: StorageEvent) => {
      if (e.key === "archdeck-auth-event") expire();
    };
    window.addEventListener("storage", storage);
    const visibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setUser(null);
        setLoading(true);
        refresh();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pageshow", restore);
    return () => {
      window.removeEventListener("archdeck-session-expired", expire);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pageshow", restore);
    };
  }, []);
  const login = async (username: string, password: string) => {
    resetCsrf();
    await request("/auth/login", {
      method: "POST",
      body: new URLSearchParams({ username, password }),
    });
    resetCsrf();
    await refresh();
  };
  const logout = async () => {
    await request("/auth/logout", { method: "POST" });
    setUser(null);
    resetCsrf();
    localStorage.setItem("archdeck-auth-event", Date.now().toString());
  };
  return (
    <Context.Provider value={{ user, loading, error, refresh, login, logout }}>
      {children}
    </Context.Provider>
  );
}
export const useAuth = () =>
  useContext(Context) as {
    user: User | null;
    loading: boolean;
    error: string;
    refresh: () => Promise<void>;
    login: (u: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
  };
