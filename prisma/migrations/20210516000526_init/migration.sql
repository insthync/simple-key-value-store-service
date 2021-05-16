-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "ownerId" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT,

    PRIMARY KEY ("id")
);
