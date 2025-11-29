import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  ResponsableOption,
  ApiResponse
} from '../interfaces/seleccion-clasificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class SeleccionClasificacionService {

  constructor(private readonly http: HttpClient) { }

  getSeleccionClasificacionPorMesYAnio(mes: number, anio: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getSeleccionClasificacion`,
      {
        params: { mes: mes.toString(), anio: anio.toString() }
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getSeleccionClasificacionPorMesYAnio:', error);
        return throwError(() => error);
      })
    );
  }

  getEmpleados(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.ApiBLH}/GetEmpleados`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getEmpleados:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza/Crea un registro de selección y clasificación
   * Funciona como POST (crear infoSeleccionClasificacion) o PUT (actualizar) dependiendo de si tiene infoSeleccionClasificacion.id
   */
  putSeleccionClasificacion(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putSeleccionClasificacion/${id}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en putSeleccionClasificacion:', error);
          return throwError(() => error);
        })
      );
  }
}
