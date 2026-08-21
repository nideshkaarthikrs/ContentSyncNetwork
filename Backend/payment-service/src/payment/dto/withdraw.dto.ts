import { IsInt, IsString, Min } from 'class-validator';

export class WithdrawDto {
  // @IsInt, not @IsNumber: WithdrawalRequest.amount is a Prisma Int column, so a
  // decimal amount (e.g. 500.75) would be rejected by the DB or silently lose
  // its fractional part. @IsInt runs Number.isInteger(value) and there is no
  // implicit string->number coercion configured on the global ValidationPipe,
  // so 500.75 and "500" are both refused with a 400 before reaching Prisma.
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  bankAccountId: string;
}
