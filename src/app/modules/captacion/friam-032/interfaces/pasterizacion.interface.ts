export interface PasterizacionData {
  id?: number | null;
  no_frasco_pasterizacion: string;
  id_frasco_pasterizacion?: number | null;
  volumen_frasco_pasterizacion: string;
  observaciones_pasterizacion?: string;
  id_control_reenvase?: number;
  isNew?: boolean;
  _uid?: string;
}
