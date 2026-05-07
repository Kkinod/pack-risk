"use client";

import { useState } from "react";
import { IconDownload } from "@/components/ui/icons";
import { downloadReportJson } from "../../../utils/exportReport";
import { downloadReportPdf } from "../../../utils/exportReportPdf";
import type { AnalysisReport } from "../../../types";
import { t } from "@/locales";
import styles from "./ExportControl.module.scss";

type ExportFormat = "json" | "pdf";

interface ExportControlProps {
  report: AnalysisReport;
}

export function ExportControl({ report }: ExportControlProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setHasError(false);
    setIsExporting(true);
    try {
      if (format === "json") {
        downloadReportJson(report);
      } else {
        await downloadReportPdf(report);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={styles.group}>
        <select
          className={styles.select}
          value={format}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          disabled={isExporting}
          aria-label={t.dashboard.exportFormat.label}
        >
          <option value="json">{t.dashboard.exportFormat.json}</option>
          <option value="pdf">{t.dashboard.exportFormat.pdf}</option>
        </select>
        <button className="btn" onClick={handleExport} disabled={isExporting}>
          <IconDownload size={14} />
          {isExporting ? t.dashboard.exporting : t.dashboard.exportReport}
        </button>
      </div>
      {hasError ? (
        <span className={styles.error} role="alert">
          {t.dashboard.exportError}
        </span>
      ) : null}
    </>
  );
}
