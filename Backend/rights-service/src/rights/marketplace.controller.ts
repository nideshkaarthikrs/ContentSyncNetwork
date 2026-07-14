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
import { clampPagination } from '../shared/pagination.helper';
import { CreateListingDto } from './dto/create-listing.dto';
import { PurchaseRightsDto } from './dto/purchase-rights.dto';
import { RightsService } from './rights.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly rightsService: RightsService) {}

  @Post('rights')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createListing(@Body() dto: CreateListingDto, @Request() req) {
    return this.rightsService.createListing(req.user, dto);
  }

  @Get('rights/my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyListings(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.rightsService.getMyListings(req.user.id, clamped.page, clamped.pageSize);
  }

  @Get('rights')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getListings(
    @Query('type') type: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.rightsService.getListings(type, clamped.page, clamped.pageSize);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  purchase(@Body() dto: PurchaseRightsDto, @Request() req) {
    return this.rightsService.purchase(req.user, dto);
  }
}
