import { scoreToMeta } from "../../../utils/risk";
import styles from "./RiskGauge.module.scss";

export function RiskGauge({ score }: { score: number }) {
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
