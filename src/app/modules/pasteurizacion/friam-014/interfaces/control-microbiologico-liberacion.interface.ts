export interface ControlMicrobiologicoLiberacionData {
  id?: number | null;
  numero_frasco_pasteurizado: string;
  id_frasco_pasteurizado?: number | null;
  coliformes_totales?: 0 | 1 | null; // 0 = P, 1 = A
  conformidad?: 0 | 1 | null; // 0 = NC, 1 = C
  prueba_confirmatoria?: 'PC' | null;
  liberacion_producto?: 0 | 1 | null; // 0 = No, 1 = Si
  fecha_pasteurizacion?: Date | string | null;
  ciclo?: number | string;
  lote?: number | string;
  isNew?: boolean;
  _uid?: string;
}

export interface DatosFormulario {
  fechaSiembra?: Date | null;
  horaSiembra?: string;
  fechaPrimeraLectura?: Date | null;
  horaPrimeraLectura?: string;
  responsableSiembra?: string;
  responsableLectura?: string;
  responsableProcesamiento?: string;
  coordinadorMedico?: string;
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
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export interface BackendResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
