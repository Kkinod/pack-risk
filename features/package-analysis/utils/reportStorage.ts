import type { AnalysisReport } from "../types";

const KEY = "packrisk:report";

export function saveReport(report: AnalysisReport) {
  sessionStorage.setItem(KEY, JSON.stringify(report));
}

export function loadReport(): AnalysisReport | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalysisReport;
  } catch {
    return null;
  }
}

export function clearReport() {
  sessionStorage.removeItem(KEY);
}
