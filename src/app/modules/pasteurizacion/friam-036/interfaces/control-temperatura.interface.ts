export interface ControlTemperaturaData {
  id?: number | null;
  fecha: string | Date | null;
  lote: string;
  ciclo: string;
  horaInicio: string;
  horaFinalizacion: string;
  observaciones?: string;
  responsable: string;
  isNew?: boolean;
  _uid?: string;
  id_empleado?: number;
  empleado_info?: EmpleadoInfo;
  horaInicio_aux?: Date | null;
  horaFinalizacion_aux?: Date | null;
}

export interface LoadingState {
  main: boolean;
  empleados: boolean;
  lotes: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface LoteOption {
  label: string;
  value: string;
  numeroLote: number;
  ciclo: string;
  numeroCiclo: number;
}

export interface ResponsableOption {
  label: string;
  value: string;
  id_empleado?: number;
  cargo?: string;
  telefono?: number;
  correo?: string;
}

export interface EmpleadoInfo {
  id: number;
  nombre: string;
  cargo?: string;
  telefono?: number;
  correo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FiltrosBusqueda {
  lote: string;
  ciclo: string;
}

// ============= INTERFACES PARA RESPUESTAS DEL BACKEND =============

export interface ControlTemperaturaBackendResponse {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_finalizacio: string;
  observaciones?: string;
  lote: {
    id: number;
    numeroLote: number;
  };
  ciclo: {
    id: number;
    numeroCiclo: number;
  };
  responsable: {
    id: number;
    nombre: string;
    cargo: string;
    telefono: number;
    correo?: string;
    createdAt: string;
    updatedAt: string;
  };
  calentamientos: CalentamientoBackendData[];
  enfriamientos: EnfriamientoBackendData[];
}

export interface CalentamientoBackendData {
  id: number;
  minuto: string;
  valor: number;
}

export interface EnfriamientoBackendData {
  id: number;
  minuto: string;
  valor: number;
}

export interface EmpleadoBackendResponse {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoteBackendResponse {
  numeroLote: number;
  numeroCiclo: number;
}

export interface BackendResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export type TipoDialog = 'calentamiento' | 'enfriamiento';

export interface DatosBackendParaCreacion {
  fecha: string;
  lote: string;
  ciclo: string;
  horaInicio: string;
  horaFinalizacion: string;
  observaciones?: string;
  empleado: { id: number };
}

export interface DatosBackendParaActualizacion {
  id: number;
  fecha: string;
  lote: string;
  ciclo: string;
  horaInicio: string;
  horaFinalizacion: string;
  observaciones?: string;
  empleado: { id: number };
}
