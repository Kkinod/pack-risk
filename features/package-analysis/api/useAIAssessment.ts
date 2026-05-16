import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetch";
import type { AnalysisReport } from "../types";
import type { AISecurityAssessment } from "../server/ai/types";

interface AIAssessmentResponse {
  assessment: AISecurityAssessment;
}

export function useAIAssessment() {
  return useMutation<AISecurityAssessment, Error, AnalysisReport>({
    mutationFn: async (report) => {
      const data = await apiFetch<AIAssessmentResponse>("/api/ai-assessment", {
        method: "POST",
        body: { report },
      });
      return data.assessment;
    },
  });
}
