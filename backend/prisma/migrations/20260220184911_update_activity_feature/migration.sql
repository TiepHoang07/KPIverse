/*
  Warnings:

  - The values [KPI_COMPLETED,LIKE] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `payload` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `GroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ActivityLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('KPI_LOG', 'KPI_CREATED', 'REQUEST_ADD_FRIEND', 'FRIEND_REQUEST_ACCEPTED', 'CREATE_GROUP', 'JOIN_GROUP', 'LEAVE_GROUP');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ActivityLike" DROP CONSTRAINT "ActivityLike_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLike" DROP CONSTRAINT "ActivityLike_userId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "payload",
ADD COLUMN     "completedTasks" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "kpiId" INTEGER,
ADD COLUMN     "kpiName" TEXT;

-- AlterTable
ALTER TABLE "GroupMember" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "points";

-- DropTable
DROP TABLE "ActivityLike";

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_groupId_idx" ON "Activity"("groupId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
