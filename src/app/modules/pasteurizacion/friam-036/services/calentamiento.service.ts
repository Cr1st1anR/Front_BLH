import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import type {
  CalentamientoBackendRequest,
  CalentamientoBackendResponse
} from '../interfaces/calentamiento.interface';

@Injectable({
  providedIn: 'root'
})
export class CalentamientoService {

  // Mock data storage
  private calentamientoMock: Map<number, CalentamientoBackendResponse> = new Map();
  private nextId = 1;

  constructor() {
    // Inicializar algunos datos mock
    this.calentamientoMock.set(1, {
      id: 1,
      temp_0: 64.0,
      temp_5: 65.2,
      temp_10: 66.5,
      temp_15: 67.8,
      temp_20: 68.5,
      temp_25: 69.0,
      temp_30: 69.5,
      temp_35: 70.0,
      temp_40: 70.2,
      temp_45: 70.5,
      temp_50: 70.8,
      temp_55: 71.0,
      controlTemperatura: { id: 1, fecha: '2025-11-10', lote: 'LT-001' }
    });
  }

  /**
   * Obtiene el calentamiento por ID de control de temperatura
   * Retorna null si no hay datos
   */
  getCalentamientoByControlTemperatura(idControlTemperatura: number): Observable<CalentamientoBackendResponse | null> {
    console.log('Cargando calentamiento para control temperatura:', idControlTemperatura);

    const calentamiento = this.calentamientoMock.get(idControlTemperatura);
    return of(calentamiento || null).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.get<BackendApiResponse<CalentamientoBackendResponse>>(
      `${environment.ApiBLH}/getCalentamientoByControlTemperatura/${idControlTemperatura}`,
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
   * Crea un nuevo registro de calentamiento
   */
  postCalentamiento(datos: CalentamientoBackendRequest): Observable<CalentamientoBackendResponse> {
    console.log('Creando calentamiento:', datos);

    const mockResponse: CalentamientoBackendResponse = {
      id: this.nextId++,
      temp_0: datos.temp_0,
      temp_5: datos.temp_5,
      temp_10: datos.temp_10,
      temp_15: datos.temp_15,
      temp_20: datos.temp_20,
      temp_25: datos.temp_25,
      temp_30: datos.temp_30,
      temp_35: datos.temp_35,
      temp_40: datos.temp_40,
      temp_45: datos.temp_45,
      temp_50: datos.temp_50,
      temp_55: datos.temp_55,
      controlTemperatura: datos.controlTemperatura
    };

    this.calentamientoMock.set(datos.controlTemperatura.id, mockResponse);

    return of(mockResponse).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.post<BackendApiResponse<CalentamientoBackendResponse>>(
      `${environment.ApiBLH}/postCalentamiento`,
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
   * Actualiza un registro de calentamiento existente
   */
  putCalentamiento(id: number, datos: CalentamientoBackendRequest): Observable<any> {
    console.log('Actualizando calentamiento:', id, datos);

    const updated = {
      id,
      ...datos,
      controlTemperatura: datos.controlTemperatura
    };

    this.calentamientoMock.set(datos.controlTemperatura.id, updated as CalentamientoBackendResponse);

    return of({ success: true, data: updated }).pipe(delay(500));

    /*
    // IMPLEMENTACIÓN REAL CON BACKEND
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putCalentamiento/${id}`,
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
