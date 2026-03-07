/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,decor,felt]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "decor" TEXT,
ADD COLUMN     "felt" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING_EMAIL';

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_decor_felt_key" ON "CartItem"("cartId", "productId", "decor", "felt");
