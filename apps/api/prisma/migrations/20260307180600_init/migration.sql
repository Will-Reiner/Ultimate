-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "type" TEXT NOT NULL DEFAULT 'build',
    "frequency_type" TEXT NOT NULL,
    "days_of_week" INTEGER[],
    "goal_value" INTEGER,
    "goal_unit" TEXT,
    "reminder_time" TEXT,
    "color" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_entries" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,

    CONSTRAINT "habit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_entries" ADD CONSTRAINT "habit_entries_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
