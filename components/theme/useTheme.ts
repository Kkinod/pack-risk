"use client";

import { useSyncExternalStore } from "react";
import themeStore from "./themeStore";

export function useTheme() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "dark"
  );

  const toggleTheme = () => {
    themeStore.set(theme === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
}
