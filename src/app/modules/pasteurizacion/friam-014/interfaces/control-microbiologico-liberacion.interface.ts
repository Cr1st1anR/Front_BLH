export interface ControlMicrobiologicoLiberacionData {
  id?: number | null;
  numero_frasco_pasteurizado: string;
  id_frasco_pasteurizado?: number | null;
  coliformes_totales?: 0 | 1 | null; // 0=Ausencia, 1=Presencia
  conformidad?: 0 | 1 | null; // 0=No Conformidad, 1=Conformidad
  prueba_confirmatoria?: 0 | 1 | null; // 0=Vacío, 1=PC
  liberacion_producto?: 0 | 1 | null; // 0=No, 1=Sí
  fecha_pasteurizacion?: Date | string | null;
  ciclo?: number | string;
  lote?: number | string;
  isNew?: boolean;
  _uid?: string;
}

export interface DatosFormulario {
  fechaSiembra?: Date | null;
  horaSiembra?: string;
  horaSiembraAux?: Date | null;
  fechaPrimeraLectura?: Date | null;
  horaPrimeraLectura?: string;
  horaPrimeraLecturaAux?: Date | null;
  responsableSiembra?: string;
  responsableLectura?: string;
  responsableProcesamiento?: string;
  coordinadorMedico?: string;
}

export interface PayloadControlMicrobiologico {
  datosFormulario: {
    fechaSiembra: Date;
    horaSiembra: string;
    fechaPrimeraLectura: Date;
    horaPrimeraLectura: string;
    responsableSiembra: string;
    responsableLectura: string;
    responsableProcesamiento: string;
    coordinadorMedico: string;
  };
  registrosControl: Array<{
    numero_frasco_pasteurizado: string;
    id_frasco_pasteurizado: number;
    coliformes_totales: 0 | 1; // 0=Ausencia, 1=Presencia
    conformidad: 0 | 1; // 0=No Conformidad, 1=Conformidad
    prueba_confirmatoria: 0 | 1 | null; // 0=Vacío, 1=PC
    liberacion_producto: 0 | 1; // 0=No, 1=Sí
    fecha_pasteurizacion: Date | string;
    ciclo: number;
    lote: number;
  }>;
}

export interface EmpleadoOption {
  id: number;
  nombre: string;
  cargo: string;
}

export interface LoadingState {
  main: boolean;
  search: boolean;
  empleados: boolean;
  saving: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface BusquedaCicloLote {
  ciclo: string;
  lote: string;
}

export interface FrascoPasteurizadoData {
  id: number;
  numeroFrasco: number;
  volumen?: number;
  observaciones?: string;
  fechaPasteurizacion: string;
  ciclo: number;
  lote: number;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';

export interface BackendResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
