import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  ApiResponse,
  DistribucionResumenBackend,
  DistribucionCompletaBackend,
  PutDistribucionPayload,
  PostDistribucionPayload,
  FrascoOption
} from '../interfaces/distribucion-leche-procesada.interface';

@Injectable({
  providedIn: 'root'
})
export class DistribucionLecheProcesadaService {

  constructor(private readonly http: HttpClient) { }

  /**
   * GET: Obtener distribuciones por mes y año
   * Endpoint: /distribucion/:mes/:anio
   */
  getDistribucionesPorMes(mes: number, anio: number): Observable<DistribucionResumenBackend[]> {
    return this.http.get<ApiResponse<DistribucionResumenBackend[]>>(
      `${environment.ApiBLH}/distribucion/${mes}/${anio}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * GET: Obtener distribución completa por ID
   * Endpoint: /distribucion/:id
   */
  getDistribucionById(id: number): Observable<DistribucionCompletaBackend> {
    return this.http.get<ApiResponse<DistribucionCompletaBackend>>(
      `${environment.ApiBLH}/distribucion/${id}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * PUT: Actualizar distribución existente
   * Endpoint: /distribucion/:id
   */
  putDistribucion(id: number, payload: PutDistribucionPayload): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/distribucion/${id}`,
      payload
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * POST: Crear nueva distribución
   * Endpoint: /distribucion
   */
  postDistribucion(payload: PostDistribucionPayload): Observable<DistribucionCompletaBackend> {
    return this.http.post<ApiResponse<DistribucionCompletaBackend>>(
      `${environment.ApiBLH}/distribucion`,
      payload
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * ✅ ACTUALIZADO: GET: Obtener todos los frascos pasteurizados disponibles con datos completos
   * Endpoint: /getAllFrascosPasteurizados
   */
  getAllFrascosPasteurizados(): Observable<FrascoOption[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getAllFrascosPasteurizados`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        // Si no hay datos (204 No Content)
        if (response.status === 204 || !response.body?.data) {
          return [];
        }

        // Mapear los frascos del backend al formato del frontend
        return response.body.data
          .filter(frasco => frasco.activo) // Solo frascos activos
          .map(frasco => ({
            label: `LHP 25 ${frasco.numeroFrasco}`,
            value: `LHP 25 ${frasco.numeroFrasco}`,
            id_frasco: frasco.id,
            numeroFrasco: frasco.numeroFrasco,
            año: new Date(frasco.controlReenvase.fecha).getFullYear(),
            // ✅ NUEVOS CAMPOS: Calorías, Acidez Dornic y Gaveta
            calorias: frasco.controlReenvase?.seleccionClasificacion?.crematocrito?.kcal || 0,
            acidezDornic: frasco.controlReenvase?.seleccionClasificacion?.acidezDornic?.resultado || 0,
            gaveta: frasco.entradasSalidasPasteurizada?.gaveta || 0
          }))
          .sort((a, b) => a.numeroFrasco - b.numeroFrasco); // Ordenar por número de frasco
      }),
      catchError((error: HttpErrorResponse) => {
        // Si es 204, devolver array vacío
        if (error.status === 204) {
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.statusmsg ||
                     error.error?.message ||
                     `Error ${error.status}: ${error.message}`;
    }

    console.error('Error en el servicio:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
