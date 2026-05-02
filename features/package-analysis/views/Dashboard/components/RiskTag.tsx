import { riskLevelMeta } from "../../../utils/risk";
import type { RiskLevel } from "../../../types";
import styles from "../../Dashboard.module.scss";

export function RiskTag({ level }: { level: RiskLevel }) {
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
