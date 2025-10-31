export interface Extraccion {
  id: number;
  cantidad: number;
  hora: string;
  gaveta: number;
  fechaExtraccion: string;
  motivoConsulta?: string | null;
  observaciones?: string | null;
}
