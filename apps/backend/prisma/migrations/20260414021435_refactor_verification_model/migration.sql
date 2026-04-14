-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "decisionAt" DATETIME,
    "provider" TEXT NOT NULL DEFAULT 'didit',
    "payloadHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Verification" ("createdAt", "id", "sessionId", "status", "updatedAt", "userId") SELECT "createdAt", "id", "sessionId", "status", "updatedAt", "userId" FROM "Verification";
DROP TABLE "Verification";
ALTER TABLE "new_Verification" RENAME TO "Verification";
CREATE UNIQUE INDEX "Verification_userId_key" ON "Verification"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
