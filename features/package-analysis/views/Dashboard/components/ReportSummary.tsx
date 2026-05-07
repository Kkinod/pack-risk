"use client";

import type { AnalysisReport } from "../../../types";
import { t } from "@/locales";
import { RiskTag } from "./RiskTag";
import styles from "./ReportSummary.module.scss";

interface ReportSummaryProps {
  report: AnalysisReport;
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const hasCritical = report.criticalDependencies.length > 0;
  const hasRecs = report.topRecommendations.length > 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.dashboard.summarySection.title}</h2>
      <p className={styles.summary}>{report.summary}</p>

      {(hasCritical || hasRecs) && (
        <div className={styles.columns}>
          {hasCritical && (
            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                {t.dashboard.summarySection.criticalDepsLabel}
              </h3>
              <ul className={styles.depList}>
                {report.criticalDependencies.map((dep) => (
                  <li key={dep.name} className={styles.depItem}>
                    <span className={styles.depName}>{dep.name}</span>
                    <RiskTag level={dep.riskLevel} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasRecs && (
            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                {t.dashboard.summarySection.topRecsLabel}
              </h3>
              <ol className={styles.recList}>
                {report.topRecommendations.map((rec, i) => (
                  <li key={i} className={styles.recItem}>
                    {rec}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
