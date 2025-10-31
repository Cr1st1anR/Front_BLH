import { InfoMadre } from './info-madre.interface';

export interface MadrePotencial {
  id: number;
  educacion_presencial?: number | null;
  fecha_llamada?: string | null;
  llamada?: string | null;
  asesoria?: number | null;
  donante_efectiva: number;
  fecha_visita?: string | null;
  observacion?: string | null;
  fecha_registro: string;
  infoMadre: InfoMadre;
}
