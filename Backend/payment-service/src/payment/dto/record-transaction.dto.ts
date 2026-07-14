import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum TransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  MARKETPLACE_SALE = 'MARKETPLACE_SALE',
  ROYALTY = 'ROYALTY',
}

export class RecordTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  userDisplayId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  amount: number;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
