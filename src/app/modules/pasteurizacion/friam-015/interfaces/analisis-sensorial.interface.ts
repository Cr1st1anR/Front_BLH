export interface AnalisisSensorialData {
  id?: number | null;
  embalaje: number | null;
  suciedad: number | null;
  color: number | null;
  flavor: number | null;
  id_seleccion_clasificacion?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface AnalisisSensorialBackendRequest {
  embalaje: number;
  suciedad: number;
  color: number;
  flavor: number;
  seleccionClasificacion: { id: number };
}

export interface AnalisisSensorialBackendResponse {
  id: number;
  embalaje: number;
  suciedad: number;
  color: number;   
  flavor: number;  
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
