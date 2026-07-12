import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RaiseClaimDto } from './dto/raise-claim.dto';
import { RightsService } from './rights.service';

@Controller('copyright')
export class CopyrightController {
  constructor(private readonly rightsService: RightsService) {}

  @Post('claims')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  raiseClaim(@Body() dto: RaiseClaimDto, @Request() req) {
    return this.rightsService.raiseClaim(req.user, dto);
  }

  @Get('claims/:claimId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getClaim(@Param('claimId') claimId: string) {
    return this.rightsService.getClaimById(claimId);
  }
}
