import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssistantService } from './assistant.service';
import { AssistantChatDto } from './dto/assistant-chat.dto';

@Controller('ai/assistant')
export class AiAssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  chat(@Body() dto: AssistantChatDto) {
    return this.assistantService.chat(dto);
  }
}
