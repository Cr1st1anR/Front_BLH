export interface HistoriaGestacionData {
  lugarControlPrenatal: string;
  tipoIPS: string;
  asistioControl: number | null;
  pesoInicial: string;
  pesoFinal: string;
  talla: string;
  tipoParto: string;
  semanasGestacion: number | null;
  fechaParto: Date | undefined;
}
