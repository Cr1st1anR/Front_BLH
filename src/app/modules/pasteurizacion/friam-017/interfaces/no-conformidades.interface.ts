export interface NoConformidadesData {
  id?: number | null;
  fecha: string | Date | null;
  lote?: string | number;
  lote_id?: number | null;
  envase: number;
  suciedad: number;
  color: number;
  flavor: number;
  acidez: number;
  numero_muestras_testadas: number;
  numero_muestras_reprobadas: number;
  isNew?: boolean;
  _uid?: string;
}

export interface LoadingState {
  main: boolean;
  lotes: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
  subColumns?: SubColumn[];
}

export interface SubColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface LoteOption {
  label: string;
  value: string;
  numero_lote?: number;
}

export interface FiltroFecha {
  year: number;
  month: number;
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

export interface DatosBackendParaCreacion {
  fecha: string;
  lote: { id: number };
  envase: number;
  suciedad: number;
  color: number;
  flavor: number;
  acidez: number;
  numero_muestras_testadas: number;
  numero_muestras_reprobadas: number;
}

export interface DatosBackendParaActualizacion {
  id: number;
  fecha: string;
  lote: {
    id: number;
    numeroLote: number;
  };
  envase: number;
  suciedad: number;
  color: number;
  flavor: number;
  acidez: number;
  numero_muestras_testadas: number;
  numero_muestras_reprobadas: number;
}

export interface FiltrosBusqueda {
  lote: string;
}
