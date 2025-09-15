export interface ControlLecheCrudaData {
  id?: number;
  nCongelador?: string; // Nueva propiedad
  ubicacion?: string;   // Nueva propiedad
  gaveta: string;
  diasPosparto: string;
  donante: string;
  numFrasco: string;
  edadGestacional: string;
  volumen: string;
  fechaExtraccion: string;
  fechaVencimiento: string;
  fechaParto: string;
  procedencia: string;
  fechaEntrada: string;
  responsableEntrada: string;
  fechaSalida: string;
  responsableSalida: string;
}
