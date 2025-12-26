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
