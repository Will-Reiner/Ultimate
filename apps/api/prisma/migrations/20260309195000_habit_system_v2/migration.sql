-- CreateTable: categories
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateTable: tags
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: habit_tags
CREATE TABLE "habit_tags" (
    "habit_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "habit_tags_pkey" PRIMARY KEY ("habit_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "habit_tags" ADD CONSTRAINT "habit_tags_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_tags" ADD CONSTRAINT "habit_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: reminders
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: habits
ALTER TABLE "habits" RENAME COLUMN "title" TO "name";
ALTER TABLE "habits" DROP COLUMN "emoji";
ALTER TABLE "habits" DROP COLUMN "days_of_week";
ALTER TABLE "habits" DROP COLUMN "goal_value";
ALTER TABLE "habits" DROP COLUMN "goal_unit";
ALTER TABLE "habits" DROP COLUMN "reminder_time";
ALTER TABLE "habits" DROP COLUMN "color";
ALTER TABLE "habits" DROP COLUMN "is_archived";

ALTER TABLE "habits" ADD COLUMN "tracking_mode" TEXT NOT NULL DEFAULT 'boolean';
ALTER TABLE "habits" ADD COLUMN "daily_target" INTEGER;
ALTER TABLE "habits" ADD COLUMN "target_unit" TEXT;
ALTER TABLE "habits" ADD COLUMN "frequency_times_per_week" INTEGER;
ALTER TABLE "habits" ADD COLUMN "frequency_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
ALTER TABLE "habits" ADD COLUMN "frequency_every_n_days" INTEGER;
ALTER TABLE "habits" ADD COLUMN "goal_type" TEXT;
ALTER TABLE "habits" ADD COLUMN "goal_target_value" INTEGER;
ALTER TABLE "habits" ADD COLUMN "goal_target_unit" TEXT;
ALTER TABLE "habits" ADD COLUMN "goal_deadline" TIMESTAMP(3);
ALTER TABLE "habits" ADD COLUMN "goal_status" TEXT;
ALTER TABLE "habits" ADD COLUMN "category_id" TEXT;
ALTER TABLE "habits" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "habits" ADD COLUMN "track_relapse_intensity" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "habits" ADD COLUMN "track_relapse_trigger" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: habit_entries
ALTER TABLE "habit_entries" ADD COLUMN "date" TEXT NOT NULL DEFAULT '';
ALTER TABLE "habit_entries" ADD COLUMN "entry_type" TEXT NOT NULL DEFAULT 'check_in';
ALTER TABLE "habit_entries" ADD COLUMN "intensity" INTEGER;
ALTER TABLE "habit_entries" ADD COLUMN "trigger" TEXT;
ALTER TABLE "habit_entries" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate existing data: populate date from completed_at
UPDATE "habit_entries" SET "date" = TO_CHAR("completed_at", 'YYYY-MM-DD');

-- Drop old column
ALTER TABLE "habit_entries" DROP COLUMN "completed_at";
