import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseRightsDto } from './dto/purchase-rights.dto';
import { RightsService } from './rights.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly rightsService: RightsService) {}

  @Get('rights')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getListings(
    @Query('type') type: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.rightsService.getListings(type, page, pageSize);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  purchase(@Body() dto: PurchaseRightsDto, @Request() req) {
    return this.rightsService.purchase(req.user, dto);
  }
}
