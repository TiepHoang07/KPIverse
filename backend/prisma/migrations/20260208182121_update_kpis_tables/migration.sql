/*
  Warnings:

  - You are about to drop the column `target` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `KPILog` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `KPILog` table. All the data in the column will be lost.
  - You are about to drop the column `kpiId` on the `KPILog` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `KPILog` table. All the data in the column will be lost.
  - Added the required column `completed` to the `KPILog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kpiTaskId` to the `KPILog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `KPILog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KPILog" DROP CONSTRAINT "KPILog_kpiId_fkey";

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "target";

-- AlterTable
ALTER TABLE "KPILog" DROP COLUMN "createdAt",
DROP COLUMN "date",
DROP COLUMN "kpiId",
DROP COLUMN "value",
ADD COLUMN     "completed" BOOLEAN NOT NULL,
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "kpiTaskId" INTEGER NOT NULL,
ADD COLUMN     "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scope" "KPIScope" NOT NULL;

-- CreateTable
CREATE TABLE "KPITask" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" "KPIScope" NOT NULL,
    "groupId" INTEGER,

    CONSTRAINT "KPITask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KPITask_kpiId_idx" ON "KPITask"("kpiId");

-- CreateIndex
CREATE INDEX "KPITask_scope_idx" ON "KPITask"("scope");

-- CreateIndex
CREATE INDEX "KPITask_groupId_idx" ON "KPITask"("groupId");

-- CreateIndex
CREATE INDEX "KPI_scope_idx" ON "KPI"("scope");

-- CreateIndex
CREATE INDEX "KPILog_userId_idx" ON "KPILog"("userId");

-- CreateIndex
CREATE INDEX "KPILog_groupId_idx" ON "KPILog"("groupId");

-- CreateIndex
CREATE INDEX "KPILog_scope_idx" ON "KPILog"("scope");

-- CreateIndex
CREATE INDEX "KPILog_kpiTaskId_idx" ON "KPILog"("kpiTaskId");

-- AddForeignKey
ALTER TABLE "KPITask" ADD CONSTRAINT "KPITask_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPILog" ADD CONSTRAINT "KPILog_kpiTaskId_fkey" FOREIGN KEY ("kpiTaskId") REFERENCES "KPITask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
