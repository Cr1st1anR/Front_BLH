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
  analisis_sensorial?: any; // Para el dialog
  acidez_dornic?: any; // Para el dialog
  crematocrito?: any; // Para el dialog
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
  isNew?: boolean;
  _uid?: string;
  id_empleado_profesional?: number;
  id_empleado_auxiliar?: number;
  id_madre_donante?: number;
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
  vertical?: boolean; // Nueva propiedad para columnas verticales
}

export interface ResponsableOption {
  label: string;
  value: string;
  id_empleado?: number;
  cargo?: string;
  telefono?: number;
  correo?: string;
}

export interface DonanteOption {
  label: string;
  value: string;
  documento?: string;
}

export interface FrascoOption {
  label: string;
  value: string;
  donante?: string;
  volumen?: string;
  id_frasco?: number;
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

export type TipoDialog = 'analisis_sensorial' | 'acidez_dornic' | 'crematocrito';

export interface DatosBackendParaCreacion {
  fecha: string;
  gavetaCruda: string;
  diasProduccion: number;
  madreDonante: { id: number };
  empleadoProfesional: { id: number };
  empleadoAuxiliar: { id: number };
  // ... otros campos según necesites
}

export interface DatosBackendParaActualizacion extends DatosBackendParaCreacion {
  id: number;
}
