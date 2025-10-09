export interface Pregunta {
  id: number;
  pregunta: string;
}

export interface RespuestaFormulario {
  idPregunta: number;
  respuesta: number | null; // 0 = NO, 1 = SÍ, null = N/A
}

// ✅ INTERFACES ESPECÍFICAS DE PREGUNTAS
export interface CondicionData {
  id_pregunta: number;
  pregunta: string;
  respuesta: number | null | undefined; // undefined = sin tocar, null = N/A, 0/1 = No/Sí
}

// Alias para compatibilidad con la API
export interface RespuestaAPI {
  idPregunta: number;
  respuesta: number | null;
}
