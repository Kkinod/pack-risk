"use client";

import { IconChevronRight, IconAlert } from "@/components/ui/icons";
import type { Dependency, RiskLevel } from "../../../types";
import { RiskTag } from "./RiskTag";
import { t } from "@/locales";
import styles from "./DependencyRow.module.scss";

export function DependencyRow({
  dep,
  expanded,
  onToggle,
}: {
  dep: Dependency;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasVulns = dep.vulnerabilities.length > 0;
  return (
    <>
      <tr
        className={expanded ? styles.rowExpanded : ""}
        onClick={hasVulns ? onToggle : undefined}
        style={{ cursor: hasVulns ? "pointer" : "default" }}
      >
        <td>
          <div className={styles.pkg}>
            {hasVulns ? (
              <span
                className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
              >
                <IconChevronRight size={14} />
              </span>
            ) : (
              <span style={{ width: 14, display: "inline-block" }} />
            )}
            <span className={styles.pkgName}>{dep.name}</span>
            {dep.type !== "prod" && (
              <span className={styles.pkgType}>{dep.type}</span>
            )}
          </div>
        </td>
        <td>
          <span className={styles.version}>{dep.version}</span>
          {dep.fixedIn && (
            <span className={styles.fixedIn}>→ {dep.fixedIn}</span>
          )}
        </td>
        <td>
          {dep.latestVersion ? (
            <span className={styles.latest}>{dep.latestVersion}</span>
          ) : (
            <span className={styles.latestUnknown}>
              {t.dashboard.depRow.latestUnknown}
            </span>
          )}
        </td>
        <td>
          <span
            className={`${styles.vulnCount} ${hasVulns ? styles.vulnCountHas : styles.vulnCountZero}`}
          >
            {dep.vulnerabilities.length}
          </span>
        </td>
        <td>
          <RiskTag level={dep.riskLevel} />
        </td>
        <td className={styles.rec}>{dep.recommendation}</td>
      </tr>
      {expanded && hasVulns && (
        <tr>
          <td colSpan={6} className={styles.expandRowCell}>
            <div className={styles.cve}>
              <div className={styles.cveHeader}>
                <h4 className={styles.cveTitle}>
                  <IconAlert size={12} />{" "}
                  {t.dashboard.depRow.knownVulns(dep.vulnerabilities.length)}
                </h4>
              </div>
              <ul className={styles.cveList}>
                {dep.vulnerabilities.map((v) => (
                  <li key={v.id} className={styles.cveItem}>
                    <span className={styles.cveId}>{v.id}</span>
                    <span className={styles.cveSummary}>{v.summary}</span>
                    <span className={styles.cveMeta}>
                      {v.cvss !== undefined && (
                        <span className={styles.cvss}>
                          CVSS {v.cvss.toFixed(1)}
                        </span>
                      )}
                      <RiskTag level={v.severity as RiskLevel} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
