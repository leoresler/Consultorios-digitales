export class MedicoResponseDto {
    id: number;
    usuario?: {
        id: number; 
        nombre?: string;
        email?: string;
    };

    especialidades?: {
        id: number;
        nombre?: string;
    }[];

    consultorios?: {
        id: number;
        nombre: string;
        direccion: string;
    }[];

    tieneConsultorios?: boolean;
}