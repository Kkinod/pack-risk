import { NextResponse } from "next/server";
import {
  AIAssessmentError,
  generateAssessment,
} from "@/features/package-analysis/server/ai/generateAssessment";
import { MissingApiKeyError } from "@/features/package-analysis/server/ai/openaiClient";
import type { AnalysisReport } from "@/features/package-analysis/types";

export async function POST(request: Request) {
  let body: { report?: AnalysisReport };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const report = body.report;
  if (
    !report ||
    typeof report !== "object" ||
    !Array.isArray(report.dependencies)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid report" },
      { status: 400 }
    );
  }

  try {
    const assessment = await generateAssessment(report);
    return NextResponse.json({ assessment });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      console.error("[ai-assessment] missing API key");
      return NextResponse.json(
        { error: "AI assessment not configured" },
        { status: 503 }
      );
    }
    if (err instanceof AIAssessmentError) {
      console.error(
        "[ai-assessment] generation failed:",
        err.message,
        err.cause
      );
      return NextResponse.json(
        { error: "AI assessment generation failed" },
        { status: 502 }
      );
    }
    console.error("[ai-assessment] unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
