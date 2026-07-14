import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { TuneService } from './tune.service';

@Controller('internal/tunes')
export class InternalTuneController {
  constructor(private readonly tuneService: TuneService) {}

  @Get(':tuneId/owner')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  getOwner(@Param('tuneId') tuneId: string) {
    return this.tuneService.getOwner(tuneId);
  }
}
