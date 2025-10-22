export interface LecheExtraidaTable {
  id_extraccion: number | null;
  fecha_registro: string;
  apellidos_nombre: string;
  edad: number | string;
  identificacion: string;
  municipio: string;
  telefono: string;
  eps: string;
  procedencia: string;
  consejeria: number | null;
  fecha_registro_aux?: Date | null;
  fecha_nacimiento_aux?: Date | null;
  _uid?: string;
  isNew?: boolean;
}
