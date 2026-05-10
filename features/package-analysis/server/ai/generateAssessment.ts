import { z } from "zod";
import type { AnalysisReport } from "../../types";
import { buildAIInput } from "./buildAIInput";
import { SYSTEM_PROMPT, buildUserPrompt } from "./buildPrompt";
import { getOpenAIClient, type OpenAIClient } from "./openaiClient";
import type { AISecurityAssessment } from "./types";

const MAX_OUTPUT_TOKENS = 2000;

export class AIAssessmentError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AIAssessmentError";
  }
}

const repairPrioritySchema = z.object({
  packageName: z.string().min(1),
  reason: z.string().min(1),
  action: z.string().min(1),
});

const keyPackageReasoningSchema = z.object({
  packageName: z.string().min(1),
  reasoning: z.string().min(1),
});

const dependencyRecommendationSchema = z.object({
  packageName: z.string().min(1),
  recommendation: z.string().min(1),
});

const assessmentSchema = z.object({
  generalAssessment: z.string().min(1),
  riskExplanation: z.string().min(1),
  repairPriorities: z.array(repairPrioritySchema).default([]),
  keyPackagesReasoning: z.array(keyPackageReasoningSchema).default([]),
  dependencyRecommendations: z
    .array(dependencyRecommendationSchema)
    .default([]),
});

function parseAssessment(raw: string): AISecurityAssessment {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new AIAssessmentError("AI response is not valid JSON", {
      cause: err,
    });
  }

  const result = assessmentSchema.safeParse(parsed);
  if (!result.success) {
    throw new AIAssessmentError(
      `AI response failed schema validation: ${result.error.message}`,
      { cause: result.error }
    );
  }
  return result.data;
}

export async function generateAssessment(
  report: AnalysisReport,
  options?: { client?: OpenAIClient; signal?: AbortSignal }
): Promise<AISecurityAssessment> {
  const client = options?.client ?? getOpenAIClient();
  const input = buildAIInput(report);

  let response;
  try {
    response = await client.createChatCompletion(
      {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: "json_object" },
      },
      { signal: options?.signal }
    );
  } catch (err) {
    throw new AIAssessmentError("AI provider request failed", { cause: err });
  }

  const choice = response.choices?.[0];
  if (!choice) {
    throw new AIAssessmentError("AI response has no choices");
  }

  if (choice.finish_reason === "length") {
    throw new AIAssessmentError(
      `AI response truncated (max_tokens=${MAX_OUTPUT_TOKENS} reached)`
    );
  }
  if (choice.finish_reason === "content_filter") {
    throw new AIAssessmentError("AI response blocked by content filter");
  }

  const content = choice.message?.content;
  if (!content) {
    throw new AIAssessmentError("AI response has no content");
  }

  return parseAssessment(content);
}
