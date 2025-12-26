export interface IngresoLechePasteurizadaData {
  id?: number | null;
  fecha_dispensacion: string | Date | null;
  n_frasco: string;
  id_frasco: number | null;
  n_donante: string;
  volumen: string;
  acidez_dornic: string;
  calorias: string;
  tipo_leche: string;
  lote: string;
  fecha_vencimiento: string | Date | null;
  fecha_hora_deshiele: string | Date | null;
  dosificaciones?: any;
  isNew?: boolean;
  _uid?: string;
}

export interface LoadingState {
  main: boolean;
  frascos: boolean;
  saving: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FiltrosBusqueda {
  n_frasco: string;
  n_donante: string;
  lote: string;
}

export interface FrascoOption {
  label: string;
  value: string;
  id_frasco: number;
  n_donante: string;
  volumen: string;
  acidez_dornic: string;
  calorias: string;
  lote: string;
  año: number;
}

export interface TipoLecheOption {
  label: string;
  value: string;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';
