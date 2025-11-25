export interface ControlMicrobiologicoLiberacionData {
  id?: number | null;
  numero_frasco_pasteurizado: string;
  id_frasco_pasteurizado?: number | null;
  coliformes_totales?: 'A' | 'P' | null;
  conformidad?: 'C' | 'NC' | null;
  prueba_confirmatoria?: 'PC' | null;
  liberacion_producto?: 'Si' | 'No' | null;
  fecha_pasteurizacion?: Date | string | null;
  ciclo?: number | string;
  lote?: number | string;
  isNew?: boolean;
  _uid?: string;
}

export interface LoadingState {
  main: boolean;
  search: boolean;
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
