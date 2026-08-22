import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';

const logger = new Logger('GeminiClient');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// External, potentially slow API call - longer than internal-http's 5000ms.
const GEMINI_TIMEOUT_MS = 30000;

// Gemini rejects inline_data payloads above this size; fail fast rather than
// reading/base64-encoding a file we know will be rejected.
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
}

export function isGeminiConfigured(cfg: GeminiConfig): boolean {
  return typeof cfg.apiKey === 'string' && cfg.apiKey.length > 0;
}

function extractText(data: GeminiGenerateContentResponse): string | null {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === 'string' && text.length > 0 ? text : null;
}

export async function generateText(cfg: GeminiConfig, prompt: string): Promise<string | null> {
  try {
    const res = await fetch(`${GEMINI_API_BASE}/${cfg.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`Gemini generateText call returned ${res.status}`);
      return null;
    }
    const data = (await res.json()) as GeminiGenerateContentResponse;
    const text = extractText(data);
    if (!text) {
      logger.warn('Gemini generateText call returned no candidate text');
      return null;
    }
    return text;
  } catch (err) {
    logger.warn(`Gemini generateText call failed: ${(err as Error).message}`);
    return null;
  }
}

export async function generateJson<T>(
  cfg: GeminiConfig,
  prompt: string,
  isValid: (value: unknown) => value is T,
): Promise<T | null> {
  try {
    const res = await fetch(`${GEMINI_API_BASE}/${cfg.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`Gemini generateJson call returned ${res.status}`);
      return null;
    }
    const data = (await res.json()) as GeminiGenerateContentResponse;
    const text = extractText(data);
    if (!text) {
      logger.warn('Gemini generateJson call returned no candidate text');
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      logger.warn(`Gemini generateJson call returned unparseable JSON: ${(parseErr as Error).message}`);
      return null;
    }
    if (!isValid(parsed)) {
      logger.warn('Gemini generateJson call returned a response that did not match the expected shape');
      return null;
    }
    return parsed;
  } catch (err) {
    logger.warn(`Gemini generateJson call failed: ${(err as Error).message}`);
    return null;
  }
}

export async function generateFromAudio<T>(
  cfg: GeminiConfig,
  prompt: string,
  audioFilePath: string,
  mimeType: string,
  isValid: (value: unknown) => value is T,
): Promise<T | null> {
  try {
    const stat = await fs.stat(audioFilePath);
    if (stat.size > MAX_AUDIO_BYTES) {
      logger.warn(
        `Gemini generateFromAudio skipped: ${audioFilePath} is ${stat.size} bytes, exceeds ${MAX_AUDIO_BYTES} byte limit`,
      );
      return null;
    }

    const fileBuffer = await fs.readFile(audioFilePath);
    const base64Data = fileBuffer.toString('base64');

    const res = await fetch(`${GEMINI_API_BASE}/${cfg.model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.warn(`Gemini generateFromAudio call returned ${res.status}`);
      return null;
    }
    const data = (await res.json()) as GeminiGenerateContentResponse;
    const text = extractText(data);
    if (!text) {
      logger.warn('Gemini generateFromAudio call returned no candidate text');
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      logger.warn(`Gemini generateFromAudio call returned unparseable JSON: ${(parseErr as Error).message}`);
      return null;
    }
    if (!isValid(parsed)) {
      logger.warn('Gemini generateFromAudio call returned a response that did not match the expected shape');
      return null;
    }
    return parsed;
  } catch (err) {
    logger.warn(`Gemini generateFromAudio call failed: ${(err as Error).message}`);
    return null;
  }
}
