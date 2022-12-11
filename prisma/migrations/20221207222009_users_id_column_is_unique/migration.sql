/*
  Warnings:

  - A unique constraint covering the columns `[users_id]` on the table `refresh_token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "constraint_users_id" ON "refresh_token"("users_id");
