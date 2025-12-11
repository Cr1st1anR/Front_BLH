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
  muestrasTesteadas: number;
  muestrasReprobadas: number;
  isNew?: boolean;
  _uid?: string;
}

export interface LoadingState {
  main: boolean;
  lotes: boolean;
  calculando: boolean;
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
  numeroLote: number;
  loteId: number;
  cicloId?: number;
}

export interface FiltroFecha {
  year: number;
  month: number;
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

export interface NoConformidadesBackendResponse {
  id: number;
  fecha: string;
  envase: number;
  suciedad: number;
  color: number;
  flavor: number;
  muestrasTesteadas: number;
  muestrasReprobadas: number;
  acidez: number;
  lote: {
    id: number;
    numeroLote: number;
  };
}

export interface LoteBackendResponse {
  numeroLote: number;
  numeroCiclo: number;
  loteId: number;
  cicloId: number;
}

export interface DatosCalculadosResponse {
  envase: number;
  color: number;
  flavor: number;
  suciedad: number;
  acidez: number;
  muestrasTesteadas: number;
  muestrasReprobadas: number;
}

export interface DatosBackendParaCreacion {
  fecha: string;
  envase: number;
  color: number;
  flavor: number;
  suciedad: number;
  acidez: number;
  muestrasTesteadas: number;
  muestrasReprobadas: number;
  lote: number;
}

export interface FiltrosBusqueda {
  lote: string;
}
