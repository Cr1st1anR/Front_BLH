export interface TemperaturaData {
    id: number | null;
    caja?: number | null;
    numeroCasa: number | null;
    temperatura: number | null;
}

export interface casasVisitaData {
    id_madre_donante:number | null;
    id_casa_visita: number | null;
    id_ruta: number | null;
    observacion: string | null;
    id_info_madre?: number;
    nombre?: string | null;
    apellido?: string | null;
    direccion: string | null;
    celular: string | null;
    _uid?: string;
}

export interface MadresDonantes {
    id_madre_donante: number;
    donante_apta: number;
    donante_efectiva: number;
    documento: string;
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
    celular: string;
}

export interface CajaTable {
    cajaNumber: number;
    data: any[];
    headers: any[];
    editingRow: any | null;
    editingRowIndex: number;
    clonedRow: any | null;
    editValidate: boolean;
    isAddingTemperature: boolean;
    numeroTemperaturas: number;
}
