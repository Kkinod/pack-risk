"use client";

import { useCallback, useRef, useState } from "react";
import { IconUpload, IconFile, IconX, IconShield } from "@/components/ui/icons";
import { SAMPLE_PACKAGE_JSON } from "../data/mockData";
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
      setError("Please upload a .json file.");
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
      setError("Upload a file or paste package.json content first.");
      return;
    }
    try {
      JSON.parse(pasted);
    } catch {
      setError("Invalid JSON. Please check the file content.");
      return;
    }
    onAnalyze({ fileName: fileName || "package.json", content: pasted });
  };

  const filled = !!pasted;

  return (
    <section className={styles.upload}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>Step 1 — Source</div>
          <h1 className={styles.title}>
            Analyze your package.json for security risk
          </h1>
          <p className={styles.subtitle}>
            Upload a <code>package.json</code> file and we&apos;ll
            cross-reference its dependencies against public vulnerability
            databases to surface critical issues, outdated packages, and
            recommended fixes.
          </p>
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
                  aria-label="Remove file"
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
                  Drop package.json here
                </div>
                <div className={styles.dropzoneSub}>
                  or click to browse — .json files only
                </div>
              </>
            )}
          </div>

          <div className={styles.divider}>or paste content</div>

          <div className={styles.codeInput}>
            <label htmlFor="paste">
              <span>package.json content</span>
              <span className={styles.labelMeta}>
                <button
                  type="button"
                  className={styles.sampleBtn}
                  onClick={useSample}
                >
                  Load sample →
                </button>
              </span>
            </label>
            <textarea
              id="paste"
              spellCheck={false}
              placeholder={
                '{\n  "name": "my-app",\n  "dependencies": { ... }\n}'
              }
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
            <span>Your file is processed locally — nothing is uploaded.</span>
          </div>
          <button
            className="btn btn--primary btn--lg"
            onClick={start}
            disabled={!filled}
          >
            Start analysis
          </button>
        </footer>
      </div>
    </section>
  );
}
