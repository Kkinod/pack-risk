import { httpClient } from "@/lib/http/client";

const DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = 30_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
}

export interface OpenAIClient {
  createChatCompletion(
    body: Omit<ChatCompletionRequest, "model"> & { model?: string }
  ): Promise<ChatCompletionResponse>;
  readonly model: string;
}

export class MissingApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set");
    this.name = "MissingApiKeyError";
  }
}

export function createOpenAIClient(): OpenAIClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const client = httpClient({
    baseUrl: "https://api.openai.com/v1",
    source: "openai",
    timeoutMs: OPENAI_TIMEOUT_MS,
    retry: { attempts: 2, baseDelayMs: 500 },
    defaultHeaders: { Authorization: `Bearer ${apiKey}` },
  });

  return {
    model,
    createChatCompletion: (body) =>
      client.post<ChatCompletionResponse>("/chat/completions", {
        model: body.model ?? model,
        ...body,
      }),
  };
}
