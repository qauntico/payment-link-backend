-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('XAF', 'USD');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'XAF';
