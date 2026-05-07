"use client";

import type { Dependency, Severity } from "../../../types";
import { t } from "@/locales";
import styles from "./TopIssues.module.scss";

interface TopIssuesProps {
  dependencies: Dependency[];
}

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

function getDominantSeverity(
  dep: Dependency
): { severity: Severity; count: number } | null {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const v of dep.vulnerabilities) counts[v.severity]++;
  for (const sev of SEVERITY_ORDER) {
    if (counts[sev] > 0) return { severity: sev, count: counts[sev] };
  }
  return null;
}

export function TopIssues({ dependencies }: TopIssuesProps) {
  if (dependencies.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t.topIssues.title}</h2>
      <ul className={styles.list}>
        {dependencies.map((dep) => {
          const dominant = getDominantSeverity(dep);
          const depTypeLabel = t.topIssues.depType[dep.type];
          const priorityLabel =
            dep.riskLevel !== "safe"
              ? t.topIssues.priority[dep.riskLevel]
              : null;
          const reason = dominant
            ? t.topIssues.reason(
                depTypeLabel,
                dominant.count,
                t.risk[dominant.severity].label.toLowerCase()
              )
            : null;

          return (
            <li
              key={dep.name}
              className={styles.item}
              data-risk={dep.riskLevel}
            >
              <div className={styles.headRow}>
                <span className={styles.depName}>{dep.name}</span>
                {priorityLabel && (
                  <span
                    className={styles.priorityBadge}
                    data-risk={dep.riskLevel}
                  >
                    {priorityLabel}
                  </span>
                )}
              </div>
              {reason && <p className={styles.reason}>{reason}</p>}
              <p className={styles.action}>{dep.recommendation}</p>
            </li>
          );
        })}
      </ul>
      <p className={styles.helper}>{t.topIssues.helper}</p>
    </section>
  );
}
