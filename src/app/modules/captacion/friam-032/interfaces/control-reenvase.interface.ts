export interface ControlReenvase {
}
export interface ControlReenvaseData {
  id?: number | null;
  fecha: string | Date | null;
  nombre_madre: string;
  volumen_inicial: string;
  volumen_final: string;
  perdidas: number;
  responsable: string;
  observaciones?: string;
  isNew?: boolean;
  _uid?: string;
}

export interface ResponsableOption {
  label: string;
  value: string;
}

export interface MadreOption {
  label: string;
  value: string;
  documento?: string;
}
