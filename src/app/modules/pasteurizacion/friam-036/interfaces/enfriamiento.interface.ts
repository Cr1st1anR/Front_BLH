export interface EnfriamientoData {
  id?: number | null;
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  id_control_temperatura?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface EnfriamientoBackendRequest {
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  controlTemperatura: { id: number };
}

export interface EnfriamientoBackendResponse {
  id: number;
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  controlTemperatura: {
    id: number;
    fecha?: string;
    lote?: string;
  };
}

export interface EnfriamientoAPIResponse {
  id: number;
  minuto: string;
  valor: number;
}

export interface ControlTemperaturaCompleta {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_finalizacio: string;
  observaciones?: string;
  lote: { id: number; numeroLote: number };
  ciclo: { id: number; numeroCiclo: number };
  responsable: any;
  calentamientos: any[];
  enfriamientos: EnfriamientoAPIResponse[];
}

export interface BackendApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}

export interface TableColumn {
  header: string;
  field: string;
  width: string;
  tipo: string;
}
