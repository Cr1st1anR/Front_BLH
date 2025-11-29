import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  AnalisisSensorialData,
  AnalisisSensorialBackendRequest,
  AnalisisSensorialBackendResponse,
  BackendApiResponse
} from '../interfaces/analisis-sensorial.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalisisSensorialService {

  constructor(private readonly http: HttpClient) { }

  getAnalisisSensorialBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<AnalisisSensorialBackendResponse | null> {
    return this.http.get<BackendApiResponse<AnalisisSensorialBackendResponse>>(
      `${environment.ApiBLH}/getAnalisisSensorial/${idSeleccionClasificacion}`
    ).pipe(
      map(response => {
        if (response?.data) {
          return response.data;
        }
        return null;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error en getAnalisisSensorialBySeleccionClasificacion:', error);
        return throwError(() => error);
      })
    );
  }

  postAnalisisSensorial(datos: AnalisisSensorialBackendRequest): Observable<AnalisisSensorialBackendResponse> {
    return this.http.post<BackendApiResponse<AnalisisSensorialBackendResponse>>(
      `${environment.ApiBLH}/postAnalisisSensorial`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en postAnalisisSensorial:', error);
        return throwError(() => error);
      })
    );
  }

  putAnalisisSensorial(id: number, datos: AnalisisSensorialBackendRequest): Observable<any> {
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putAnalisisSensorial/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en putAnalisisSensorial:', error);
        return throwError(() => error);
      })
    );
  }
}
