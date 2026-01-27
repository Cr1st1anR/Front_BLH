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

// ✅ Interface para datos del bebé (receptor)
export interface DatosReceptor {
  id?: number | null;
  responsable_prescripcion: string;
  nombre_bebe: string;
  identificacion_bebe: string;
  semanas_gestacion: string;
  eps: string;
}

// ✅ Interface para el payload completo
export interface PayloadDistribucionCompleta {
  datosReceptor: DatosReceptor;
  registrosDistribucion: DistribucionLecheProcesadaData[];
}

// ✅ Interface para las opciones del selector
export interface OpcionFechaDistribucion {
  label: string;
  value: string;
  identificacion: string;
  nombreBebe: string;
  id_registro: number;
  fechaPrimerRegistro?: Date;
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
  // ✅ NUEVOS CAMPOS
  calorias?: number;
  acidezDornic?: number;
  gaveta?: number;
}

export interface TipoEdadOption {
  label: string;
  value: string;
}

export interface EpsOption {
  label: string;
  value: string;
}

// ============= INTERFACES PARA BACKEND =============

// ✅ Respuesta de getDistribucionPorMes
export interface DistribucionResumenBackend {
  id: number;
  nombreBeneficiario: string;
  identificacion: number;
}

// ✅ Respuesta completa de getDistribucionById
export interface DistribucionCompletaBackend {
  id: number;
  nombreBeneficiario: string;
  identificacion: number;
  semanasGestacion: number;
  eps: string;
  responsable: string;
  infoDistribucion: InfoDistribucionBackend[];
}

export interface InfoDistribucionBackend {
  id: number;
  fecha: string;
  volumenDistribuido: number;
  tipo: string;
  exclusiva: number;
  frascoPasteurizado: FrascoPasteurizadoBackend;
}

export interface FrascoPasteurizadoBackend {
  id: number;
  volumen: number;
  numeroFrasco: number;
  observaciones: string | null;
  activo: boolean;
  entradasSalidasPasteurizada: EntradasSalidasBackend;
  controlReenvase: ControlReenvaseBackend;
}

export interface EntradasSalidasBackend {
  id: number;
  gaveta: number;
  fechaSalida: string;
}

export interface ControlReenvaseBackend {
  id: number;
  fecha: string;
  seleccionClasificacion: SeleccionClasificacionBackend;
}

export interface SeleccionClasificacionBackend {
  id: number;
  fecha: string;
  acidezDornic: AcidezDornicBackend;
  crematocrito: CrematocritoBackend;
}

export interface AcidezDornicBackend {
  id: number;
  primera: number;
  segunda: number;
  tercera: number;
  resultado: number;
}

export interface CrematocritoBackend {
  id: number;
  ct1: number;
  ct2: number;
  ct3: number | null;
  cc1: number;
  cc2: number;
  cc3: number | null;
  kcal: number;
}

// ✅ Payload para PUT (actualizar)
export interface PutDistribucionPayload {
  idInfoDistribucion: number;
  fecha: string;
  volumenDistribuido: number;
  frascoPasteurizado: { id: number };
  tipo: string;
  nombreBeneficiario: string;
  identificacion: number;
  semanasGestacion: number;
  eps: string;
  responsable: string;
  exclusiva: number;
}

// ✅ Payload para POST (crear)
export interface PostDistribucionPayload {
  fecha: string;
  volumenDistribuido: number;
  frascoPasteurizado: { id: number };
  tipo: string;
  responsable: string;
  nombreBeneficiario: string;
  identificacion: number;
  semanasGestacion: number;
  eps: string;
  exclusiva: number;
}

// ✅ Respuesta genérica del backend
export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';
