export interface DistribucionLecheProcesadaData {
  id?: number | null;
  fecha: string | Date | null;
  vol_distribuido: string;
  n_frasco_leche_procesada: string;
  id_frasco_leche_procesada?: number | null;
  calorias: string;
  acidez_dornic: string;
  tipo_edad: string;
  exclusiva: number;
  freezer: string;
  gaveta: string;
}

// ✅ NUEVO: Interface para datos del bebé (receptor)
export interface DatosReceptor {
  id?: number | null;
  responsable_prescripcion: string;
  nombre_bebe: string;
  identificacion_bebe: string;
  semanas_gestacion: string;
  eps: string;
}

// ✅ NUEVO: Interface para el payload completo
export interface PayloadDistribucionCompleta {
  datosReceptor: DatosReceptor;
  registrosDistribucion: DistribucionLecheProcesadaData[];
}

// ✅ NUEVO: Interface para las opciones del selector de fechas
export interface OpcionFechaDistribucion {
  label: string;
  value: string;
  fecha: Date;
  id_registro?: number;
  nombreBebe?: string;
}

export interface LoadingState {
  main: boolean;
  empleados: boolean;
  frascos: boolean;
  saving: boolean; // ✅ NUEVO: para el guardado global
  fechas: boolean; // ✅ NUEVO: para cargar fechas
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
  grupo?: 'receptores' | 'leche_pasteurizada';
  vertical?: boolean;
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FrascoOption {
  label: string;
  value: string;
  id_frasco: number;
  numeroFrasco: number;
  año: number;
}

export interface TipoEdadOption {
  label: string;
  value: string;
}

// ✅ NUEVO: Opciones de EPS
export interface EpsOption {
  label: string;
  value: string;
}

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';
