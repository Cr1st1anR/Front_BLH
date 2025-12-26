export interface EntradasSalidasPasteurizadaData {
  id?: number | null;
  fecha_procesamiento: string | Date | null;
  congelador: string;
  n_gaveta: string;
  n_frasco_pasteurizado: string;
  volumen_cc: string;
  dornic: string;
  kcal_l: string;
  fecha_parto?: string | Date | null;
  dias_posparto: string;
  donante: string;
  edad_gestacional: number;
  fecha_vencimiento: string | Date | null;
  responsable_entrada: string;
  fecha_salida: string | Date | null;
  responsable_salida: string;
  id_empleado_entrada?: number | null;
  id_empleado_salida?: number | null;
  lote?: number | null;
}

export interface LoadingState {
  main: boolean;
  empleados: boolean;
  search: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
  grupo?: 'entrada' | 'salida';
  vertical?: boolean;
}

export interface ResponsableOption {
  label: string;
  value: string;
  id_empleado?: number;
  cargo?: string;
  telefono?: number;
  correo?: string;
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FiltrosBusqueda {
  n_frasco_pasteurizado: string;
  donante: string;
  n_gaveta: string;
}

export interface BusquedaLote {
  lote: number | string;
}

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';
