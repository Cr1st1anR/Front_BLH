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
  tipo?: 'extraccion' | 'recolectado';
  fechaExtraccion?: string;
  termo?: number;
  gaveta?: number;
  procedencia?: string;
  fechaVencimiento?: string;
  fechaEntrada?: string;
  fechaSalida?: string;
}
