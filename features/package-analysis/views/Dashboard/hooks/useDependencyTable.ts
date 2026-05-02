import { useMemo, useState } from "react";
import type { Dependency, RiskLevel } from "../../../types";

export type SortKey = "name" | "version" | "vulns" | "risk";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  safe: 0,
};

export function useDependencyTable(dependencies: Dependency[]) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dependencies.length };
    for (const d of dependencies) {
      counts[d.riskLevel] = (counts[d.riskLevel] || 0) + 1;
    }
    return counts;
  }, [dependencies]);

  const visible = useMemo(() => {
    let rows = dependencies.slice();
    if (filter !== "all") rows = rows.filter((d) => d.riskLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((d) => d.name.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "version":
          cmp = a.version.localeCompare(b.version, undefined, {
            numeric: true,
          });
          break;
        case "vulns":
          cmp = a.vulnerabilities.length - b.vulnerabilities.length;
          break;
        case "risk":
          cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [dependencies, search, filter, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕";

  return {
    search,
    setSearch,
    filter,
    setFilter,
    expanded,
    setExpanded,
    filterCounts,
    visible,
    sortKey,
    onSort,
    sortArrow,
  };
}
