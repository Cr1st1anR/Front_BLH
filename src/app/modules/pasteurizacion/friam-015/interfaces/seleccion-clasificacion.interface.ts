// Agregar a la interfaz para futuras mejoras
export interface SeleccionClasificacionData {
  id?: number | null;
  fecha: string | Date | null;
  gaveta_cruda?: string;
  dias_produccion?: string;
  no_frasco_procesado?: string;
  donante?: string;
  frasco_leche_cruda?: string;
  edad_gestacional?: number;
  volumen?: string;
  analisis_sensorial?: any;
  acidez_dornic?: any;
  crematocrito?: any;
  nombre_profesional?: string;
  nombre_auxiliar?: string;
  n_frascos_pasteurizados?: number;
  volumen_pasteurizado?: string;
  fecha_vencimiento?: string | Date | null;
  observaciones?: string;
  ciclo?: string;
  n_lote_medios_cultivo?: string;
  fecha_vencimiento_cultivos?: string | Date | null;
  lote?: string;
  id_empleado_profesional?: number;
  id_empleado_auxiliar?: number;

  // Nuevo campo para almacenar el ID real de infoSeleccionClasificacion cuando el backend lo envíe
  id_info_seleccion_clasificacion?: number;
}

export interface LoadingState {
  main: boolean;
  donantes: boolean;
  frascos: boolean;
  empleados: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
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
  no_frasco_procesado: string;
  donante: string;
  frasco_leche_cruda: string;
  ciclo: string;
  lote: string;
}

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
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
export type TipoDialog = 'analisis_sensorial' | 'acidez_dornic' | 'crematocrito';
