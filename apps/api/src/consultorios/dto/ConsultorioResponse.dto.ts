export class ConsultorioResponseDto {
    id: number;
    nombre: string;
    direccion: string;
    medicos?: {
        id: number;
        nombre?: string;
    }[];
}