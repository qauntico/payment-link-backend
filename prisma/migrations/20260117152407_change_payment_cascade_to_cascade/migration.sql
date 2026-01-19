-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_productId_fkey";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
