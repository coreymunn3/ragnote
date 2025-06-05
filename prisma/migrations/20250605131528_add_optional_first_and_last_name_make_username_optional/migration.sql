-- DropIndex
DROP INDEX "app_user_username_key";

-- AlterTable
ALTER TABLE "app_user" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ALTER COLUMN "username" DROP NOT NULL;
