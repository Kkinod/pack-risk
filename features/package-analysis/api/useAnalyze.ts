import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetch";
import type { AnalysisReport } from "../types";

interface AnalyzeInput {
  fileName: string;
  content: string;
}

export function useAnalyze() {
  return useMutation<AnalysisReport, Error, AnalyzeInput>({
    mutationFn: (input) =>
      apiFetch<AnalysisReport>("/api/analyze", {
        method: "POST",
        body: input,
      }),
  });
}
