import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DrmTokenDto } from './dto/drm-token.dto';
import { RightsService } from './rights.service';

@Controller('drm')
export class DrmController {
  constructor(private readonly rightsService: RightsService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  generateToken(@Body() dto: DrmTokenDto) {
    return this.rightsService.generateDrmToken(dto);
  }
}
