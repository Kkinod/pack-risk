"use client";

import React from "react";
import { IconSearch } from "@/components/ui/icons";
import type { Dependency, RiskLevel } from "../../../types";
import type { SortKey } from "../hooks/useDependencyTable";
import { DependencyRow } from "./DependencyRow";
import { t } from "@/locales";
import styles from "./DependencyTable.module.scss";

const RISK_FILTERS: Array<{ id: RiskLevel | "all"; label: string }> = [
  { id: "all", label: t.dashboard.depTable.filters.all },
  { id: "critical", label: t.dashboard.depTable.filters.critical },
  { id: "high", label: t.dashboard.depTable.filters.high },
  { id: "medium", label: t.dashboard.depTable.filters.medium },
  { id: "low", label: t.dashboard.depTable.filters.low },
  { id: "safe", label: t.dashboard.depTable.filters.safe },
];

interface DependencyTableProps {
  visible: Dependency[];
  search: string;
  setSearch: (v: string) => void;
  filter: RiskLevel | "all";
  setFilter: (v: RiskLevel | "all") => void;
  filterCounts: Record<string, number>;
  expanded: string | null;
  setExpanded: React.Dispatch<React.SetStateAction<string | null>>;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  sortArrow: (key: SortKey) => string;
}

export function DependencyTable({
  visible,
  search,
  setSearch,
  filter,
  setFilter,
  filterCounts,
  expanded,
  setExpanded,
  sortKey,
  onSort,
  sortArrow,
}: DependencyTableProps) {
  return (
    <div className={styles.deps}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <IconSearch size={14} />
          <input
            type="text"
            placeholder={t.dashboard.depTable.search}
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
                {t.dashboard.depTable.cols.package}{" "}
                <span className={styles.sortArrow}>{sortArrow("name")}</span>
              </th>
              <th
                onClick={() => onSort("version")}
                className={sortKey === "version" ? styles.sorted : ""}
              >
                {t.dashboard.depTable.cols.version}{" "}
                <span className={styles.sortArrow}>{sortArrow("version")}</span>
              </th>
              <th>{t.dashboard.depTable.cols.latest}</th>
              <th
                onClick={() => onSort("vulns")}
                className={sortKey === "vulns" ? styles.sorted : ""}
              >
                {t.dashboard.depTable.cols.vulns}{" "}
                <span className={styles.sortArrow}>{sortArrow("vulns")}</span>
              </th>
              <th
                onClick={() => onSort("risk")}
                className={sortKey === "risk" ? styles.sorted : ""}
              >
                {t.dashboard.depTable.cols.risk}{" "}
                <span className={styles.sortArrow}>{sortArrow("risk")}</span>
              </th>
              <th>{t.dashboard.depTable.cols.recommendation}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  {t.dashboard.depTable.empty}
                </td>
              </tr>
            )}
            {visible.map((d) => (
              <DependencyRow
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
  );
}
