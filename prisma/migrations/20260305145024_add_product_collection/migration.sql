-- CreateEnum
CREATE TYPE "ProductCollection" AS ENUM ('CLASSIC', 'PREMIUM', 'SPAZIO', 'MODULLO', 'RIFFCELLO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "collection" "ProductCollection";
