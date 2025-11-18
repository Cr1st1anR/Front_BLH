import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
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

  /**
   * Obtiene el análisis sensorial por ID de selección-clasificación
   * Retorna un arreglo vacío si no hay datos (HTTP 204)
   */
  getAnalisisSensorialBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<AnalisisSensorialBackendResponse | null> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Cargando análisis sensorial para:', idSeleccionClasificacion);

    // Simular que no hay datos (retornar null)
    return of(null).pipe(delay(500));

    /*
    return this.http.get<BackendApiResponse<AnalisisSensorialBackendResponse>>(
      `${environment.ApiBLH}/getAnalisisSensorialBySeleccionClasificacion/${idSeleccionClasificacion}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204 || !response.body?.data) {
          return null;
        }
        return response.body.data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
    */
  }

  /**
   * Crea un nuevo análisis sensorial
   */
  postAnalisisSensorial(datos: AnalisisSensorialBackendRequest): Observable<AnalisisSensorialBackendResponse> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Creando análisis sensorial:', datos);

    const mockResponse: AnalisisSensorialBackendResponse = {
      id: Math.floor(Math.random() * 1000),
      embalaje: datos.embalaje,
      suciedad: datos.suciedad,
      color: datos.color,
      flavor: datos.flavor,
      seleccionClasificacion: datos.seleccionClasificacion
    };

    return of(mockResponse).pipe(delay(500));

    /*
    return this.http.post<BackendApiResponse<AnalisisSensorialBackendResponse>>(
      `${environment.ApiBLH}/postAnalisisSensorial`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
    */
  }

  /**
   * Actualiza un análisis sensorial existente
   */
  putAnalisisSensorial(id: number, datos: AnalisisSensorialBackendRequest): Observable<any> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Actualizando análisis sensorial:', id, datos);

    return of({ success: true, data: { id, ...datos } }).pipe(delay(500));

    /*
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putAnalisisSensorial/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
    */
  }
}
