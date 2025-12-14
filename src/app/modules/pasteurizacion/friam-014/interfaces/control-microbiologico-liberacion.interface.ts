// ============= INTERFACES PARA DATOS DEL BACKEND =============

export interface EmpleadoBackend {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CicloBackend {
  id: number;
  numeroCiclo: number;
}

export interface LoteBackend {
  id: number;
  numeroLote: number;
  ciclo: CicloBackend;
}

export interface ControlReenvaseBackend {
  id: number;
  fecha: string;
  lote: LoteBackend;
}

export interface InfoControlBackend {
  id: number;
  fechaSiembre: string;
  primeraLectura: string;
  responsableSiembre: EmpleadoBackend;
  responsableLectura: EmpleadoBackend;
  responsableProcesamiento: EmpleadoBackend;
  coordinador: EmpleadoBackend;
}

export interface ControlMicrobiologicoBackend {
  id: number;
  fecha: string;
  coliformes: number;
  conformidad: number;
  pruebaConfirmatoria: number;
  liberacion: number;
  observaciones: string;
  infoControl: {
    id: number;
    fechaSiembre: string;
    primeraLectura: string;
  };
}

export interface FrascoPasteurizadoBackend {
  id: number;
  volumen: number;
  numeroFrasco: number;
  observaciones: string | null;
  controlReenvase: ControlReenvaseBackend;
  controlMicrobiologico: ControlMicrobiologicoBackend | null;
}

export interface GetControlMicrobiologicoResponse {
  status: number;
  statusmsg: string;
  data: {
    infoControl: InfoControlBackend | null;
    frascos: FrascoPasteurizadoBackend[];
  };
}

// ============= INTERFACES PARA POST/PUT =============

export interface InfoControlDTO {
  id?: number;
  fechaSiembre: string;
  primeraLectura: string;
  responsableSiembre: { id: number };
  responsableLectura: { id: number };
  responsableProcesamiento: { id: number };
  coordinador: { id: number };
}

export interface ControlMicrobiologicoItemDTO {
  id?: number;
  idFrascoPasteurizado: number;
  fecha: string;
  coliformes: number;
  conformidad: number;
  pruebaConfirmatoria: number;
  liberacion: number;
  observaciones?: string;
}

export interface PostPutControlMicrobiologicoPayload {
  infoControl: InfoControlDTO;
  controles: ControlMicrobiologicoItemDTO[];
}

// ============= INTERFACES LOCALES DEL FRONTEND =============

export interface ControlMicrobiologicoLiberacionData {
  id?: number | null;
  numero_frasco_pasteurizado: string;
  id_frasco_pasteurizado?: number | null;
  coliformes_totales?: 0 | 1 | null;
  conformidad?: 0 | 1 | null;
  prueba_confirmatoria?: 0 | 1 | null;
  liberacion_producto?: 0 | 1 | null;
  fecha_pasteurizacion?: Date | string | null;
  ciclo?: number | string;
  lote?: number | string;
  isNew?: boolean;
  _uid?: string;
}

export interface DatosFormulario {
  fechaSiembra?: Date | null;
  horaSiembra?: string;
  horaSiembraAux?: Date | null;
  fechaPrimeraLectura?: Date | null;
  horaPrimeraLectura?: string;
  horaPrimeraLecturaAux?: Date | null;
  responsableSiembra?: string;
  responsableLectura?: string;
  responsableProcesamiento?: string;
  coordinadorMedico?: string;
  // IDs para backend
  responsableSiembraId?: number;
  responsableLecturaId?: number;
  responsableProcesamientoId?: number;
  coordinadorMedicoId?: number;
}

export interface PayloadControlMicrobiologico {
  datosFormulario: {
    fechaSiembra: Date;
    horaSiembra: string;
    fechaPrimeraLectura: Date;
    horaPrimeraLectura: string;
    responsableSiembra: string;
    responsableLectura: string;
    responsableProcesamiento: string;
    coordinadorMedico: string;
  };
  registrosControl: Array<{
    numero_frasco_pasteurizado: string;
    id_frasco_pasteurizado: number;
    coliformes_totales: 0 | 1;
    conformidad: 0 | 1;
    prueba_confirmatoria: 0 | 1 | null;
    liberacion_producto: 0 | 1;
    fecha_pasteurizacion: Date | string;
    ciclo: number;
    lote: number;
  }>;
}

export interface EmpleadoOption {
  id: number;
  nombre: string;
  cargo: string;
}

export interface LoadingState {
  main: boolean;
  search: boolean;
  empleados: boolean;
  saving: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface BusquedaCicloLote {
  ciclo: string;
  lote: string;
}

export interface FrascoPasteurizadoData {
  id: number;
  numeroFrasco: number;
  volumen?: number;
  observaciones?: string;
  fechaPasteurizacion: string;
  ciclo: number;
  lote: number;
  // Campos adicionales del backend
  tieneRegistroGuardado?: boolean;
  idControlMicrobiologico?: number;
  idInfoControl?: number;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export interface BackendResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
