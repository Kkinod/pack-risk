"use client";

import { useState } from "react";
import { IconUpload, IconFile, IconX, IconShield } from "@/components/ui/icons";
import { useUpload } from "./hooks/useUpload";
import { useManualEntry } from "./hooks/useManualEntry";
import { ManualEntry } from "./components/ManualEntry";
import { t } from "@/locales";
import styles from "./Upload.module.scss";

type UploadMode = "file" | "manual";

interface UploadProps {
  onAnalyze: (input: { fileName: string; content: string }) => void;
  serverError?: string;
}

export default function Upload({ onAnalyze, serverError }: UploadProps) {
  const [mode, setMode] = useState<UploadMode>("file");

  const upload = useUpload();
  const manual = useManualEntry();

  const handleStart = () => {
    if (mode === "file") upload.start(onAnalyze);
    else manual.start(onAnalyze);
  };

  return (
    <section className={styles.upload}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{t.upload.eyebrow}</div>
          <h1 className={styles.title}>{t.upload.title}</h1>
          <p className={styles.subtitle}>
            {t.upload.subtitle}
            <br />
            <span className={styles.subtitleSupports}>
              {t.upload.subtitleSupportsLabel}{" "}
              {t.upload.subtitleSections.map((s, i) => (
                <span key={s}>
                  <code className={styles.inlineCode}>{s}</code>
                  {i < t.upload.subtitleSections.length - 2
                    ? ", "
                    : i === t.upload.subtitleSections.length - 2
                      ? ", and "
                      : "."}
                </span>
              ))}
            </span>
          </p>
        </header>

        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${mode === "file" ? styles.modeTabActive : ""}`}
            onClick={() => setMode("file")}
          >
            {t.upload.modes.filePaste}
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${mode === "manual" ? styles.modeTabActive : ""}`}
            onClick={() => setMode("manual")}
          >
            {t.upload.modes.manualEntry}
          </button>
        </div>

        {mode === "file" && (
          <div className={styles.body}>
            <div
              className={`${styles.dropzone} ${upload.dragOver ? styles.dropzoneActive : ""} ${upload.filled ? styles.dropzoneFilled : ""}`}
              onClick={() => upload.inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                upload.setDragOver(true);
              }}
              onDragLeave={() => upload.setDragOver(false)}
              onDrop={upload.onDrop}
              role="button"
              tabIndex={0}
            >
              <input
                ref={upload.inputRef}
                type="file"
                accept=".json,application/json"
                onChange={upload.onPick}
                style={{ display: "none" }}
              />
              {upload.filled ? (
                <div className={styles.dropzoneFile}>
                  <IconFile size={16} />
                  <span>{upload.fileName}</span>
                  <button
                    className={styles.clearBtn}
                    onClick={upload.clear}
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
                <span className={styles.labelLeft}>
                  {t.upload.contentLabel}
                  <span
                    className={styles.infoTooltip}
                    data-tooltip={t.upload.contentFormatTooltip}
                    tabIndex={0}
                    role="tooltip"
                    aria-label={t.upload.contentFormatTooltip}
                  >
                    ?
                  </span>
                </span>
                <span className={styles.labelMeta}>
                  <button
                    type="button"
                    className={styles.sampleBtn}
                    onClick={upload.useSample}
                  >
                    {t.upload.loadSample}
                  </button>
                </span>
              </label>
              <textarea
                id="paste"
                spellCheck={false}
                placeholder={t.upload.placeholder}
                value={upload.pasted}
                onChange={(e) => upload.onPaste(e.target.value)}
              />
            </div>

            {(upload.error || serverError) && (
              <div className={styles.errorMsg}>
                {upload.error || serverError}
              </div>
            )}
          </div>
        )}

        {mode === "manual" && (
          <div className={styles.body}>
            <ManualEntry
              rows={manual.rows}
              error={manual.error}
              serverError={serverError}
              onAdd={manual.addRow}
              onRemove={manual.removeRow}
              onUpdate={manual.updateRow}
            />
          </div>
        )}

        <footer className={styles.footer}>
          <div className={styles.hint}>
            <IconShield size={14} />
            <span>{t.upload.hint}</span>
          </div>
          <button
            className="btn btn--primary btn--lg"
            onClick={handleStart}
            disabled={mode === "file" && !upload.filled}
          >
            {t.upload.startAnalysis}
          </button>
        </footer>
      </div>
    </section>
  );
}
