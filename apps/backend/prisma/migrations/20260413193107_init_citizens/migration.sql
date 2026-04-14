-- CreateTable
CREATE TABLE "Citizen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cedula" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "registrationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "lastVerified" DATETIME NOT NULL,
    "node" TEXT NOT NULL DEFAULT 'NODE-04-DR'
);

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_cedula_key" ON "Citizen"("cedula");
