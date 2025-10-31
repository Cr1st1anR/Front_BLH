export interface InfoMadre {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fechaNacimiento: string;
  fechaParto?: string | null;
  telefono?: string | null;
  celular?: string | null;
  departamento?: string | null;
  ciudad: string;
  barrio?: string | null;
  direccion?: string | null;
  profesion?: string | null;
  eps: string;
}
