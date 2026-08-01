"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Screen } from "@/features/package-analysis/types";
import { useTheme } from "@/components/theme/useTheme";
import { t } from "@/locales";
import styles from "./Shell.module.scss";

interface ShellProps {
  step: Screen;
  children: ReactNode;
}

export default function Shell({ step, children }: ShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <div className={styles.brandMark}>PR</div>
            <div>
              <div className={styles.brandName}>{t.shell.brandName}</div>
            </div>
          </Link>
          <span className={styles.brandTag}>{t.shell.brandTag}</span>
        </div>
        <nav className={styles.nav} aria-label={t.shell.nav.progressLabel}>
          <span
            className={`${styles.navStep} ${step === "upload" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> {t.shell.nav.upload}
          </span>
          <span className={styles.navSep}>›</span>
          <span
            className={`${styles.navStep} ${step === "loading" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> {t.shell.nav.analyze}
          </span>
          <span className={styles.navSep}>›</span>
          <span
            className={`${styles.navStep} ${step === "dashboard" ? styles.navStepActive : ""}`}
          >
            <span className={styles.dot} /> {t.shell.nav.report}
          </span>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? t.shell.theme.toLightLabel
                : t.shell.theme.toDarkLabel
            }
          >
            {theme === "dark" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.pageFooter}>
        <span>© {new Date().getFullYear()} PackRisk. All rights reserved.</span>
        <span className={styles.pageFooterSep}>·</span>
        <span>
          Designed &amp; built by{" "}
          <a
            href="https://pawelek.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pageFooterLink}
          >
            pawelek.dev
          </a>
        </span>
      </footer>
    </div>
  );
}
