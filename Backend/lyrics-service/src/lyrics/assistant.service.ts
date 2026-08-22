import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateText, isGeminiConfigured } from '../shared/gemini.client';
import { AssistantChatDto } from './dto/assistant-chat.dto';

const SYSTEM_PROMPT =
  'You are the in-app creative assistant for CSN, a music collaboration app where ' +
  'composers, singers, directors, and lyricists work together on tunes, lyrics, ' +
  'performances, and videos. Be helpful, concise, and specific to music creation and ' +
  'collaboration workflows on this app.';

const NOT_CONFIGURED_REPLY = 'AI assistant is not configured on this server';
const UNAVAILABLE_REPLY = 'AI assistant is temporarily unavailable. Please try again later.';

@Injectable()
export class AssistantService {
  constructor(private readonly config: ConfigService) {}

  async chat(dto: AssistantChatDto) {
    const cfg = {
      apiKey: this.config.get<string>('gemini.apiKey'),
      model: this.config.get<string>('gemini.model'),
    };

    if (!isGeminiConfigured(cfg)) {
      return {
        status: 'SUCCESS',
        message: 'Assistant reply generated',
        data: { reply: NOT_CONFIGURED_REPLY, source: 'sample' as const },
      };
    }

    const historyText = (dto.history ?? [])
      .map((turn) => `${turn.role}: ${turn.content}`)
      .join('\n');

    const prompt = [
      SYSTEM_PROMPT,
      historyText ? `Conversation so far:\n${historyText}` : null,
      `User: ${dto.message}`,
    ]
      .filter((part): part is string => Boolean(part))
      .join('\n\n');

    const reply = await generateText(cfg, prompt);

    if (!reply) {
      // Gemini is configured but the call failed/returned nothing usable at
      // request time - honest about being temporarily unavailable, distinct
      // from the "not configured at all" case above.
      return {
        status: 'SUCCESS',
        message: 'Assistant reply generated',
        data: { reply: UNAVAILABLE_REPLY, source: 'sample' as const },
      };
    }

    return {
      status: 'SUCCESS',
      message: 'Assistant reply generated',
      data: { reply, source: 'gemini' as const },
    };
  }
}
