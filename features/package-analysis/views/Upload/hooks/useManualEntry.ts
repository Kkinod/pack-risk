import { useState } from "react";
import { t } from "@/locales";

export interface PackageRow {
  id: string;
  name: string;
  version: string;
}

export interface UseManualEntryReturn {
  rows: PackageRow[];
  error: string;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, field: "name" | "version", value: string) => void;
  start: (
    onAnalyze: (input: { fileName: string; content: string }) => void
  ) => void;
}

let counter = 0;
function nextId() {
  return `pkg-${++counter}`;
}

export function useManualEntry(): UseManualEntryReturn {
  const [rows, setRows] = useState<PackageRow[]>([
    { id: nextId(), name: "", version: "" },
  ]);
  const [error, setError] = useState<string>("");

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId(), name: "", version: "" }]);
    setError("");
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setError("");
  };

  const updateRow = (id: string, field: "name" | "version", value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    setError("");
  };

  const start = (
    onAnalyze: (input: { fileName: string; content: string }) => void
  ) => {
    const filled = rows.filter((r) => r.name.trim() || r.version.trim());

    if (filled.length === 0) {
      setError(t.upload.errors.manualEntryEmpty);
      return;
    }

    const invalid = filled.find((r) => !r.name.trim());
    if (invalid) {
      setError(t.upload.errors.manualEntryInvalidRow);
      return;
    }

    const deps: Record<string, string> = {};
    for (const row of filled) {
      deps[row.name.trim()] = row.version.trim() || "*";
    }

    const content = JSON.stringify({ dependencies: deps }, null, 2);
    onAnalyze({ fileName: "manual-entry.json", content });
  };

  return { rows, error, addRow, removeRow, updateRow, start };
}
