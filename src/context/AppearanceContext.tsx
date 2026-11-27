import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
const defaults = {
  mode: "system",
  preset: "dwp-blue",
  placement: "left",
  collapsed: false,
  density: "standard",
  highContrast: false,
  reduceMotion: false,
};
function sanitize(value: any) {
  const next = { ...defaults };
  if (!value || typeof value !== "object") return next;
  for (const [key, allowed] of Object.entries({
    mode: ["system", "light", "dark"],
    preset: ["dwp-blue", "archdeck-cyan", "indigo", "emerald"],
    placement: ["left", "right", "top"],
    density: ["compact", "standard", "comfortable"],
  }))
    if (allowed.includes(value[key])) next[key] = value[key];
  for (const key of ["collapsed", "highContrast", "reduceMotion"])
    if (typeof value[key] === "boolean") next[key] = value[key];
  return next;
}
const Context = createContext<any>(null);
export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const key = "archdeck:appearance:v1:" + location.origin + ":" + user.id;
  const [preferences, setPreferences] = useState(() => {
    try {
      return sanitize(JSON.parse(localStorage.getItem(key) || "{}"));
    } catch {
      return defaults;
    }
  });
  const [systemDark, setSystemDark] = useState(
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setSystemDark(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setPreferences(sanitize(JSON.parse(event.newValue || "{}")));
        } catch {
          setPreferences(defaults);
        }
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [key]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme =
      preferences.mode === "system"
        ? systemDark
          ? "dark"
          : "light"
        : preferences.mode;
    root.dataset.preset = preferences.preset;
    root.dataset.density = preferences.density;
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.motion = preferences.reduceMotion ? "reduced" : "full";
    try {
      localStorage.setItem(key, JSON.stringify(preferences));
    } catch {}
  }, [preferences, systemDark, key]);
  return (
    <Context.Provider
      value={{
        preferences,
        setPreferences,
        reset: () => setPreferences(defaults),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAppearance = () => useContext(Context);
