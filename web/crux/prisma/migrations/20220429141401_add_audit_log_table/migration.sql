-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "serviceCall" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
