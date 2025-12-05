export interface AcidezDornicData {
  id?: number | null;
  a1: number | null;
  a2: number | null;
  a3: number | null;
  media: number | null;
  factor: number;
  resultado: number | null;
  id_seleccion_clasificacion?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface AcidezDornicBackendRequest {
  primera: number;
  segunda: number;
  tercera: number;
  resultado: number;
  seleccionClasificacion: { id: number };
}

export interface AcidezDornicBackendResponse {
  id: number;
  primera: number;
  segunda: number;
  tercera: number;
  resultado: number;
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
