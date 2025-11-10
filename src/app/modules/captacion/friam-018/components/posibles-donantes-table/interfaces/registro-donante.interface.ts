import { N } from "node_modules/@angular/core/navigation_types.d-Lh6SmhKv";

export interface BodyMadreDonante {
  madreDonante: object;
  infoMadre: object;
  hijosMadre: HijosMadre[];
  gestacion: Gestacion;
  examenPrenatal: ExamenPrenatal;
  medicamento: Medicamento;
}

export interface Empleado {
  id: number | undefined;
}

export interface ExamenPrenatal {
  id: number | null;
  hemoglobina:  number | null | string;
  hematocrito: number | null | string;
  transfuciones: number | null;
  enfermedadesGestacion: string;
  fuma: number | null;
  alcohol: number | null;
}

export interface Gestacion {
  id: number | null;
  lugarControlPrenatal: string;
  asistioControlPrenatal: number | null;
  tipoIps: number;
  pesoGestacionInicial: string;
  pesoGestacionFinal: string;
  talla: string;
  partoTermino: number;
  preTermino: number;
  semanas: number;
  fechaParto: string | undefined | Date;
}

export interface HijosMadre {
  nombre: string;
  peso: string | null;
}

export interface Medicamento {
  id: number | null;
  medicamento: string;
  psicoactivos: string;
}

export interface ResponseMadresDonantes {
  id: number | null;
  educacion_presencial: number;
  fecha_llamada: Date;
  llamada: string;
  asesoria: number;
  donante_efectiva: number;
  fecha_visita: Date;
  observacion: string;
  fecha_registro: Date | string;
  infoMadre: InfoMadre;
  madreDonante: MadreDonante;
  laboratorio: Laboratorio[];
}

export interface InfoMadre {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  fechaNacimiento: Date;
  fechaParto: Date;
  telefono: string;
  celular: string;
  departamento: null;
  ciudad: null;
  barrio: string;
  direccion: string;
  profesion: null;
  eps: null;
}

export interface MadreDonante {
  id: number | null;
  donanteExclusivo: number | null;
  tipoDonante: string | null;
  recoleccionDomicilio: number | null;
  capacitado: string | null;
  recibioEducacion: string | null;
  donanteApta: number | null;
  firmaDonante: string | null;
  firmaProfesional: string | null;
  firmaAcompañante: string | null;
  fecha_diligenciamiento: Date | null;

  gestacion: Gestacion;
  hijosMadre: HijosMadre[];
  examenesPrenatal: ExamenesPrenatal;
  medicamento: Medicamento;
  empleado: Empleado;

}

export interface ExamenesPrenatal {
  id: number;
  hemoglobina: number;
  hematocrito: number;
  transfuciones: number;
  enfermedadesGestacion: string;
  fuma: number;
  alcohol: number;
}

export interface Laboratorio {
  id: number;
  resultado: number;
  fechaVencimiento: string | Date;
  documento: string;
  fechaRegistro: string | Date | null;
}


