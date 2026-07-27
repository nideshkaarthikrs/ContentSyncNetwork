import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  // Guarded with the shared internal secret as a placeholder: no real payment
  // gateway is integrated yet, so nothing external needs to reach this. When a
  // gateway is wired up, replace the guard with that provider's HMAC signature
  // verification (a real gateway can't send x-internal-secret).
  @Post('webhook')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() dto: WebhookEventDto) {
    return this.paymentService.handleWebhook(dto);
  }
}
