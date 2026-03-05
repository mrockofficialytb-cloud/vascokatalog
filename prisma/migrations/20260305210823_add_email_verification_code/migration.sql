-- 1) Přidat novou enum hodnotu (jen přidání, NIC ji zatím nepoužije)
ALTER TYPE "AccountStatus" ADD VALUE IF NOT EXISTS 'PENDING_EMAIL';

-- 2) Vytvořit tabulku pro ověřovací kódy
CREATE TABLE IF NOT EXISTS "EmailVerificationCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);

-- 3) Unikátní vazba 1:1 na uživatele
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationCode_userId_key" ON "EmailVerificationCode"("userId");

-- 4) Index na expiraci
CREATE INDEX IF NOT EXISTS "EmailVerificationCode_expiresAt_idx" ON "EmailVerificationCode"("expiresAt");

-- 5) FK vazba
ALTER TABLE "EmailVerificationCode"
ADD CONSTRAINT "EmailVerificationCode_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- DŮLEŽITÉ:
-- NEDEJ sem nic jako:
-- ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING_EMAIL';
-- to musí být až v další migraci (další transakce).