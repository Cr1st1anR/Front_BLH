export interface DosificacionData {
  id?: number | null;
  nombre_recien_nacido: string;
  cama: string;
  volumen_dosificado: string;
  medico_nutricionista: string;
  quien_dosificado: string;
  id_ingreso_leche_pasteurizada?: number | null;
  isNew?: boolean;
  _uid?: string;
}

export interface DosificacionBackendRequest {
  nombre: string;
  cama: number;
  volumenDosificado: number;
  medico: string;
  dosificador: string;
  ingresoLechePasteurizada: number;
}

export interface DosificacionBackendResponse {
  id: number;
  nombre: string;
  cama: number;
  volumenDosificado: number;
  medico: string;
  dosificador: string;
}

export interface ApiResponseDosificaciones {
  status: number;
  statusmsg: string;
  data: DosificacionBackendResponse[];
}

export interface LoadingStateDosificaciones {
  main: boolean;
  saving: boolean;
}

export interface TableColumnDosificaciones {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export type TipoMensajeDosificaciones = 'success' | 'error' | 'warn' | 'info';
