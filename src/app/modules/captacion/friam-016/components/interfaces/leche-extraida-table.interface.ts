export interface LecheExtraidaTable {
  id_extraccion: number | null;
  fecha_registro: string;
  fecha_registro_aux?: Date | null;
  apellidos_nombre: string;
  edad: string | number;
  fecha_nacimiento_aux?: Date | null;
  fecha_nacimiento_original?: string; // ✅ NUEVO: Campo para mantener la fecha original de la API
  identificacion: string;
  municipio: string;
  telefono: string;
  eps: string;
  procedencia: string;
  consejeria: number | null;
  _uid?: string;
  isNew?: boolean;
}
