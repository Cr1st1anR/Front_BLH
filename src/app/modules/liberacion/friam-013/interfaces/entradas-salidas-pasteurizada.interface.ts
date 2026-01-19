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

// ============= INTERFACES BACKEND =============

export interface BackendApiResponse {
  id: number;
  gaveta: number;
  fechaSalida: string | null;
  frascoPasteurizado: FrascoPasteurizadoBackend;
  responsableEntrada: EmpleadoBackend;
  responsableSalida: EmpleadoBackend | null;
}

export interface FrascoPasteurizadoBackend {
  id: number;
  volumen: number;
  numeroFrasco: number;
  observaciones: string | null;
  activo: boolean;
  controlReenvase: ControlReenvaseBackend;
}

export interface ControlReenvaseBackend {
  id: number;
  fecha: string;
  lote: LoteBackend;
  frascoCrudo: FrascoCrudoBackend;
  seleccionClasificacion: SeleccionClasificacionBackend;
}

export interface LoteBackend {
  id: number;
  numeroLote: number;
}

export interface FrascoCrudoBackend {
  id: number;
  fechaVencimiento: string;
  procedencia: string;
  fechaEntrada: string;
  fechaSalida: string;
  madreDonante: MadreDonanteBackend;
  extraccion: ExtraccionBackend | null;
  frascoRecolectado: FrascoRecolectadoBackend | null;
}

export interface MadreDonanteBackend {
  id: number;
  donanteExclusivo: number;
  tipoDonante: string;
  recoleccionDomicilio: number;
  capacitado: string;
  recibioEducacion: string;
  donanteApta: number;
  activo: number;
  fecha_diligenciamiento: string;
  gestacion: GestacionBackend;
}

export interface GestacionBackend {
  id: number;
  lugarControlPrenatal: string;
  asistioControlPrenatal: number;
  tipoIps: number;
  pesoGestacionInicial: number;
  pesoGestacionFinal: number;
  talla: number;
  partoTermino: number;
  preTermino: number;
  semanas: number;
  fechaParto: string;
}

export interface ExtraccionBackend {
  id: number;
  fechaDeExtraccion: string;
  volumen: number;
  gaveta: number;
  termo: number;
  activo: number;
}

export interface FrascoRecolectadoBackend {
  id: number;
  volumen: number;
  fechaDeExtraccion: string;
  termo: number;
  gaveta: number;
  activo: number;
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

export interface EmpleadoBackend {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PutEntradasSalidasRequest {
  gaveta: number;
  fechaSalida: string;
  responsableSalida: number;
  responsableEntrada: number;
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
