"use client";

import { useCallback, useRef, useState } from "react";
import { IconUpload, IconFile, IconX, IconShield } from "@/components/ui/icons";
import { SAMPLE_PACKAGE_JSON } from "../data/mockData";
import { t } from "@/locales";
import styles from "./Upload.module.scss";

interface UploadProps {
  onAnalyze: (input: { fileName: string; content: string }) => void;
}

export default function Upload({ onAnalyze }: UploadProps) {
  const [fileName, setFileName] = useState<string>("");
  const [pasted, setPasted] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      setError(t.upload.errors.jsonFileOnly);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const txt = String(e.target?.result || "");
      setFileName(file.name);
      setPasted(txt);
      setError("");
    };
    reader.readAsText(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName("");
    setPasted("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const useSample = () => {
    setFileName("package.json (sample)");
    setPasted(SAMPLE_PACKAGE_JSON);
    setError("");
  };

  const start = () => {
    if (!pasted.trim()) {
      setError(t.upload.errors.emptyContent);
      return;
    }
    try {
      JSON.parse(pasted);
    } catch {
      setError(t.upload.errors.invalidJson);
      return;
    }
    onAnalyze({ fileName: fileName || "package.json", content: pasted });
  };

  const filled = !!pasted;

  return (
    <section className={styles.upload}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{t.upload.eyebrow}</div>
          <h1 className={styles.title}>{t.upload.title}</h1>
          <p className={styles.subtitle}>{t.upload.subtitle}</p>
        </header>

        <div className={styles.body}>
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${filled ? styles.dropzoneFilled : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              onChange={onPick}
              style={{ display: "none" }}
            />
            {filled ? (
              <div className={styles.dropzoneFile}>
                <IconFile size={16} />
                <span>{fileName}</span>
                <button
                  className={styles.clearBtn}
                  onClick={clear}
                  aria-label={t.upload.dropzone.removeFile}
                >
                  <IconX size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className={styles.dropzoneIcon}>
                  <IconUpload size={20} />
                </div>
                <div className={styles.dropzoneTitle}>
                  {t.upload.dropzone.title}
                </div>
                <div className={styles.dropzoneSub}>
                  {t.upload.dropzone.sub}
                </div>
              </>
            )}
          </div>

          <div className={styles.divider}>{t.upload.divider}</div>

          <div className={styles.codeInput}>
            <label htmlFor="paste">
              <span>{t.upload.contentLabel}</span>
              <span className={styles.labelMeta}>
                <button
                  type="button"
                  className={styles.sampleBtn}
                  onClick={useSample}
                >
                  {t.upload.loadSample}
                </button>
              </span>
            </label>
            <textarea
              id="paste"
              spellCheck={false}
              placeholder={t.upload.placeholder}
              value={pasted}
              onChange={(e) => {
                setPasted(e.target.value);
                if (e.target.value && !fileName)
                  setFileName("pasted-content.json");
                setError("");
              }}
            />
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
        </div>

        <footer className={styles.footer}>
          <div className={styles.hint}>
            <IconShield size={14} />
            <span>{t.upload.hint}</span>
          </div>
          <button
            className="btn btn--primary btn--lg"
            onClick={start}
            disabled={!filled}
          >
            {t.upload.startAnalysis}
          </button>
        </footer>
      </div>
    </section>
  );
}
