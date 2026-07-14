import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { PaymentService } from './payment.service';

@Controller('internal/transactions')
export class InternalTransactionController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  record(@Body() dto: RecordTransactionDto) {
    return this.paymentService.recordTransaction(dto);
  }
}
