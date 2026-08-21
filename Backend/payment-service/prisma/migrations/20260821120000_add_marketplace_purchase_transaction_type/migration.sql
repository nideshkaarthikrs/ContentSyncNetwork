-- AlterEnum
-- Adds the buyer-side leg of a marketplace purchase. Until now only the seller
-- was ever credited (MARKETPLACE_SALE) and no buyer was debited, so marketplace
-- goods were effectively free. Postgres 12+ permits ALTER TYPE ... ADD VALUE
-- inside a transaction as long as the new value is not *used* in the same
-- transaction; this migration only declares it, so it is safe under
-- `prisma migrate deploy`.
ALTER TYPE "TransactionType" ADD VALUE 'MARKETPLACE_PURCHASE';
