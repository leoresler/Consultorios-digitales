export interface MedicoConRelaciones {
    id: number;
    usuarios: {
        id: number;
        nombre: string;
        email: string | null;
    } | null;
    especialidades_medicos: {
        especialidades: {
            id: number;
            nombre: string;
        };
    }[];
    consultorios_medicos: {
        consultorios: {
            id: number;
            nombre: string;
            direccion: string;
        };
    }[];
    _count: {
        consultorios_medicos: number;
    };
}