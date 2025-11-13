import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  AcidezDornicData,
  AcidezDornicBackendRequest,
  AcidezDornicBackendResponse,
  BackendApiResponse
} from '../interfaces/acidez-dornic.interface';

@Injectable({
  providedIn: 'root'
})
export class AcidezDornicService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene la acidez dornic por ID de selección-clasificación
   * Retorna null si no hay datos (HTTP 204)
   */
  getAcidezDornicBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<AcidezDornicBackendResponse | null> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Cargando acidez dornic para:', idSeleccionClasificacion);

    // Simular que no hay datos (retornar null)
    return of(null).pipe(delay(500));

    /*
    return this.http.get<BackendApiResponse<AcidezDornicBackendResponse>>(
      `${environment.ApiBLH}/getAcidezDornicBySeleccionClasificacion/${idSeleccionClasificacion}`,
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
   * Crea una nueva acidez dornic
   */
  postAcidezDornic(datos: AcidezDornicBackendRequest): Observable<AcidezDornicBackendResponse> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Creando acidez dornic:', datos);

    const mockResponse: AcidezDornicBackendResponse = {
      id: Math.floor(Math.random() * 1000),
      a1: datos.a1,
      a2: datos.a2,
      a3: datos.a3,
      media: datos.media,
      factor: datos.factor,
      resultado: datos.resultado,
      seleccionClasificacion: datos.seleccionClasificacion
    };

    return of(mockResponse).pipe(delay(500));

    /*
    return this.http.post<BackendApiResponse<AcidezDornicBackendResponse>>(
      `${environment.ApiBLH}/postAcidezDornic`,
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
   * Actualiza una acidez dornic existente
   */
  putAcidezDornic(id: number, datos: AcidezDornicBackendRequest): Observable<any> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Actualizando acidez dornic:', id, datos);

    return of({ success: true, data: { id, ...datos } }).pipe(delay(500));

    /*
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putAcidezDornic/${id}`,
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
