export interface lineaAmigaData {
    idMadrePotencial?: number;
    infoMadre?:number;
    entidad: string;
    nombre: string;
    apellido: string;
    fechaParto: Date | null | string;
    documento: string;
    fechaNacimiento: Date | null | number;
    fechaNacAux?: Date | null | number;
    telefono: string;
    barrio: string;
    direccion: string;
    educacionPresencial: number | null;
    fechaLlamada: Date | null | string;
    llamada: string;
    responsable: string | null;
    asesoria: number | null;
    donanteEfectiva: number | null;
    fechaVisita: Date | null | string;
    observacion: string;
    fechaRegistro: Date | null | string;
}

export interface entidades {
    id: number;
    nombre: string;
    activo: number;
}

export interface empleados {
    id: number;
    nombre: string;
    cargo: string;
    telefono: number;
    correo: string | null;
    createdAt: string; 
    updatedAt: string;  
}

export interface ApiResponse {
    status: number;
    statusmsg: string;
    data: [];
  }