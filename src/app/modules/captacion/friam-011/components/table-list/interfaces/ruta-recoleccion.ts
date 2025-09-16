export interface rutaRecoleccion {
  id_ruta?: number |null ;
  fecha_registro: Date | null | string
  jornada?: string
  nombre_conductor: string
  placa_vehiculo?: string
  kilometraje_inicial?: number | string | null
  kilometraje_final?: number | string | null
  hora_salida?: string | Date
  hora_llegada?: string| Date | null
  temperatura_llegada: number | string | null
  temperatura_salida: number | string | null
  total_visitas?: number | null
  volumen_total?: number | null
  id_empleado?: number | null
  nombreEmpleado: string
  cargo?: string
}
