export interface Pregunta {
  id: number;
  pregunta: string;
}

export interface RespuestaFormulario {
  idPregunta: number;
  respuesta: number | null; // 0 = NO, 1 = SÍ, null = N/A
}
