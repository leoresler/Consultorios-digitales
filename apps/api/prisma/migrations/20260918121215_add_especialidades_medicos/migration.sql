-- DropForeignKey
ALTER TABLE "medicos" DROP CONSTRAINT "medicos_id_especialidad_fkey";

-- CreateTable
CREATE TABLE "especialidades_medicos" (
    "id_especialidad" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,

    CONSTRAINT "especialidades_medicos_pkey" PRIMARY KEY ("id_especialidad","id_medico")
);

-- Backfill: preservar las especialidades ya asignadas a cada médico
INSERT INTO "especialidades_medicos" ("id_especialidad", "id_medico")
SELECT "id_especialidad", "id"
FROM "medicos"
WHERE "id_especialidad" IS NOT NULL;

-- AlterTable
ALTER TABLE "medicos" DROP COLUMN "id_especialidad";

-- AddForeignKey
ALTER TABLE "especialidades_medicos" ADD CONSTRAINT "especialidades_medicos_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "especialidades_medicos" ADD CONSTRAINT "especialidades_medicos_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;