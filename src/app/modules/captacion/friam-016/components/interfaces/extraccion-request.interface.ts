export interface ExtraccionRequest {
  cantidad: number;
  hora: string;
  gaveta: number;
  fechaExtraccion: string;
  congelador: { id: number };
  lecheSalaExtraccion: { id: number };
  motivoConsulta?: string;
  observaciones?: string;
  procedencia?: string;
  madrePotencial?: number;
}
