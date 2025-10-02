import { MadreDonante } from "./madre-donante.interface";

export interface VisitaSeguimiento {
  id: number;
  fecha: string;
  madreDonante: MadreDonante;
}

export interface CrearVisitaRequest {
  idMadreDonante: number;
  fecha: string;
}

export interface ActualizarFechaRequest {
  idVisita: number;
  nuevaFecha: string;
}
