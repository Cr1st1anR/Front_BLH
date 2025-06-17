export interface VisitaDomiciliariaData {
  fecha_visita: Date | null | string;
  nombre: string;
  apellido: string;
  documento: number;
  edad: number;
  direccion: string;
  celular: number;
  municipio: string;
  encuesta_realizada: string;
}
