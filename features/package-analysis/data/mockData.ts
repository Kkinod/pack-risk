import type { AnalysisStep } from "../types";
import { t } from "@/locales";

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: "parse", label: t.loading.steps.parse, duration: 700 },
  { id: "deps", label: t.loading.steps.deps, duration: 1100 },
  { id: "vuln", label: t.loading.steps.vuln, duration: 1400 },
  { id: "risk", label: t.loading.steps.risk, duration: 800 },
];

export const SAMPLE_PACKAGE_JSON = `{
  "name": "checkout-service",
  "version": "2.4.1",
  "private": true,
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.20",
    "axios": "0.21.1",
    "moment": "2.29.1",
    "minimist": "1.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "node-fetch": "2.6.1",
    "ws": "7.4.5",
    "jsonwebtoken": "8.5.1"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "vite": "4.5.0",
    "eslint": "8.57.0"
  }
}`;
