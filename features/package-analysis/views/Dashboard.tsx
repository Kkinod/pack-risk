"use client";

import { IconShield, IconDownload, IconRefresh } from "@/components/ui/icons";
import { scoreToMeta } from "../utils/risk";
import type { AnalysisReport } from "../types";
import { useDependencyTable } from "./Dashboard/hooks/useDependencyTable";
import { RiskGauge } from "./Dashboard/components/RiskGauge";
import { SeverityPill } from "./Dashboard/components/SeverityPill";
import { DependencyTable } from "./Dashboard/components/DependencyTable";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  report: AnalysisReport;
  density: "normal" | "compact";
  onReset: () => void;
}

export default function Dashboard({
  report,
  density,
  onReset,
}: DashboardProps) {
  const table = useDependencyTable(report.dependencies);
  const scoreMeta = scoreToMeta(report.riskScore);

  return (
    <section className={styles.dash} data-density={density}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1>Security report</h1>
          <div className={styles.meta}>
            <span className={styles.file}>{report.fileName}</span>
            <span>· project: {report.projectName}</span>
            <span>· {new Date(report.analyzedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className="btn">
            <IconDownload size={14} />
            Export report
          </button>
          <button className="btn" onClick={onReset}>
            <IconRefresh size={14} />
            New analysis
          </button>
        </div>
      </header>

      <div className={styles.overview}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Overall risk score</h3>
          <div
            className={styles.riskScore}
            style={
              {
                ["--score-color" as string]: scoreMeta.color,
                ["--score-soft" as string]: scoreMeta.soft,
              } as React.CSSProperties
            }
          >
            <RiskGauge score={report.riskScore} />
            <div className={styles.scoreInfo}>
              <span className={styles.scoreBadge}>{scoreMeta.label}</span>
              <p className={styles.verdict}>{scoreMeta.verdict}</p>
              <p className={styles.scoreDesc}>{scoreMeta.desc}</p>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Dependencies</h3>
          <div className={styles.stat}>
            <span className={styles.statValue}>{report.totalDependencies}</span>
            <span className={styles.statSub}>
              {report.vulnerableDependencies} with known vulnerabilities
            </span>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              <IconShield size={14} />
              <span>
                {report.totalDependencies - report.vulnerableDependencies}{" "}
                packages clean
              </span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Vulnerabilities by severity</h3>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {report.totalVulnerabilities}
            </span>
            <span className={styles.statSub}>
              across {report.vulnerableDependencies} packages
            </span>
            <div className={styles.breakdown}>
              <SeverityPill
                sev="critical"
                count={report.severityBreakdown.critical}
                label="Critical"
              />
              <SeverityPill
                sev="high"
                count={report.severityBreakdown.high}
                label="High"
              />
              <SeverityPill
                sev="medium"
                count={report.severityBreakdown.medium}
                label="Medium"
              />
              <SeverityPill
                sev="low"
                count={report.severityBreakdown.low}
                label="Low"
              />
            </div>
          </div>
        </div>
      </div>

      <DependencyTable {...table} />
    </section>
  );
}
