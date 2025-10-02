import { MadreDonante } from './madre-donante.interface';
import { Pregunta, RespuestaFormulario } from './pregunta.interface';

export interface DatosCompletos {
  idVisitaSeguimiento: number;
  observaciones?: string;
  recomendaciones?: string;
  firmaUsuario?: string;
  firmaEvaluador?: string;
  respuestas: RespuestaFormulario[];
}

export interface DetallesVisita {
  id: number;
  fecha: string;
  madreDonante: MadreDonante;
  datosVisitaSeguimiento?: DatosVisitaSeguimiento;
  respuestas?: RespuestaConPregunta[];
}

export interface DatosVisitaSeguimiento {
  id: number;
  observaciones?: string;
  recomendaciones?: string;
  firmaUsuario?: string;
  firmaEvaluador?: string;
}

export interface RespuestaConPregunta {
  id: number;
  respuesta: number | null;
  pregunta: Pregunta;
}
