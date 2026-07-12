import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageService } from './message.service';

@Controller('projects')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':projectId/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  send(
    @Param('projectId') projectId: string,
    @Body() dto: SendMessageDto,
    @Request() req,
  ) {
    return this.messageService.send(projectId, req.user.id, req.user.userId, req.user.name, dto);
  }

  @Get(':projectId/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getHistory(
    @Param('projectId') projectId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.messageService.getHistory(projectId, parseInt(page, 10), parseInt(pageSize, 10));
  }
}
