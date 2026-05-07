import { StyleSheet } from "@react-pdf/renderer";
import type { RiskLevel, Severity } from "../types";

export const colors = {
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surface: "#f9fafb",
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#65a30d",
  safe: "#16a34a",
  accent: "#1f2937",
};

export const riskColor: Record<RiskLevel, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.low,
  safe: colors.safe,
};

export const severityColor: Record<Severity, string> = {
  critical: colors.critical,
  high: colors.high,
  medium: colors.medium,
  low: colors.low,
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 10,
    color: colors.text,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottom: `1pt solid ${colors.border}`,
    paddingBottom: 12,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 8,
  },
  riskCard: {
    border: `1pt solid ${colors.border}`,
    borderRadius: 4,
    padding: 14,
    flexDirection: "row",
    gap: 24,
    backgroundColor: colors.surface,
  },
  riskScoreBlock: {
    minWidth: 110,
  },
  riskScoreNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.text,
  },
  riskScoreLabel: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  statsBlock: {
    flex: 1,
    gap: 6,
  },
  statRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    gap: 4,
    alignItems: "baseline",
  },
  statValue: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.text,
  },
  statLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  pill: {
    fontSize: 9,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    border: `1pt solid ${colors.border}`,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.text,
  },
  list: {
    gap: 6,
  },
  listItem: {
    flexDirection: "row",
    gap: 6,
    fontSize: 10,
    lineHeight: 1.4,
  },
  bullet: {
    width: 12,
    color: colors.muted,
  },
  itemBody: {
    flex: 1,
  },
  itemHead: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.text,
  },
  itemVersion: {
    fontSize: 9,
    color: colors.muted,
  },
  riskTag: {
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRec: {
    fontSize: 9,
    color: colors.muted,
  },
  table: {
    border: `1pt solid ${colors.border}`,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1pt solid ${colors.border}`,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowLast: {
    borderBottom: 0,
  },
  tableHeader: {
    backgroundColor: colors.surface,
    fontWeight: 700,
    fontSize: 9,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellName: {
    flex: 3,
  },
  cellVersion: {
    flex: 1.2,
  },
  cellLatest: {
    flex: 1.2,
  },
  cellVulns: {
    flex: 0.7,
    textAlign: "right",
  },
  cellRisk: {
    flex: 1,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 8,
    color: colors.muted,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1pt solid ${colors.border}`,
    paddingTop: 6,
  },
});
