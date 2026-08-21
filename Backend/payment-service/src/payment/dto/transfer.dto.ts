import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Body of the internal buyer->seller ledger transfer. Both legs (buyer debit,
 * seller credit) are derived from this single request so they can never drift
 * apart. `amount` is @IsInt because Transaction.amount is a Prisma Int column —
 * a decimal would be silently truncated/rejected at the DB layer otherwise.
 */
export class TransferDto {
  @IsString()
  buyerId: string;

  @IsString()
  buyerUserId: string;

  @IsString()
  sellerId: string;

  @IsString()
  sellerUserId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
