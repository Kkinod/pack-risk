import type { Severity } from "../../../types";
import styles from "../../Dashboard.module.scss";

const colorMap: Record<Severity, string> = {
  critical: "var(--risk-critical)",
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

export function SeverityPill({
  count,
  label,
  sev,
}: {
  count: number;
  label: string;
  sev: Severity;
}) {
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
