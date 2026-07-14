import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageService } from './message.service';
import { clampPagination } from '../shared/pagination.helper';

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Request() req,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.messageService.getHistory(projectId, req.user.id, req.user.userId, clamped.page, clamped.pageSize);
  }
}
