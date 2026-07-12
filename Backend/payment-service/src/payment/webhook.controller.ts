import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() dto: WebhookEventDto) {
    return this.paymentService.handleWebhook(dto);
  }
}
