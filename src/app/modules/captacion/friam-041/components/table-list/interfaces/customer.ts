// export interface Country {
//   name?: string;
//   code?: string;
// }

// export interface Representative {
//   name?: string;
//   image?: string;
// }

export interface Customer {
  remite?: string;
  nombres?: string;
  apellidos?: string;
  fecha_parto?: string | Date;
  no_doc?: string;
  edad?: string;
  telefono?: string;
  barrio?: string;
  direccion?: string;
  educacion_presencial?: string;
  fecha_llamada?: string | Date;
  llamada_entrante?: boolean;
  llamada_saliente?: boolean;
  responsable?: string;
  recibe_asesoria_si?: boolean;
  recibe_asesoria_no?: boolean;
  posible_donante_si?: boolean;
  posible_donante_no?: boolean;
  fecha_visita?: string | Date;
  observaciones?: string;

  // interfaz origi primeNG
  // name?: string;
  // country?: Country;
  // company?: string;
  // date?: string | Date;
  // status?: string;
  // activity?: number;
  // representative?: Representative;
  // verified?: boolean;
  // balance?: number;
}

