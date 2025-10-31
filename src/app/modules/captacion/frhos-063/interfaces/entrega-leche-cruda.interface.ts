export interface EntregaLecheCrudaData {
  id?: number | null;
  fecha: string | Date | null;
  nombre_madre: string;
  volumen_leche_materna_am: string;
  volumen_leche_materna_pm: string;
  perdidas: number;
  responsable: string;
  isNew?: boolean;
  _uid?: string;
  madrePotencial?: MadrePotencial;
  empleado?: Empleado;
}

export interface ResponsableOption {
  label: string;
  value: string;
  id: number;
}

export interface MadreOption {
  label: string;
  value: string;
  documento: string;
  id: number;
}

export interface MadrePotencial {
  id: number;
  educacion_presencial?: number;
  fecha_llamada?: string;
  llamada?: string;
  asesoria?: number;
  donante_efectiva?: number;
  fecha_visita?: string;
  observacion?: string;
  fecha_registro?: string;
  madreDonante?: any;
  infoMadre: InfoMadre;
}

export interface InfoMadre {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fechaNacimiento: string;
  fechaParto?: string;
  telefono?: string;
  celular?: string;
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  direccion?: string;
  profesion?: string;
  eps?: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LecheDistribucionRequest {
  fecha: string;
  volumenManana?: number | null;
  volumenTarde?: number | null;
  perdidas?: number | null;
  madrePotencial: { id: number };
  empleado: { id: number };
}

export interface LecheDistribucionResponse {
  id: number;
  fecha: string;
  volumenManana?: number;
  volumenTarde?: number;
  perdidas?: number;
  madrePotencial: MadrePotencial;
  empleado?: Empleado;
}

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export type ApiResponseOrDirect<T> = ApiResponse<T> | T;
