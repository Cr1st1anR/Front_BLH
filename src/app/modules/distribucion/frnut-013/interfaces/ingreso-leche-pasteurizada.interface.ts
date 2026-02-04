export interface IngresoLechePasteurizadaData {
  id?: number | null;
  fecha_dispensacion: string | Date | null;
  n_frasco: string;
  id_frasco: number | null;
  id_madre_donante: number | null;
  n_donante: string;
  volumen: string;
  acidez_dornic: string;
  calorias: string;
  tipo_leche: string;
  lote: string;
  fecha_vencimiento: string | Date | null;
  fecha_hora_deshiele: string | Date | null;
  dosificaciones?: any;
  isNew?: boolean;
  _uid?: string;
}

export interface IngresoLechePasteurizadaBackendRequest {
  fechaDispensacion: string;
  tipo: string;
  frascoPasteurizado: { id: number };
  madreDonante: { id: number };
}

export interface IngresoLechePasteurizadaBackendResponse {
  id: number;
  fechaDispensacion: string;
  tipo: string;
  frascoPasteurizado: FrascoPasteurizadoBackend;
  madreDonante: MadreDonanteBackend;
}

export interface FrascoPasteurizadoBackend {
  id: number;
  volumen: number;
  numeroFrasco: number;
  observaciones: string | null;
  activo: boolean;
  entradasSalidasPasteurizada?: {
    id: number;
    gaveta: number;
    fechaSalida: string;
  };
  controlReenvase: {
    id: number;
    fecha: string;
    seleccionClasificacion: {
      id: number;
      fecha: string;
      acidezDornic: {
        id: number;
        primera: number;
        segunda: number;
        tercera: number;
        resultado: number;
      };
      crematocrito: {
        id: number;
        ct1: number;
        ct2: number;
        ct3: number | null;
        cc1: number;
        cc2: number;
        cc3: number | null;
        kcal: number;
      };
    };
    lote: {
      id: number;
      numeroLote: number;
    };
    madreDonante?: MadreDonanteBackend;
  };
}

export interface MadreDonanteBackend {
  id: number;
  donanteExclusivo: number;
  tipoDonante: string;
  recoleccionDomicilio: number;
  capacitado: string;
  recibioEducacion: string;
  donanteApta: number;
  firmaDonante: string;
  firmaProfesional: string;
  firmaAcompañante: string;
  activo: number;
  fecha_diligenciamiento: string;
}

export interface ApiResponseIngresoLeche {
  status: number;
  statusmsg: string;
  data: IngresoLechePasteurizadaBackendResponse[];
}

export interface ApiResponseFrascos {
  status: number;
  statusmsg: string;
  data: FrascoPasteurizadoBackend[];
}

export interface LoadingState {
  main: boolean;
  frascos: boolean;
  saving: boolean;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}

export interface FiltroFecha {
  year: number;
  month: number;
}

export interface FiltrosBusqueda {
  n_frasco: string;
  n_donante: string;
  lote: string;
}

export interface FrascoOption {
  label: string;
  value: string;
  id_frasco: number;
  id_madre_donante: number;
  n_donante: string;
  volumen: string;
  acidez_dornic: string;
  calorias: string;
  lote: string;
  año: number;
  fecha_dispensacion: string;
}

export interface TipoLecheOption {
  label: string;
  value: string;
}

export type TipoMensaje = 'success' | 'error' | 'warn' | 'info';
