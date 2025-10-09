export interface RespuestasVisita {
  id: number;
  observaciones: string;
  recomendaciones: string;
  donante_efectiva: number;
  firmaUsuario: string;
  firmaEvaluador: string;
  evaluacionLactancia: EvaluacionLactancia;
  madrePotencial: MadrePotencial;
  respuestas: Respuesta[]
}

export interface Respuesta {
  id: number;
  respuesta: number;
  pregunta: Pregunta;
}

export interface Pregunta {
  id: number;
  descripcion: string;
  clasificacion: Clasificacion;
}

export interface Clasificacion {
  id: number;
  descripcion: string;
}


export interface EvaluacionLactancia {
  id?: number;
  madre: string;
  bebe: string;
  pechos: string;
  posicionBebe: string;
  agarrePecho: string;
  succion: string;
  deglucion: string;
}

export interface MadrePotencial {
  id: number;
}

export interface BodyVisita {
  observaciones: string;
  recomendaciones: string;
  donante_efectiva: number;
  firmaUsuario: string;
  firmaEvaluador: string;
  madrePotencial: MadrePotencial;
  evaluacionLactancia: EvaluacionLactancia;
}

export interface MadrePotencialCompleta {
  id: number;
  educacion_presencial: number;
  fecha_llamada: Date;
  llamada: string;
  asesoria: number;
  donante_efectiva: number;
  fecha_visita: Date;
  observacion: string;
  fecha_registro: Date;
}

export interface BodyRespuestasVisita {
  respuesta: number;
  pregunta: number;
  visitaMadre: number;
}

export interface PreguntasResponse {
  id: number;
  descripcion: string;
  clasificacion: number;
  respuesta?: number | null;
}

export interface CategoriasResponse {
  id: number;
  descripcion: string;
}
