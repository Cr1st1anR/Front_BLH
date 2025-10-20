export interface ControlLecheCrudaData {
  id?: number;
  nCongelador: string;
  ubicacion: string;
  gaveta: string;
  diasPosparto: string;
  donante: string;
  numFrasco: string;
  edadGestacional: string;
  volumen: string;
  fechaExtraccion: string;
  fechaVencimiento: string;
  fechaParto: string;
  procedencia: string;
  fechaEntrada: string;
  responsableEntrada: string;
  fechaSalida: string;
  responsableSalida: string;
  fechaRegistro?: string;
  idFrascoLecheCruda?: number;
}

// Nueva interfaz para mapear la respuesta del backend
export interface EntradasSalidasApiResponse {
  id: number;
  fechaVencimiento: string;
  procedencia: string | null;
  fechaEntrada: string | null;
  fechaSalida: string | null;
  madreDonante: {
    id: number;
    donanteExclusivo: number;
    tipoDonante: string;
    recoleccionDomicilio: number;
    capacitado: string;
    recibioEducacion: string;
    donanteApta: number;
    firmaDonante: string;
    firmaProfesional: string;
    firmaAcompañante: string;
    activo: number;
    fecha_diligenciamiento: string;
    madrePotencial: {
      id: number;
      educacion_presencial: number;
      fecha_llamada: string;
      llamada: string;
      asesoria: number;
      donante_efectiva: number;
      fecha_visita: string;
      observacion: string;
      fecha_registro: string;
      infoMadre: {
        id: number;
        nombre: string;
        apellido: string;
        documento: string;
        fechaNacimiento: string;
        fechaParto: string;
        telefono: string;
        celular: string;
        departamento: string;
        ciudad: string;
        barrio: string;
        direccion: string;
        profesion: string;
        eps: string;
      };
    };
  };
  frascoRecolectado: {
    id: number;
    volumen: number;
    fechaDeExtraccion: string;
    termo: number;
    gaveta: number;
    congelador: {
      id: number;
      descripcion: string;
    };
  } | null;
  extraccion: {
    id: number;
    cantidad: number;
    hora: string;
    gaveta: number;
    fechaExtraccion: string;
    congelador: {
      id: number;
      descripcion: string;
    };
  } | null;
}

export interface EmpleadoResponse {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}
