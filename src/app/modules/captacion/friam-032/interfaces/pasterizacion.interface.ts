export interface PasterizacionData {
  id?: number | null;
  no_frasco_pasterizacion: string;
  id_frasco_pasterizacion?: number | null;
  volumen_frasco_pasterizacion: string;
  observaciones_pasterizacion?: string;
  id_control_reenvase?: number;
  isNew?: boolean;
  _uid?: string;
}

export interface PasterizacionBackendRequest {
  volumen: number | null;
  controlReenvase: { id: number };
  observaciones: string | null;
  numeroFrasco?: number | null;
}

export interface PasterizacionBackendResponse {
  id: number;
  volumen: number | null;
  numeroFrasco: number | null;
  observaciones: string | null;
  controlReenvase: {
    id: number;
    fecha?: string;
    frascoCrudo?: number;
  };
}

export interface BackendApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}
