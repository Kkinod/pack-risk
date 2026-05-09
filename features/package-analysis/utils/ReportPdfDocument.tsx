import { Document, Page, Text, View, pdf } from "@react-pdf/renderer";
import type { ReportExport, ReportExportDependency } from "./exportReport";
import type { Severity } from "../types";
import { styles, riskColor, severityColor } from "./ReportPdfDocument.styles";
import { t } from "@/locales";

function scoreLabel(score: number): string {
  if (score >= 80) return t.pdf.scoreLabel.critical;
  if (score >= 60) return t.pdf.scoreLabel.high;
  if (score >= 30) return t.pdf.scoreLabel.medium;
  if (score >= 10) return t.pdf.scoreLabel.low;
  return t.pdf.scoreLabel.safe;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function DepItem({ dep }: { dep: ReportExportDependency }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.bullet}>•</Text>
      <View style={styles.itemBody}>
        <View style={styles.itemHead}>
          <Text style={styles.itemName}>{dep.name}</Text>
          <Text style={styles.itemVersion}>@ {dep.version}</Text>
          <Text
            style={[
              styles.riskTag,
              { backgroundColor: riskColor[dep.riskLevel] },
            ]}
          >
            {t.risk[dep.riskLevel].label}
          </Text>
          <Text style={styles.itemVersion}>
            {t.pdf.vulnCount(dep.vulnerabilityCount)}
          </Text>
        </View>
        <Text style={styles.itemRec}>{dep.recommendation}</Text>
      </View>
    </View>
  );
}

export function ReportPdfDocument({ data }: { data: ReportExport }) {
  const {
    meta,
    summary,
    criticalDependencies,
    topRecommendations,
    dependencies,
  } = data;
  const sb = meta.severityBreakdown;
  const projectName = meta.projectName || meta.fileName;

  return (
    <Document title={t.pdf.docTitle(projectName)} author="Pack Risk">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t.pdf.eyebrow}</Text>
          <Text style={styles.title}>{projectName}</Text>
          <Text style={styles.metaLine}>
            {t.pdf.sourceLabel(meta.fileName)}
          </Text>
          <Text style={styles.metaLine}>
            {t.pdf.datesLine(
              formatDate(meta.analyzedAt),
              formatDate(meta.exportedAt)
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.riskCard}>
            <View style={styles.riskScoreBlock}>
              <Text style={styles.riskScoreNumber}>
                {t.pdf.scoreOf100(meta.riskScore)}
              </Text>
              <Text style={styles.riskScoreLabel}>
                {scoreLabel(meta.riskScore)}
              </Text>
            </View>
            <View style={styles.statsBlock}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{meta.totalDependencies}</Text>
                  <Text style={styles.statLabel}>
                    {t.pdf.stats.dependencies}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {meta.vulnerableDependencies}
                  </Text>
                  <Text style={styles.statLabel}>{t.pdf.stats.vulnerable}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {meta.totalVulnerabilities}
                  </Text>
                  <Text style={styles.statLabel}>
                    {t.pdf.stats.vulnerabilities}
                  </Text>
                </View>
              </View>
              <View style={styles.pillRow}>
                {(["critical", "high", "medium", "low"] as const).map((sev) => (
                  <Text
                    key={sev}
                    style={[
                      styles.pill,
                      {
                        borderColor: severityColor[sev as Severity],
                        color: severityColor[sev as Severity],
                      },
                    ]}
                  >
                    {t.risk[sev].label}: {sb[sev]}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.pdf.sections.summary}</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        ) : null}

        {criticalDependencies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t.pdf.sections.criticalDeps}
            </Text>
            <View style={styles.list}>
              {criticalDependencies.map((dep) => (
                <DepItem key={dep.name} dep={dep} />
              ))}
            </View>
          </View>
        ) : null}

        {topRecommendations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.pdf.sections.topRecs}</Text>
            <View style={styles.list}>
              {topRecommendations.map((rec, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>{i + 1}.</Text>
                  <Text style={styles.itemBody}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.pdf.sections.depTable}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.cellName}>{t.pdf.tableHeaders.package}</Text>
              <Text style={styles.cellVersion}>
                {t.pdf.tableHeaders.version}
              </Text>
              <Text style={styles.cellLatest}>{t.pdf.tableHeaders.latest}</Text>
              <Text style={styles.cellVulns}>{t.pdf.tableHeaders.vulns}</Text>
              <Text style={styles.cellRisk}>{t.pdf.tableHeaders.risk}</Text>
            </View>
            {dependencies.map((dep, i) => (
              <View
                key={dep.name}
                style={[
                  styles.tableRow,
                  i === dependencies.length - 1 ? styles.tableRowLast : {},
                ]}
              >
                <Text style={styles.cellName}>{dep.name}</Text>
                <Text style={styles.cellVersion}>{dep.version}</Text>
                <Text style={styles.cellLatest}>
                  {dep.latestVersion ?? "—"}
                </Text>
                <Text style={styles.cellVulns}>{dep.vulnerabilityCount}</Text>
                <Text
                  style={[styles.cellRisk, { color: riskColor[dep.riskLevel] }]}
                >
                  {t.risk[dep.riskLevel].label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{t.pdf.footerBrand(projectName)}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              t.pdf.footerPage(pageNumber, totalPages)
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdfBlob(data: ReportExport): Promise<Blob> {
  return pdf(<ReportPdfDocument data={data} />).toBlob();
}
