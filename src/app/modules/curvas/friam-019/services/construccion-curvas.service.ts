import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import type {
  ApiResponse,
  CurvaVolumenResponse,
  CurvaDetalleResponse,
  PayloadCurvaCompletaAPI,
  EmpleadoResponse
} from '../interfaces/construccion-curvas.interface';

@Injectable({
  providedIn: 'root'
})
export class ConstruccionCurvasService {
  private readonly http = inject(HttpClient);

  /**
   * GET: Buscar curvas por volumen
   * endpoint: /api/curva/:volumen
   */
  buscarCurvasPorVolumen(volumen: number): Observable<ApiResponse<CurvaVolumenResponse[]>> {
    return this.http.get<ApiResponse<CurvaVolumenResponse[]>>(
      `${environment.ApiBLH}/curva/${volumen}`
    );
  }

  /**
   * GET: Obtener detalle de curva por ID
   * endpoint: /api/curva-id/:id
   */
  obtenerCurvaPorId(id: number): Observable<ApiResponse<CurvaDetalleResponse[]>> {
    return this.http.get<ApiResponse<CurvaDetalleResponse[]>>(
      `${environment.ApiBLH}/curva-id/${id}`
    );
  }

  /**
   * POST: Crear nueva curva
   * endpoint: /api/curva
   */
  crearCurva(payload: PayloadCurvaCompletaAPI): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.ApiBLH}/curva`,
      payload
    );
  }

  /**
   * PUT: Actualizar curva existente
   * endpoint: /api/curva/:id
   */
  actualizarCurva(id: number, payload: PayloadCurvaCompletaAPI): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/curva/${id}`,
      payload
    );
  }

  /**
   * GET: Obtener lista de empleados
   * endpoint: /api/GetEmpleados
   */
  obtenerEmpleados(): Observable<ApiResponse<EmpleadoResponse[]>> {
    return this.http.get<ApiResponse<EmpleadoResponse[]>>(
      `${environment.ApiBLH}/GetEmpleados`
    );
  }
}
