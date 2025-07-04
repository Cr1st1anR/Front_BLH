export interface FrascosLeche {
    id_frascos_recolectados: number | null;
    volumen:                 number | null;
    fecha_de_extraccion:     Date | null;
    termo:                   number | null;
    gaveta:                  number | null;
    id_congelador:           number | null | Congeladores;
    descripcion:             string | null;
}

export interface Congeladores {
    id:          number;
    descripcion: string;
}

