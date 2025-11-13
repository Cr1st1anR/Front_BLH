export interface CrematocritoData {
  id?: number | null;
  ct1: number | null;
  ct2: number | null;
  ct3: number | null;
  media_ct: number | null;
  cc1: number | null;
  cc2: number | null;
  cc3: number | null;
  media_cc: number | null;
  kcal_l: number | null;
  id_seleccion_clasificacion?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface CrematocritoBackendRequest {
  ct1: number;
  ct2: number;
  ct3: number;
  mediaCt: number;
  cc1: number;
  cc2: number;
  cc3: number;
  mediaCc: number;
  kcalL: number | null;
  seleccionClasificacion: { id: number };
}

export interface CrematocritoBackendResponse {
  id: number;
  ct1: number;
  ct2: number;
  ct3: number;
  mediaCt: number;
  cc1: number;
  cc2: number;
  cc3: number;
  mediaCc: number;
  kcalL: number | null;
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
