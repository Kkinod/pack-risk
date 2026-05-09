import type { AnalysisReport } from "../types";
import {
  buildReportExport,
  buildExportFileName,
  triggerBlobDownload,
} from "./exportReport";

export async function downloadReportPdf(report: AnalysisReport): Promise<void> {
  const data = buildReportExport(report);
  const { renderReportPdfBlob } = await import("./ReportPdfDocument");
  const blob = await renderReportPdfBlob(data);
  triggerBlobDownload(blob, buildExportFileName(report.projectName, "pdf"));
}
