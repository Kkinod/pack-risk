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

  const {
    inputRef,
    filled,
    error: uploadError,
    fileName,
    dragOver,
    pasted,
    onDrop,
    onPick,
    onPaste,
    clear,
    useSample,
    setDragOver,
    start: startUpload,
  } = useUpload();
  const manual = useManualEntry();

  const handleStart = () => {
    if (mode === "file") startUpload(onAnalyze);
    else manual.start(onAnalyze);
  };

  return (
    <section className={styles.upload}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          {t.upload.heroBadge}
        </div>
        <h1 className={styles.heroTitle}>{t.upload.heroTitle}</h1>
        <p className={styles.heroSubtitle}>
          {t.upload.heroSubtitle}{" "}
          <strong className={styles.heroSubtitleBold}>
            {t.upload.heroSubtitleBold}
          </strong>{" "}
          {t.upload.heroSubtitleRest}
        </p>
        <p className={styles.heroAudience}>{t.upload.heroAudience}</p>
      </div>

      <div className={styles.card}>
        <div
          className={styles.modeTabs}
          data-active={mode === "file" ? "0" : "1"}
        >
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
                onChange={(e) => onPaste(e.target.value)}
              />
            </div>

            {(uploadError || serverError) && (
              <div className={styles.errorMsg}>
                {uploadError || serverError}
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
            disabled={mode === "file" && !filled}
          >
            {t.upload.startAnalysis}
          </button>
        </footer>
      </div>
    </section>
  );
}
