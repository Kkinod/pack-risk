"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/ui/icons";
import { ANALYSIS_STEPS } from "../data/mockData";
import { t } from "@/locales";
import styles from "./Loading.module.scss";

interface LoadingProps {
  onComplete: () => void;
}

export default function Loading({ onComplete }: LoadingProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (stepIdx >= ANALYSIS_STEPS.length) {
      const t = setTimeout(onComplete, 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setStepIdx((i) => i + 1),
      ANALYSIS_STEPS[stepIdx].duration
    );
    return () => clearTimeout(t);
  }, [stepIdx, onComplete]);

  const total = ANALYSIS_STEPS.length;
  const progress = Math.min(100, (stepIdx / total) * 100);

  return (
    <section className={styles.loading}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{t.loading.eyebrow}</div>
          <h2 className={styles.title}>{t.loading.title}</h2>
          <p className={styles.sub}>{t.loading.subtitle}</p>
        </header>

        <div className={styles.progress} aria-label={t.loading.progressLabel}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className={styles.steps}>
          {ANALYSIS_STEPS.map((s, i) => {
            const status =
              i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
            return (
              <li
                key={s.id}
                className={`${styles.step} ${status === "done" ? styles.stepDone : ""} ${status === "active" ? styles.stepActive : ""}`}
              >
                <span className={styles.stepIcon}>
                  {status === "done" ? (
                    <IconCheck size={12} />
                  ) : status === "active" ? (
                    <span className={styles.spinner} />
                  ) : null}
                </span>
                <span>{s.label}</span>
                <span className={styles.stepMeta}>
                  {status === "done"
                    ? t.loading.status.done
                    : status === "active"
                      ? t.loading.status.running
                      : t.loading.status.queued}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
