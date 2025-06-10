export interface TemperaturaData {
    id: number;
    caja?: number;
    numeroCasa: number;
    temperatura: number | null;
}

export interface casasVisitaData {
    id_madre_donante:number;
    id_casa_visita: number;
    id_ruta: number;
    observacion: string;
    id_info_madre: number;
    nombre: string;
    apellido: string;
    direccion: string;
    celular: string;
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