import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { TransferDto } from './dto/transfer.dto';
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

  /**
   * Two-legged ledger transfer: debits the buyer and credits the seller
   * atomically, refusing (400 CSN-PAY-002) when the buyer's available balance
   * can't cover it. Callers must treat a non-2xx here as "no money moved".
   *
   * This exists instead of two `POST /internal/transactions` calls precisely
   * because the caller cannot make two independent inserts atomic.
   */
  @Post('transfer')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  transfer(@Body() dto: TransferDto) {
    return this.paymentService.transfer(dto);
  }
}
