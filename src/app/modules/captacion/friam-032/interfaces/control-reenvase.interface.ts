export interface ControlReenvaseData {
  id?: number | null;
  fecha: string | Date | null;
  responsable: string;
  no_donante?: string;
  no_frasco_anterior?: string;
  volumen_frasco_anterior?: string;
  isNew?: boolean;
  _uid?: string;
}

export interface ResponsableOption {
  label: string;
  value: string;
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
}
