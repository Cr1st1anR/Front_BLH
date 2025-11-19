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
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
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
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FiltrosBusqueda {
  lote: string;
  ciclo: string;
}

export interface BackendResponse<T> {
  data: T;
  message?: string;
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
