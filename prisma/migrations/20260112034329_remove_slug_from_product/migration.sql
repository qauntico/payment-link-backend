-- AlterTable
ALTER TABLE "products" DROP COLUMN IF EXISTS "slug";

-- DropIndex
DROP INDEX IF EXISTS "products_slug_key";
DROP INDEX IF EXISTS "products_slug_idx";
