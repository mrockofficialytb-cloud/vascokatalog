/*
  Warnings:

  - The values [CANCELLED] on the enum `InquiryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InquiryStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELED');
ALTER TABLE "public"."Inquiry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Inquiry" ALTER COLUMN "status" TYPE "InquiryStatus_new" USING ("status"::text::"InquiryStatus_new");
ALTER TYPE "InquiryStatus" RENAME TO "InquiryStatus_old";
ALTER TYPE "InquiryStatus_new" RENAME TO "InquiryStatus";
DROP TYPE "public"."InquiryStatus_old";
ALTER TABLE "Inquiry" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT;
