export interface VisitaSeguimiento {
  id: number;
  fecha: string;
  madreDonante: {
    id: number;
    madrePotencial?: any;
  };
}

// Interface para la tabla de visitas (formato frontend)
export interface VisitaTabla {
  id_visita: number;
  no_visita: number;
  fecha_visita: string;
  id_seguimiento?: number;
  isNew?: boolean;
}
