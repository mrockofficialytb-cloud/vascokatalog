-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('PERSON', 'COMPANY');

-- CreateEnum
CREATE TYPE "VolumeTier" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "buyerType" "BuyerType" NOT NULL DEFAULT 'PERSON',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "ico" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "volume" "VolumeTier" NOT NULL DEFAULT 'SMALL';
