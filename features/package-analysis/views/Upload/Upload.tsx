"use client";

import { IconUpload, IconFile, IconX, IconShield } from "@/components/ui/icons";
import { useUpload } from "./hooks/useUpload";
import { t } from "@/locales";
import styles from "./Upload.module.scss";

interface UploadProps {
  onAnalyze: (input: { fileName: string; content: string }) => void;
  serverError?: string;
}

export default function Upload({ onAnalyze, serverError }: UploadProps) {
  const {
    fileName,
    pasted,
    dragOver,
    error,
    filled,
    inputRef,
    onDrop,
    onPick,
    onPaste,
    clear,
    useSample,
    setDragOver,
    start,
  } = useUpload();

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

          {(error || serverError) && (
            <div className={styles.errorMsg}>{error || serverError}</div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.hint}>
            <IconShield size={14} />
            <span>{t.upload.hint}</span>
          </div>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => start(onAnalyze)}
            disabled={!filled}
          >
            {t.upload.startAnalysis}
          </button>
        </footer>
      </div>
    </section>
  );
}
