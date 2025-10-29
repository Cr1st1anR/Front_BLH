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
}
