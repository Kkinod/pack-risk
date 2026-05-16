"use client";

import { useAIAssessment } from "../../../api/useAIAssessment";
import type { AnalysisReport } from "../../../types";
import type {
  AISecurityAssessment,
  ActionStep,
  AssessmentReasoning,
  RiskCorrelation,
  StrategicRecommendation,
} from "../../../server/ai/types";
import { ApiError } from "@/lib/api/fetch";
import { t } from "@/locales";
import styles from "./AIAssessment.module.scss";

interface AIAssessmentProps {
  report: AnalysisReport;
}

export function AIAssessment({ report }: AIAssessmentProps) {
  const mutation = useAIAssessment();
  const assessment = mutation.data;

  const onGenerate = () => {
    mutation.mutate(report);
  };

  return (
    <section className={styles.section} aria-live="polite">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{t.aiAssessment.title}</h2>
          <p className={styles.subtitle}>{t.aiAssessment.intro}</p>
        </div>
        {assessment && !mutation.isPending && (
          <div className={styles.actions}>
            <button
              type="button"
              className="btn"
              onClick={onGenerate}
              disabled={mutation.isPending}
            >
              {t.aiAssessment.regenerate}
            </button>
          </div>
        )}
      </header>

      {!assessment && !mutation.isPending && !mutation.isError && (
        <div className={styles.empty}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onGenerate}
          >
            {t.aiAssessment.generate}
          </button>
        </div>
      )}

      {mutation.isPending && (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <div className={styles.loadingText}>
            <span className={styles.loadingLabel}>
              {t.aiAssessment.loading.label}
            </span>
            <span className={styles.loadingHint}>
              {t.aiAssessment.loading.hint}
            </span>
          </div>
        </div>
      )}

      {mutation.isError && !mutation.isPending && (
        <div className={styles.error} role="alert">
          <p className={styles.errorMsg}>
            {resolveErrorMessage(mutation.error)}
          </p>
          <button
            type="button"
            className="btn"
            onClick={onGenerate}
            disabled={mutation.isPending}
          >
            {t.aiAssessment.errors.retry}
          </button>
        </div>
      )}

      {assessment && !mutation.isPending && (
        <AssessmentResult assessment={assessment} />
      )}
    </section>
  );
}

function AssessmentResult({
  assessment,
}: {
  assessment: AISecurityAssessment;
}) {
  return (
    <>
      <div className={styles.result}>
        <Block title={t.aiAssessment.sections.executiveSummary}>
          <p className={styles.prose}>{assessment.executiveSummary}</p>
        </Block>

        <Block title={t.aiAssessment.sections.prioritizedActionPlan}>
          <ActionPlan steps={assessment.prioritizedActionPlan} />
        </Block>

        <Block title={t.aiAssessment.sections.reasoning}>
          <ReasoningBlock reasoning={assessment.reasoning} />
        </Block>

        <Block title={t.aiAssessment.sections.strategicRecommendations}>
          <StrategicList items={assessment.strategicRecommendations} />
        </Block>
      </div>
      <p className={styles.poweredBy}>{t.aiAssessment.poweredBy}</p>
    </>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      {children}
    </div>
  );
}

function ActionPlan({ steps }: { steps: ActionStep[] }) {
  if (steps.length === 0) {
    return (
      <p className={styles.emptyBlock}>
        {t.aiAssessment.empty.prioritizedActionPlan}
      </p>
    );
  }
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  return (
    <ol className={styles.actionList}>
      {sorted.map((step) => (
        <li
          key={`${step.order}-${step.packageName}`}
          className={styles.actionItem}
        >
          <div className={styles.actionHead}>
            <span className={styles.stepBadge}>
              {t.aiAssessment.actionPlan.stepLabel(step.order)}
            </span>
            <span className={styles.depName}>{step.packageName}</span>
            <div className={styles.actionBadges}>
              <Badge
                kind="effort"
                level={step.effort}
                label={t.aiAssessment.actionPlan.effortLabel}
                value={t.aiAssessment.actionPlan.effort[step.effort]}
              />
              <Badge
                kind="breaking"
                level={step.breakingRisk}
                label={t.aiAssessment.actionPlan.breakingRiskLabel}
                value={
                  t.aiAssessment.actionPlan.breakingRisk[step.breakingRisk]
                }
              />
            </div>
          </div>
          <p className={styles.actionText}>{step.action}</p>
          <p className={styles.rationale}>{step.rationale}</p>
          {step.unblocks && step.unblocks.trim().length > 0 && (
            <p className={styles.unblocks}>
              <span className={styles.unblocksLabel}>
                {t.aiAssessment.actionPlan.unblocksLabel}:
              </span>{" "}
              {step.unblocks}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

function Badge({
  kind,
  level,
  label,
  value,
}: {
  kind: "effort" | "breaking";
  level: "low" | "medium" | "high";
  label: string;
  value: string;
}) {
  return (
    <span
      className={styles.badge}
      data-kind={kind}
      data-level={level}
      title={`${label}: ${value}`}
    >
      <span className={styles.badgeLabel}>{label}:</span>
      <span className={styles.badgeValue}>{value}</span>
    </span>
  );
}

function ReasoningBlock({ reasoning }: { reasoning: AssessmentReasoning }) {
  return (
    <div className={styles.reasoningGroup}>
      <div className={styles.reasoningPart}>
        <span className={styles.reasoningLabel}>
          {t.aiAssessment.reasoning.orderRationaleLabel}
        </span>
        <p className={styles.prose}>{reasoning.orderRationale}</p>
      </div>
      <div className={styles.reasoningPart}>
        <span className={styles.reasoningLabel}>
          {t.aiAssessment.reasoning.correlationsLabel}
        </span>
        <CorrelationList items={reasoning.correlations} />
      </div>
    </div>
  );
}

function CorrelationList({ items }: { items: RiskCorrelation[] }) {
  if (items.length === 0) {
    return (
      <p className={styles.emptyBlock}>{t.aiAssessment.empty.correlations}</p>
    );
  }
  return (
    <ul className={styles.correlationList}>
      {items.map((item, idx) => (
        <li key={`${item.title}-${idx}`} className={styles.correlationItem}>
          <div className={styles.correlationHead}>{item.title}</div>
          <p className={styles.correlationDesc}>{item.description}</p>
          {item.affectedPackages.length > 0 && (
            <div className={styles.affected}>
              <span className={styles.affectedLabel}>
                {t.aiAssessment.reasoning.affectedLabel}
              </span>
              {item.affectedPackages.map((pkg) => (
                <span key={pkg} className={styles.affectedPkg}>
                  {pkg}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function StrategicList({ items }: { items: StrategicRecommendation[] }) {
  if (items.length === 0) {
    return (
      <p className={styles.emptyBlock}>
        {t.aiAssessment.empty.strategicRecommendations}
      </p>
    );
  }
  return (
    <ul className={styles.strategicList}>
      {items.map((item, idx) => (
        <li
          key={`${item.title}-${idx}`}
          className={styles.strategicItem}
          data-category={item.category}
        >
          <div className={styles.strategicHead}>
            <span
              className={styles.categoryBadge}
              data-category={item.category}
            >
              {t.aiAssessment.strategic.categoryLabel[item.category]}
            </span>
            <span className={styles.strategicTitle}>{item.title}</span>
          </div>
          <p className={styles.strategicDesc}>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

function resolveErrorMessage(error: Error | null): string {
  if (error instanceof ApiError) {
    if (error.status === 503) return t.aiAssessment.errors.notConfigured;
    if (error.status === 502) return t.aiAssessment.errors.upstream;
  }
  return t.aiAssessment.errors.generic;
}
