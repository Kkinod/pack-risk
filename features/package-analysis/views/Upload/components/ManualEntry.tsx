import { IconX } from "@/components/ui/icons";
import type { PackageRow } from "../hooks/useManualEntry";
import { t } from "@/locales";
import styles from "./ManualEntry.module.scss";

interface ManualEntryProps {
  rows: PackageRow[];
  error: string;
  serverError?: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "name" | "version", value: string) => void;
}

export function ManualEntry({
  rows,
  error,
  serverError,
  onAdd,
  onRemove,
  onUpdate,
}: ManualEntryProps) {
  return (
    <div className={styles.manualEntry}>
      <ul className={styles.rowList}>
        {rows.map((row, i) => (
          <li key={row.id} className={styles.row}>
            <span className={styles.rowIndex}>{i + 1}</span>
            <input
              className={styles.input}
              type="text"
              placeholder={t.upload.manualEntry.namePlaceholder}
              value={row.name}
              onChange={(e) => onUpdate(row.id, "name", e.target.value)}
              aria-label={`Package name ${i + 1}`}
            />
            <input
              className={`${styles.input} ${styles.inputVersion}`}
              type="text"
              placeholder={t.upload.manualEntry.versionPlaceholder}
              value={row.version}
              onChange={(e) => onUpdate(row.id, "version", e.target.value)}
              aria-label={`Version ${i + 1}`}
            />
            {rows.length > 1 && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove(row.id)}
                aria-label={t.upload.manualEntry.removeAriaLabel}
              >
                <IconX size={13} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.addBtn} onClick={onAdd}>
        {t.upload.manualEntry.addPackage}
      </button>

      {(error || serverError) && (
        <div className={styles.errorMsg}>{error || serverError}</div>
      )}
    </div>
  );
}
