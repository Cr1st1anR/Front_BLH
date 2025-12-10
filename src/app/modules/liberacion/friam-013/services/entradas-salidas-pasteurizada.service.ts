import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type { ApiResponse } from '../interfaces/entradas-salidas-pasteurizada.interface';

@Injectable({
  providedIn: 'root'
})
export class EntradasSalidasPasteurizadaService {

  constructor(private readonly http: HttpClient) { }

  getEntradasSalidasPorMesYAnio(mes: number, anio: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getEntradasSalidasPasteurizada`,
      {
        params: { mes: mes.toString(), anio: anio.toString() }
      }
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
          console.info(`No hay datos para ${mes}/${anio}`);
          return of({
            status: 204,
            statusmsg: 'No Content',
            data: []
          });
        }
        console.error('Error en getEntradasSalidasPorMesYAnio:', error);
        return throwError(() => error);
      })
    );
  }

  getEmpleados(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.ApiBLH}/GetEmpleados`)
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

  putEntradasSalidasPasteurizada(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putEntradasSalidasPasteurizada/${id}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en putEntradasSalidasPasteurizada:', error);
          return throwError(() => error);
        })
      );
  }
}
