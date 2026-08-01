"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Upload from "@/features/package-analysis/views/Upload/Upload";
import Loading from "@/features/package-analysis/views/Loading";
import { useAnalyze } from "@/features/package-analysis/api/useAnalyze";
import { saveReport } from "@/features/package-analysis/utils/reportStorage";
import type { AnalysisReport } from "@/features/package-analysis/types";
import { t } from "@/locales";
import Shell from "./Shell";

export default function AppShell() {
  const router = useRouter();
  const [screen, setScreen] = useState<"upload" | "loading">("upload");
  const analyze = useAnalyze();
  const pendingPromise = useRef<Promise<AnalysisReport> | null>(null);

  const onAnalyze = (input: { fileName: string; content: string }) => {
    analyze.reset();
    pendingPromise.current = analyze.mutateAsync(input);
    pendingPromise.current.catch(() => {});
    setScreen("loading");
  };

  const onComplete = async () => {
    try {
      const report = await pendingPromise.current;
      if (report) {
        saveReport(report);
        router.push("/report");
      }
    } catch {
      setScreen("upload");
    } finally {
      pendingPromise.current = null;
    }
  };

  const serverError =
    analyze.isError && screen === "upload"
      ? t.upload.errors.analysisFailed
      : undefined;

  return (
    <Shell step={screen}>
      {screen === "upload" && (
        <Upload onAnalyze={onAnalyze} serverError={serverError} />
      )}
      {screen === "loading" && <Loading onComplete={onComplete} />}
    </Shell>
  );
}
