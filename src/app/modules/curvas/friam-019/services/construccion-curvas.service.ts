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

  buscarCurvasPorVolumen(volumen: number): Observable<ApiResponse<CurvaVolumenResponse[]>> {
    return this.http.get<ApiResponse<CurvaVolumenResponse[]>>(
      `${environment.ApiBLH}/curva/${volumen}`
    );
  }

  obtenerCurvaPorId(id: number): Observable<ApiResponse<CurvaDetalleResponse[]>> {
    return this.http.get<ApiResponse<CurvaDetalleResponse[]>>(
      `${environment.ApiBLH}/curva-id/${id}`
    );
  }

  crearCurva(payload: PayloadCurvaCompletaAPI): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.ApiBLH}/curva`,
      payload
    );
  }

  actualizarCurva(id: number, payload: PayloadCurvaCompletaAPI): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/curva/${id}`,
      payload
    );
  }

  obtenerEmpleados(): Observable<ApiResponse<EmpleadoResponse[]>> {
    return this.http.get<ApiResponse<EmpleadoResponse[]>>(
      `${environment.ApiBLH}/GetEmpleados`
    );
  }
}
