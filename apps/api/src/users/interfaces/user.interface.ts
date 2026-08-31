export interface Usuario {
    id: number;
    //id_genero: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    email: string;
    passwordHash: string;
}

export type UserRole = 'ADMIN' | 'PACIENTE' | 'MEDICO';