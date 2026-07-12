import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymentService } from './payment.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() dto: CreateSubscriptionDto) {
    return this.paymentService.createSubscription(req.user, dto);
  }
}
