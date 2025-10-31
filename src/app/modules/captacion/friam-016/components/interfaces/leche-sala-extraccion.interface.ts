import { MadrePotencial } from './madre-potencial.interface';
import { Extraccion } from './extraccion.interface';

export interface LecheSalaExtraccion {
  id: number;
  procedencia: string;
  consejeria: number;
  fechaRegistro: string;
  madrePotencial: MadrePotencial;
  extracciones: Extraccion[];
}
