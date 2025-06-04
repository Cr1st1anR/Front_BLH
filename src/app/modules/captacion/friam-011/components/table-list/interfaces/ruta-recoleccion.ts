export interface rutaRecoleccion {
  id_ruta?: number;
  fecha_registro: Date | null | string
  jornada?: string
  nombre_conductor: string
  placa_vehiculo?: string
  kilometraje_inicial?: number | string
  kilometraje_final?: number | string
  hora_salida: string | Date
  hora_llegada: string| Date
  temperatura_llegada: number | string
  temperatura_salida: number | string
  total_visitas?: number
  volumen_total?: number
  id_empleado?: number
  nombreEmpleado: string
  cargo?: string

  // Nuevas propiedades para las columnas adicionales
  noCaja?: number;
  tSalida?: number;
  hSalida?: string;
  tCasa1?: number;
  tCasa2?: number;
  tCasa3?: number;
  tCasa4?: number;
  tCasa5?: number;

  casaNo?: number;
  codigo?: number;
  nombre?: string;
  direccion?: string;
  telefono1?: number;
  telefono2?: number;
  observaciones?: string;

  // noFrasco?: number;
  // volumenEstimado?: number;
  // fechaExtraccion?: string | Date;
  // tipoFrasco?: string;
  // noTermo?: number;
  // congelador?: number;
  // gaveta?: number;
}
