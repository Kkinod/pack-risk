"use client";

import { useState, useEffect } from "react";
import Upload from "@/features/package-analysis/views/Upload";
import Loading from "@/features/package-analysis/views/Loading";
import Dashboard from "@/features/package-analysis/views/Dashboard";
import { MOCK_REPORT } from "@/features/package-analysis/data/mockData";
import type { Screen, AnalysisReport } from "@/features/package-analysis/types";
import styles from "./AppShell.module.scss";

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [pendingFile, setPendingFile] = useState<{
    fileName: string;
    content: string;
  } | null>(null);
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return localStorage.getItem("dra-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("dra-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const onAnalyze = (input: { fileName: string; content: string }) => {
    setPendingFile(input);
    setScreen("loading");
  };

  const onComplete = () => setScreen("dashboard");

  const onReset = () => {
    setPendingFile(null);
    setScreen("upload");
  };

  const report: AnalysisReport = pendingFile
    ? { ...MOCK_REPORT, fileName: pendingFile.fileName }
    : MOCK_REPORT;

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>PR</div>
          <div>
            <div className={styles.brandName}>PackRisk</div>
          </div>
          <span className={styles.brandTag}>v0.1 · MVP</span>
        </div>
        <nav className={styles.nav} aria-label="Progress">
          <span
            className={`${styles.navStep} ${screen === "upload" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> Upload
          </span>
          <span className={styles.navSep}>›</span>
          <span
            className={`${styles.navStep} ${screen === "loading" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> Analyze
          </span>
          <span className={styles.navSep}>›</span>
          <span
            className={`${styles.navStep} ${screen === "dashboard" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> Report
          </span>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {theme === "dark" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        {screen === "upload" && <Upload onAnalyze={onAnalyze} />}
        {screen === "loading" && <Loading onComplete={onComplete} />}
        {screen === "dashboard" && (
          <Dashboard report={report} density="normal" onReset={onReset} />
        )}
      </main>
    </div>
  );
}
