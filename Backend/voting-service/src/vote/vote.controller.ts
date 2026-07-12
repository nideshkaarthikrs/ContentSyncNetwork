import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VoteService } from './vote.service';

@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  cast(@Body() dto: CastVoteDto, @Request() req) {
    return this.voteService.cast(req.user, dto);
  }

  @Get('results/:entityId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getResults(@Param('entityId') entityId: string) {
    return this.voteService.getResults(entityId);
  }
}
