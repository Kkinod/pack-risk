"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/features/package-analysis/views/Dashboard";
import {
  loadReport,
  clearReport,
} from "@/features/package-analysis/utils/reportStorage";
import type { AnalysisReport } from "@/features/package-analysis/types";
import Shell from "@/components/Shell";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AnalysisReport | null | undefined>(
    undefined
  );

  useEffect(() => {
    const stored = loadReport();
    if (!stored) {
      router.replace("/");
      return;
    }
    setReport(stored);
  }, [router]);

  const onReset = () => {
    clearReport();
    router.push("/");
  };

  if (!report) return null;

  return (
    <Shell step="dashboard">
      <Dashboard report={report} density="normal" onReset={onReset} />
    </Shell>
  );
}
