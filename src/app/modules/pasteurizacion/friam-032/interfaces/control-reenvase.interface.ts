export interface ControlReenvaseData {
  id?: number | null;
  fecha: string | Date | null;
  responsable: string;
  no_donante?: string;
  no_frasco_anterior?: string;
  id_frasco_anterior?: number | null;
  volumen_frasco_anterior?: string;
  isNew?: boolean;
  _uid?: string;
  id_empleado?: number;
  frasco_crudo?: number;
  madre_donante_info?: MadreDonante;
  empleado_info?: EmpleadoInfo;
  tipo_frasco?: TipoFrasco;
  id_extraccion?: number;
  id_frasco_recolectado?: number;
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
  donante: string;
  volumen?: string;
  id_frasco_principal?: number;
  id_frasco_data?: number;
  tipo?: TipoFrasco;
  fechaExtraccion?: string;
  termo?: number;
  gaveta?: number;
  procedencia?: string;
  fechaVencimiento?: string;
  fechaEntrada?: string;
  fechaSalida?: string;
}

export interface MadreDonante {
  id: number;
  tipoDonante: string;
  casaVisita?: CasaVisita[];
  madrePotencial?: MadrePotencial;
}

export interface EmpleadoInfo {
  id: number;
  nombre: string;
  cargo?: string;
  telefono?: number;
  correo?: string;
}

export interface CasaVisita {
  frascoRecolectado?: FrascoRecolectado[];
}

export interface MadrePotencial {
  lecheSalaExtraccion?: LecheSalaExtraccion;
}

export interface LecheSalaExtraccion {
  extracciones?: Extraccion[];
}

export interface FrascoRecolectado {
  id: number;
  volumen: string;
}

export interface Extraccion {
  id: number;
  cantidad: number;
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

export type TipoFrasco = 'extraccion' | 'recolectado';
export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export interface DatosBackendParaCreacion {
  fecha: string;
  frascoCrudo: number;
  madreDonante: { id: number };
  empleado: { id: number };
}

export interface DatosBackendParaActualizacion {
  id: number;
  fecha: string;
  volumen: number;
  frascoCrudo: number;
  madreDonante: {
    id: number;
    tipoDonante: string;
  };
  empleado: { id: number };
  extraccion: number | null;
  frascoRecolectado: number | null;
}
