import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  ApiResponse,
  BackendApiResponse,
  PutEntradasSalidasRequest,
  EmpleadoBackend
} from '../interfaces/entradas-salidas-pasteurizada.interface';

@Injectable({
  providedIn: 'root'
})
export class EntradasSalidasPasteurizadaService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene las entradas y salidas de leche pasteurizada por lote
   */
  getEntradasSalidasPorLote(lote: number): Observable<ApiResponse<BackendApiResponse[]>> {
    return this.http.get<ApiResponse<BackendApiResponse[]>>(
      `${environment.ApiBLH}/getEntradasSalidaLechePasteurizada/${lote}`
    ).pipe(
      map(response => {
        if (response && response.data) {
          return response;
        }
        return {
          status: 200,
          statusmsg: 'OK',
          data: []
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          console.info(`No hay datos para el lote ${lote}`);
          return of({
            status: 204,
            statusmsg: 'No Content',
            data: []
          });
        }
        console.error('Error en getEntradasSalidasPorLote:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la lista de empleados
   */
  getEmpleados(): Observable<ApiResponse<EmpleadoBackend[]>> {
    return this.http.get<ApiResponse<EmpleadoBackend[]>>(`${environment.ApiBLH}/getEmpleados`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return response;
          }
          return {
            status: 200,
            statusmsg: 'OK',
            data: []
          };
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('No hay empleados registrados en el sistema');
            return of({
              status: 404,
              statusmsg: 'No hay empleados registrados',
              data: []
            });
          }
          console.error('Error en getEmpleados:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza una entrada/salida de leche pasteurizada
   */
  putEntradasSalidasPasteurizada(id: number, data: PutEntradasSalidasRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/putEntradaSalidaLechePasteurizada/${id}`,
      data
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en putEntradasSalidasPasteurizada:', error);
        return throwError(() => error);
      })
    );
  }
}
