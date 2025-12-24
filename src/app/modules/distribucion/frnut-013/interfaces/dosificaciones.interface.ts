export interface DosificacionData {
  id?: number | null;
  nombre_recien_nacido: string;
  cama: string;
  volumen_dosificado: string;
  medico_nutricionista: string;
  quien_dosificado: string;
  id_empleado_dosificador?: number | null;
  id_ingreso_leche_pasteurizada?: number | null;
  isNew?: boolean;
  _uid?: string;
}

export interface LoadingStateDosificaciones {
  main: boolean;
  empleados: boolean;
  saving: boolean;
}

export interface TableColumnDosificaciones {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface EmpleadoOption {
  label: string;
  value: string;
  id_empleado: number;
  cargo?: string;
}

export type TipoMensajeDosificaciones = 'success' | 'error' | 'warn' | 'info';
