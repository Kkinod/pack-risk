import type { AnalysisReport } from "../../types";
import { buildAIInput } from "./buildAIInput";
import { SYSTEM_PROMPT, buildUserPrompt } from "./buildPrompt";
import { createOpenAIClient, type OpenAIClient } from "./openaiClient";
import type { AISecurityAssessment } from "./types";

export class AIAssessmentError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIAssessmentError";
  }
}

function isStringArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseAssessment(raw: string): AISecurityAssessment {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new AIAssessmentError("AI response is not valid JSON", err);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new AIAssessmentError("AI response is not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  const generalAssessment = asString(obj.generalAssessment);
  const riskExplanation = asString(obj.riskExplanation);

  if (!generalAssessment || !riskExplanation) {
    throw new AIAssessmentError("AI response missing required string fields");
  }

  const repairPriorities = isStringArray(obj.repairPriorities)
    ? obj.repairPriorities.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const r = item as Record<string, unknown>;
        return [
          {
            packageName: asString(r.packageName),
            reason: asString(r.reason),
            action: asString(r.action),
          },
        ];
      })
    : [];

  const keyPackagesReasoning = isStringArray(obj.keyPackagesReasoning)
    ? obj.keyPackagesReasoning.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const r = item as Record<string, unknown>;
        return [
          {
            packageName: asString(r.packageName),
            reasoning: asString(r.reasoning),
          },
        ];
      })
    : [];

  const dependencyRecommendations = isStringArray(obj.dependencyRecommendations)
    ? obj.dependencyRecommendations.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const r = item as Record<string, unknown>;
        return [
          {
            packageName: asString(r.packageName),
            recommendation: asString(r.recommendation),
          },
        ];
      })
    : [];

  return {
    generalAssessment,
    riskExplanation,
    repairPriorities,
    keyPackagesReasoning,
    dependencyRecommendations,
  };
}

export async function generateAssessment(
  report: AnalysisReport,
  client: OpenAIClient = createOpenAIClient()
): Promise<AISecurityAssessment> {
  const input = buildAIInput(report);

  let response;
  try {
    response = await client.createChatCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
  } catch (err) {
    throw new AIAssessmentError("AI provider request failed", err);
  }

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIAssessmentError("AI response has no content");
  }

  return parseAssessment(content);
}
