-- CreateTable
CREATE TABLE "consultorios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(50) NOT NULL,

    CONSTRAINT "consultorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultorios_medicos" (
    "id_consultorio" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,

    CONSTRAINT "consultorios_medicos_pkey" PRIMARY KEY ("id_consultorio","id_medico")
);

-- CreateTable
CREATE TABLE "dias_atencion" (
    "id" SERIAL NOT NULL,
    "id_medico" INTEGER,
    "id_clinica" INTEGER,
    "dia_semana" VARCHAR(10) NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,
    "duracion_turno" INTEGER NOT NULL,

    CONSTRAINT "dias_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_clinicos" (
    "id" SERIAL NOT NULL,
    "id_estudio_clinico" INTEGER,
    "archivo" VARCHAR(255) NOT NULL,

    CONSTRAINT "documentos_clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genero" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "genero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historia_clinica" (
    "id" SERIAL NOT NULL,
    "idpaciente" INTEGER,
    "idmedico" INTEGER,
    "idtipoestudio" INTEGER,
    "resultados" TEXT,
    "fecharealizacion" DATE,

    CONSTRAINT "historia_clinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "id_especialidad" INTEGER,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "cobertura" VARCHAR(40),

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" SERIAL NOT NULL,
    "idpaciente" INTEGER,
    "idmedico" INTEGER,
    "idmedicacion" INTEGER,
    "dosis" INTEGER,
    "frecuencia" INTEGER,
    "indicada" DATE,
    "vigencia" DATE,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_estudio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "tipos_estudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "id_paciente" INTEGER,
    "id_medico" INTEGER,
    "id_especialidad" INTEGER,
    "id_clinica" INTEGER,
    "fecha" DATE NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "id_genero" INTEGER,
    "nombre" VARCHAR(20) NOT NULL,
    "apellido" VARCHAR(50) NOT NULL,
    "fecha_nacimiento" DATE,
    "email" VARCHAR(100),
    "telefono" VARCHAR(20),
    "contrasena" VARCHAR(100),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_documento" (
    "id_usuario" INTEGER NOT NULL,
    "id_documento" INTEGER NOT NULL,
    "documento" VARCHAR(50) NOT NULL,

    CONSTRAINT "usuarios_documento_pkey" PRIMARY KEY ("id_usuario","id_documento")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_usuario" (
    "id_usuario" INTEGER NOT NULL,
    "id_roles" INTEGER NOT NULL,

    CONSTRAINT "roles_usuario_pkey" PRIMARY KEY ("id_usuario","id_roles")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefono_key" ON "usuarios"("telefono");

-- AddForeignKey
ALTER TABLE "consultorios_medicos" ADD CONSTRAINT "consultorios_medicos_id_consultorio_fkey" FOREIGN KEY ("id_consultorio") REFERENCES "consultorios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultorios_medicos" ADD CONSTRAINT "consultorios_medicos_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dias_atencion" ADD CONSTRAINT "dias_atencion_id_clinica_fkey" FOREIGN KEY ("id_clinica") REFERENCES "consultorios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dias_atencion" ADD CONSTRAINT "dias_atencion_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documentos_clinicos" ADD CONSTRAINT "documentos_clinicos_id_estudio_clinico_fkey" FOREIGN KEY ("id_estudio_clinico") REFERENCES "historia_clinica"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historia_clinica" ADD CONSTRAINT "historia_clinica_idmedico_fkey" FOREIGN KEY ("idmedico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historia_clinica" ADD CONSTRAINT "historia_clinica_idpaciente_fkey" FOREIGN KEY ("idpaciente") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historia_clinica" ADD CONSTRAINT "historia_clinica_idtipoestudio_fkey" FOREIGN KEY ("idtipoestudio") REFERENCES "tipos_estudio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_idmedicacion_fkey" FOREIGN KEY ("idmedicacion") REFERENCES "medicamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_idmedico_fkey" FOREIGN KEY ("idmedico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_idpaciente_fkey" FOREIGN KEY ("idpaciente") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_id_clinica_fkey" FOREIGN KEY ("id_clinica") REFERENCES "consultorios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_id_especialidad_fkey" FOREIGN KEY ("id_especialidad") REFERENCES "especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "genero"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios_documento" ADD CONSTRAINT "usuarios_documento_id_documento_fkey" FOREIGN KEY ("id_documento") REFERENCES "documentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios_documento" ADD CONSTRAINT "usuarios_documento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roles_usuario" ADD CONSTRAINT "roles_usuario_id_roles_fkey" FOREIGN KEY ("id_roles") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roles_usuario" ADD CONSTRAINT "roles_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
