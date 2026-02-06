export interface DatosCurva {
  id?: number | null;
  numero_frascos: string;
  tipo_frasco: string;
  volumen: string;
  termometro_tipo: string;
  marca: string;
  certificado_calibracion: string;
  nivel_agua_pasteurizador: string;
  temperatura_equipo: string;
  nivel_agua_enfriador: string;
  temperatura_agua: string;
  fecha: string | Date | null;
  responsable: string;
  id_responsable?: number | null;
  responsable2?: string;
  id_responsable2?: number | null;
}

export interface PasteurizadorData {
  id?: number | null;
  tiempo: string;
  t_frasco_testigo_1: string;
  t_agua_1: string;
  tiempo_2: string;
  t_frasco_testigo_2: string;
  t_agua_2: string;
  tiempo_3: string;
  t_frasco_testigo_3: string;
  t_agua_3: string;
}

export interface ResumenPasteurizador {
  promedio_precalentamiento: string;
  minutos: string;
}

export interface EnfriadorData {
  id?: number | null;
  tiempo: string;
  t_frasco_testigo_1: string;
  t_agua_1: string;
  tiempo_2: string;
  t_frasco_testigo_2: string;
  t_agua_2: string;
  tiempo_3: string;
  t_frasco_testigo_3: string;
  t_agua_3: string;
}

export interface ResumenEnfriador {
  promedio_precalentamiento: string;
  minutos: string;
}

export interface OpcionVolumenCurva {
  label: string;
  value: string;
  fecha: Date;
  id_registro?: number;
  volumen: string;
}

export interface LoadingState {
  main: boolean;
  responsables: boolean;
  volumenes: boolean;
  saving: boolean;
}

export interface ResponsableOption {
  label: string;
  value: string;
  id: number;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
  readOnly?: boolean;
}

export interface PayloadCurvaCompleta {
  datosCurva: DatosCurva;
  registrosPasteurizador: PasteurizadorData[];
  resumenPasteurizador: ResumenPasteurizador;
  registrosEnfriador: EnfriadorData[];
  resumenEnfriador: ResumenEnfriador;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export interface CurvaVolumenResponse {
  id: number;
  volumen: number;
  fecha: string;
}

export interface MuestraAPI {
  id?: number;
  tiempo: number;
  frascoTestigo: number;
  agua: number;
  muestra: number;
}

export interface EmpleadoResponse {
  id: number;
  nombre: string;
  cargo: string;
  telefono: number;
  correo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CurvaDetalleResponse {
  id: number;
  numeroFrascos: number;
  tipoFrasco: string;
  tipoTermometro: string;
  marca: string;
  certificado: string;
  aguaPasteurizador: number;
  temperaturaEquipo: number;
  volumen: number;
  aguaEnfriador: number;
  temperaturaAgua: number;
  fecha: string;
  promedioPasteurizador: number;
  minutosPasteurizador: number;
  promedioEnfriador: number;
  minutosEnfriador: number;
  pasteurizadores: MuestraAPI[];
  enfriadores: MuestraAPI[];
  responsableOne: EmpleadoResponse;
  responsableTwo: EmpleadoResponse | null;
}

export interface PayloadCurvaCompletaAPI {
  id?: number;
  numeroFrasco: number;
  tipoFrasco: string;
  tipoTermometro: string;
  marca: string;
  certificado: string;
  aguaPasteurizador: number;
  temperaturaEquipo: number;
  volumen: number;
  aguaEnfriador: number;
  temperaturaAgua: number;
  fecha: string;
  promedioPasteurizador: number;
  minutosPasteurizador: number;
  promedioEnfriador: number;
  minutosEnfriador: number;
  responsableOne: number;
  responsableTwo: number;
  pasteurizadores: MuestraAPI[];
  enfriadores: MuestraAPI[];
}
