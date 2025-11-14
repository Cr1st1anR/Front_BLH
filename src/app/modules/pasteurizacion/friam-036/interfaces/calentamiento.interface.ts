export interface CalentamientoData {
  id?: number | null;
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  temp_25?: number | null;
  temp_30?: number | null;
  temp_35?: number | null;
  temp_40?: number | null;
  temp_45?: number | null;
  temp_50?: number | null;
  temp_55?: number | null;
  id_control_temperatura?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface CalentamientoBackendRequest {
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  temp_25?: number | null;
  temp_30?: number | null;
  temp_35?: number | null;
  temp_40?: number | null;
  temp_45?: number | null;
  temp_50?: number | null;
  temp_55?: number | null;
  controlTemperatura: { id: number };
}

export interface CalentamientoBackendResponse {
  id: number;
  temp_0?: number | null;
  temp_5?: number | null;
  temp_10?: number | null;
  temp_15?: number | null;
  temp_20?: number | null;
  temp_25?: number | null;
  temp_30?: number | null;
  temp_35?: number | null;
  temp_40?: number | null;
  temp_45?: number | null;
  temp_50?: number | null;
  temp_55?: number | null;
  controlTemperatura: {
    id: number;
    fecha?: string;
    lote?: string;
  };
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
