export interface ExtraccionTable {
  id_registro_extraccion: number;
  fecha: string;
  fecha_display: string;
  fecha_aux?: Date | null;
  extraccion_1: {
    am: string | null;
    ml: number | null;
    am_aux?: Date | null;
  };
  extraccion_2: {
    pm: string | null;
    ml: number | null;
    pm_aux?: Date | null;
  };
  motivo_consulta: string;
  observaciones: string;
  isNew?: boolean;
}
