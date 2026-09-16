export interface MedicoConRelaciones {
    id: number;
    usuarios: {
        id: number;
        nombre: string;
        email: string | null;
    } | null;
    especialidades: {
        id: number;
        nombre: string;
    } | null;
}