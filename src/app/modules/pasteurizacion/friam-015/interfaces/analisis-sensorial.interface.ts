export interface AnalisisSensorialData {
  id?: number | null;
  embalaje: string;
  suciedad: string;
  color: string;
  flavor: string;
  id_seleccion_clasificacion?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface AnalisisSensorialBackendRequest {
  embalaje: string;
  suciedad: string;
  color: string;
  flavor: string;
  seleccionClasificacion: { id: number };
}

export interface AnalisisSensorialBackendResponse {
  id: number;
  embalaje: string;
  suciedad: string;
  color: string;
  flavor: string;
  seleccionClasificacion: {
    id: number;
    fecha?: string;
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
