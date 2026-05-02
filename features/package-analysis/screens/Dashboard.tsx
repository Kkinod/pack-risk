"use client";

import { useMemo, useState } from "react";
import {
  IconSearch,
  IconChevronRight,
  IconShield,
  IconAlert,
  IconRefresh,
  IconDownload,
} from "@/components/ui/icons";
import { scoreToMeta, riskLevelMeta } from "../utils/risk";
import type { AnalysisReport, Dependency, RiskLevel, Severity } from "../types";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  report: AnalysisReport;
  density: "normal" | "compact";
  onReset: () => void;
}

type SortKey = "name" | "version" | "vulns" | "risk";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  safe: 0,
};

const RISK_FILTERS: Array<{ id: RiskLevel | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "safe", label: "Safe" },
];

function RiskTag({ level }: { level: RiskLevel }) {
  const meta = riskLevelMeta(level);
  return (
    <span
      className={styles.riskTag}
      style={
        {
          ["--tag-color" as string]: meta.color,
          ["--tag-soft" as string]: meta.soft,
        } as React.CSSProperties
      }
    >
      <span className={styles.tagDot} />
      {meta.label}
    </span>
  );
}

function SeverityPill({
  count,
  label,
  sev,
}: {
  count: number;
  label: string;
  sev: Severity;
}) {
  const colorMap: Record<Severity, string> = {
    critical: "var(--risk-critical)",
    high: "var(--risk-high)",
    medium: "var(--risk-medium)",
    low: "var(--risk-low)",
  };
  return (
    <div
      className={styles.severityPill}
      style={
        { ["--sev-color" as string]: colorMap[sev] } as React.CSSProperties
      }
    >
      <span className={styles.pillCount}>{count}</span>
      <span className={styles.pillLabel}>{label}</span>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const meta = scoreToMeta(score);
  const r = 60;
  const C = 2 * Math.PI * r;
  const offset = C - (score / 100) * C;
  return (
    <div
      className={styles.gauge}
      style={
        {
          ["--score-color" as string]: meta.color,
          ["--score-soft" as string]: meta.soft,
        } as React.CSSProperties
      }
    >
      <svg viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={r}
          strokeWidth="10"
          fill="none"
          className={styles.gaugeTrack}
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className={styles.gaugeFill}
        />
      </svg>
      <div className={styles.gaugeLabel}>
        <span className={styles.gaugeNum}>{score}</span>
        <span className={styles.gaugeOf}>/ 100</span>
      </div>
    </div>
  );
}

function DepRow({
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
          <td colSpan={5} className={styles.expandRowCell}>
            <div className={styles.cve}>
              <div className={styles.cveHeader}>
                <h4 className={styles.cveTitle}>
                  <IconAlert size={12} /> {dep.vulnerabilities.length} known
                  vulnerabilities
                </h4>
              </div>
              <ul className={styles.cveList}>
                {dep.vulnerabilities.map((v) => (
                  <li key={v.id} className={styles.cveItem}>
                    <span className={styles.cveId}>{v.id}</span>
                    <span className={styles.cveSummary}>{v.summary}</span>
                    <span className={styles.cveMeta}>
                      <span className={styles.cvss}>
                        CVSS {v.cvss.toFixed(1)}
                      </span>
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

export default function Dashboard({
  report,
  density,
  onReset,
}: DashboardProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const scoreMeta = scoreToMeta(report.riskScore);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: report.dependencies.length };
    for (const d of report.dependencies) {
      counts[d.riskLevel] = (counts[d.riskLevel] || 0) + 1;
    }
    return counts;
  }, [report]);

  const visible = useMemo(() => {
    let rows = report.dependencies.slice();
    if (filter !== "all") rows = rows.filter((d) => d.riskLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((d) => d.name.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "version":
          cmp = a.version.localeCompare(b.version, undefined, {
            numeric: true,
          });
          break;
        case "vulns":
          cmp = a.vulnerabilities.length - b.vulnerabilities.length;
          break;
        case "risk":
          cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [report.dependencies, search, filter, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕";

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

      <div className={styles.deps}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <IconSearch size={14} />
            <input
              type="text"
              placeholder="Search packages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {RISK_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`${styles.filter} ${filter === f.id ? styles.filterActive : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className={styles.filterCount}>
                  {filterCounts[f.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th
                  onClick={() => onSort("name")}
                  className={sortKey === "name" ? styles.sorted : ""}
                >
                  Package{" "}
                  <span className={styles.sortArrow}>{sortArrow("name")}</span>
                </th>
                <th
                  onClick={() => onSort("version")}
                  className={sortKey === "version" ? styles.sorted : ""}
                >
                  Version{" "}
                  <span className={styles.sortArrow}>
                    {sortArrow("version")}
                  </span>
                </th>
                <th
                  onClick={() => onSort("vulns")}
                  className={sortKey === "vulns" ? styles.sorted : ""}
                >
                  Vulnerabilities{" "}
                  <span className={styles.sortArrow}>{sortArrow("vulns")}</span>
                </th>
                <th
                  onClick={() => onSort("risk")}
                  className={sortKey === "risk" ? styles.sorted : ""}
                >
                  Risk{" "}
                  <span className={styles.sortArrow}>{sortArrow("risk")}</span>
                </th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No packages match the current filters.
                  </td>
                </tr>
              )}
              {visible.map((d) => (
                <DepRow
                  key={d.name}
                  dep={d}
                  expanded={expanded === d.name}
                  onToggle={() =>
                    setExpanded((cur) => (cur === d.name ? null : d.name))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
