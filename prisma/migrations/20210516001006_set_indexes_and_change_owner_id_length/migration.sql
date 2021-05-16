/*
  Warnings:

  - You are about to alter the column `ownerId` on the `Entry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(36)`.

*/
-- AlterTable
ALTER TABLE "Entry" ALTER COLUMN "ownerId" SET DATA TYPE VARCHAR(36);

-- CreateIndex
CREATE INDEX "Entry.ownerId_key_index" ON "Entry"("ownerId", "key");
