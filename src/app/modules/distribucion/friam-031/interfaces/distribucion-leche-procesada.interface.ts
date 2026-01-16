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

// ✅ MODIFICADO: Interface para las opciones del selector - ahora por identificación
export interface OpcionFechaDistribucion {
  label: string; // Formato: "1234567890 - María Pérez"
  value: string; // ID de la distribución
  identificacion: string; // Identificación del bebé
  nombreBebe: string; // Nombre del bebé
  id_registro: number; // ID de la distribución
  fechaPrimerRegistro?: Date; // Fecha del primer registro (para referencia interna)
}

export interface LoadingState {
  main: boolean;
  empleados: boolean;
  frascos: boolean;
  saving: boolean;
  fechas: boolean;
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
