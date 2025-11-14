import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import type {
  EnfriamientoBackendRequest,
  EnfriamientoBackendResponse
} from '../interfaces/enfriamiento.interface';

@Injectable({
  providedIn: 'root'
})
export class EnfriamientoService {

  // Mock data storage
  private enfriamientoMock: Map<number, EnfriamientoBackendResponse> = new Map();
  private nextId = 1;

  constructor() {
    // Inicializar algunos datos mock
    this.enfriamientoMock.set(1, {
      id: 1,
      temp_0: 62.5,
      temp_5: 55.0,
      temp_10: 45.2,
      temp_15: 35.8,
      temp_20: 25.0,
      controlTemperatura: { id: 1, fecha: '2025-11-10', lote: 'LT-001' }
    });
  }

  /**
   * Obtiene el enfriamiento por ID de control de temperatura
   * Retorna null si no hay datos
   */
  getEnfriamientoByControlTemperatura(idControlTemperatura: number): Observable<EnfriamientoBackendResponse | null> {
    console.log('Cargando enfriamiento para control temperatura:', idControlTemperatura);

    const enfriamiento = this.enfriamientoMock.get(idControlTemperatura);
    return of(enfriamiento || null).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.get<BackendApiResponse<EnfriamientoBackendResponse>>(
      `${environment.ApiBLH}/getEnfriamientoByControlTemperatura/${idControlTemperatura}`,
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
   * Crea un nuevo registro de enfriamiento
   */
  postEnfriamiento(datos: EnfriamientoBackendRequest): Observable<EnfriamientoBackendResponse> {
    console.log('Creando enfriamiento:', datos);

    const mockResponse: EnfriamientoBackendResponse = {
      id: this.nextId++,
      temp_0: datos.temp_0,
      temp_5: datos.temp_5,
      temp_10: datos.temp_10,
      temp_15: datos.temp_15,
      temp_20: datos.temp_20,
      controlTemperatura: datos.controlTemperatura
    };

    this.enfriamientoMock.set(datos.controlTemperatura.id, mockResponse);

    return of(mockResponse).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.post<BackendApiResponse<EnfriamientoBackendResponse>>(
      `${environment.ApiBLH}/postEnfriamiento`,
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
   * Actualiza un registro de enfriamiento existente
   */
  putEnfriamiento(id: number, datos: EnfriamientoBackendRequest): Observable<any> {
    console.log('Actualizando enfriamiento:', id, datos);

    const updated = {
      id,
      ...datos,
      controlTemperatura: datos.controlTemperatura
    };

    this.enfriamientoMock.set(datos.controlTemperatura.id, updated as EnfriamientoBackendResponse);

    return of({ success: true, data: updated }).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putEnfriamiento/${id}`,
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
