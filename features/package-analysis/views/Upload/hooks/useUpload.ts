import { useCallback, useRef, useState } from "react";
import { SAMPLE_PACKAGE_JSON } from "../../../data/mockData";
import { t } from "@/locales";

export interface UseUploadReturn {
  fileName: string;
  pasted: string;
  dragOver: boolean;
  error: string;
  filled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (value: string) => void;
  clear: (e: React.MouseEvent) => void;
  useSample: () => void;
  setDragOver: (v: boolean) => void;
  start: (
    onAnalyze: (input: { fileName: string; content: string }) => void
  ) => void;
}

export function useUpload(): UseUploadReturn {
  const [fileName, setFileName] = useState<string>("");
  const [pasted, setPasted] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const onPaste = (value: string) => {
    setPasted(value);
    if (value && !fileName) setFileName("pasted-content.json");
    setError("");
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

  const start = (
    onAnalyze: (input: { fileName: string; content: string }) => void
  ) => {
    if (!pasted.trim()) {
      setError(t.upload.errors.emptyContent);
      return;
    }
    try {
      JSON.parse(pasted);
    } catch {
      try {
        JSON.parse(`{${pasted}}`);
      } catch {
        setError(t.upload.errors.invalidJson);
        return;
      }
    }
    onAnalyze({ fileName: fileName || "package.json", content: pasted });
  };

  return {
    fileName,
    pasted,
    dragOver,
    error,
    filled: !!pasted,
    inputRef,
    onDrop,
    onPick,
    onPaste,
    clear,
    useSample,
    setDragOver,
    start,
  };
}
