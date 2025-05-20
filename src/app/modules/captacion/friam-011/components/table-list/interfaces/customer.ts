export interface Customer {
  id?: number;
  fecha?: string | Date;
  ruta?: string;
  placaVehiculo?: string;
  conductor?: string;
  kmInicial?: number;
  kmFinal?: number;
  horaSalida?: string;
  horaLlegada?: string;
  responsableTecnico?: string;
  cargo?: string;
  totalVisitas?: number;
  volumenLecheRecolectada?: number;

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
