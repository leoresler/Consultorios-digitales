export class MedicoResponseDto {
    id: number;
    usuario?: {
        id: number; 
        nombre?: string;
        email?: string;
    };

    especialidad?: {
        id: number;
        nombre?: string;
    }

    tieneConsultorios?: boolean;
}