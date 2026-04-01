-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "guideDownloadTokenHash" TEXT,
ADD COLUMN "guideDownloadExpiresAt" TIMESTAMP(3),
ADD COLUMN "guideDownloadUsedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_guideDownloadTokenHash_key" ON "Order"("guideDownloadTokenHash");
