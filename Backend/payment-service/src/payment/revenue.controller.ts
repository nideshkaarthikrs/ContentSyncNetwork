import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WithdrawDto } from './dto/withdraw.dto';
import { PaymentService } from './payment.service';

@Controller('revenues')
export class RevenueController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  dashboard(@Request() req) {
    return this.paymentService.getRevenueDashboard(req.user);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  withdraw(@Request() req, @Body() dto: WithdrawDto) {
    return this.paymentService.withdraw(req.user, dto);
  }
}
