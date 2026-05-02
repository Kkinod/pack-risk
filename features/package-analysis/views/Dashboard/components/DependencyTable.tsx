"use client";

import React from "react";
import { IconSearch } from "@/components/ui/icons";
import type { Dependency, RiskLevel } from "../../../types";
import type { SortKey } from "../hooks/useDependencyTable";
import { DependencyRow } from "./DependencyRow";
import styles from "../../Dashboard.module.scss";

const RISK_FILTERS: Array<{ id: RiskLevel | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "safe", label: "Safe" },
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
                <span className={styles.sortArrow}>{sortArrow("version")}</span>
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
