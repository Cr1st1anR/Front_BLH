export interface FrascosLeche {
    id_frascos_recolectados: number;
    volumen:                 number;
    fecha_de_extraccion:     Date | null;
    termo:                   number;
    gaveta:                  number;
    id_congelador:           number;
    descripcion:             string;
}
