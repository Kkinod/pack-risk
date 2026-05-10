import { describe, expect, it, vi } from "vitest";
import { AIAssessmentError, generateAssessment } from "./generateAssessment";
import type { OpenAIClient } from "./openaiClient";
import type { AnalysisReport } from "../../types";

function makeReport(): AnalysisReport {
  return {
    fileName: "package.json",
    projectName: "test-app",
    analyzedAt: "2024-01-01T00:00:00Z",
    riskScore: 30,
    totalDependencies: 2,
    vulnerableDependencies: 1,
    totalVulnerabilities: 1,
    severityBreakdown: { critical: 0, high: 1, medium: 0, low: 0 },
    dependencies: [
      {
        name: "lodash",
        version: "4.17.20",
        type: "prod",
        vulnerabilities: [
          {
            id: "GHSA-001",
            summary: "Prototype pollution",
            severity: "high",
            publishedAt: "2024-01-01T00:00:00Z",
            aliases: [],
            references: [],
            impact: "x",
          },
        ],
        riskLevel: "high",
        recommendation: "upgrade",
        fixedIn: "4.17.21",
        latestVersion: "4.17.21",
      },
    ],
    criticalDependencies: [],
    topRecommendations: ["lodash: upgrade to 4.17.21"],
    summary: "summary",
  };
}

function makeClient(content: string): OpenAIClient {
  return {
    model: "gpt-4o-mini",
    createChatCompletion: vi.fn().mockResolvedValue({
      choices: [
        { message: { role: "assistant", content }, finish_reason: "stop" },
      ],
    }),
  };
}

describe("generateAssessment", () => {
  it("parses a valid JSON response into an AISecurityAssessment", async () => {
    const aiPayload = {
      generalAssessment: "Project has one high-severity issue.",
      riskExplanation: "One package needs an upgrade.",
      repairPriorities: [
        {
          packageName: "lodash",
          reason: "high severity",
          action: "upgrade to 4.17.21",
        },
      ],
      keyPackagesReasoning: [
        { packageName: "lodash", reasoning: "production dep, exploitable" },
      ],
      dependencyRecommendations: [
        { packageName: "lodash", recommendation: "Upgrade to 4.17.21" },
      ],
    };
    const client = makeClient(JSON.stringify(aiPayload));
    const result = await generateAssessment(makeReport(), { client });

    expect(result.generalAssessment).toContain("high-severity");
    expect(result.repairPriorities).toHaveLength(1);
    expect(result.repairPriorities[0].packageName).toBe("lodash");
    expect(result.dependencyRecommendations[0].recommendation).toContain(
      "4.17.21"
    );
  });

  it("sends system + user messages with json_object response_format", async () => {
    const client = makeClient(
      JSON.stringify({
        generalAssessment: "ok",
        riskExplanation: "ok",
        repairPriorities: [],
        keyPackagesReasoning: [],
        dependencyRecommendations: [],
      })
    );
    await generateAssessment(makeReport(), { client });

    const call = vi.mocked(client.createChatCompletion).mock.calls[0][0];
    expect(call.messages[0].role).toBe("system");
    expect(call.messages[1].role).toBe("user");
    expect(call.response_format).toEqual({ type: "json_object" });
    expect(call.messages[1].content).toContain("test-app");
  });

  it("throws AIAssessmentError when AI returns invalid JSON", async () => {
    const client = makeClient("not json at all");
    await expect(
      generateAssessment(makeReport(), { client })
    ).rejects.toBeInstanceOf(AIAssessmentError);
  });

  it("throws AIAssessmentError when required fields are missing", async () => {
    const client = makeClient(JSON.stringify({ repairPriorities: [] }));
    await expect(
      generateAssessment(makeReport(), { client })
    ).rejects.toBeInstanceOf(AIAssessmentError);
  });

  it("throws AIAssessmentError when provider call fails", async () => {
    const client: OpenAIClient = {
      model: "gpt-4o-mini",
      createChatCompletion: vi
        .fn()
        .mockRejectedValue(new Error("network down")),
    };
    await expect(
      generateAssessment(makeReport(), { client })
    ).rejects.toBeInstanceOf(AIAssessmentError);
  });

  it("defaults missing arrays to empty arrays", async () => {
    const client = makeClient(
      JSON.stringify({
        generalAssessment: "ok",
        riskExplanation: "ok",
      })
    );
    const result = await generateAssessment(makeReport(), { client });
    expect(result.repairPriorities).toEqual([]);
    expect(result.keyPackagesReasoning).toEqual([]);
    expect(result.dependencyRecommendations).toEqual([]);
  });
});
