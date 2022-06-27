-- CreateTable
CREATE TABLE "UserInvite" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User__Team" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "owner" BOOLEAN NOT NULL,

    CONSTRAINT "User__Team_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_userId_teamId_email_key" ON "UserInvite"("userId", "teamId", "email");
