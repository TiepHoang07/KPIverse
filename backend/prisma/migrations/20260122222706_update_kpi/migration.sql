/*
  Warnings:

  - You are about to drop the `KPIrecord` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scope` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `KPI` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "KPIType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "KPIScope" AS ENUM ('PERSONAL', 'GROUP');

-- DropForeignKey
ALTER TABLE "KPI" DROP CONSTRAINT "KPI_userId_fkey";

-- DropForeignKey
ALTER TABLE "KPIrecord" DROP CONSTRAINT "KPIrecord_kpiId_fkey";

-- AlterTable
ALTER TABLE "KPI" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "scope" "KPIScope" NOT NULL,
ADD COLUMN     "target" INTEGER NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "KPIType" NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "KPIrecord";

-- CreateTable
CREATE TABLE "KPILog" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KPILog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KPI_userId_idx" ON "KPI"("userId");

-- CreateIndex
CREATE INDEX "KPI_groupId_idx" ON "KPI"("groupId");

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPILog" ADD CONSTRAINT "KPILog_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPILog" ADD CONSTRAINT "KPILog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
