import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  CrematocritoData,
  CrematocritoBackendRequest,
  CrematocritoBackendResponse,
  BackendApiResponse
} from '../interfaces/crematocrito.interface';

@Injectable({
  providedIn: 'root'
})
export class CrematocritoService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene el crematocrito por ID de selección-clasificación
   * Retorna null si no hay datos (HTTP 204)
   */
  getCrematocritoBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<CrematocritoBackendResponse | null> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Cargando crematocrito para:', idSeleccionClasificacion);

    // Simular que no hay datos (retornar null)
    return of(null).pipe(delay(500));

    /*
    return this.http.get<BackendApiResponse<CrematocritoBackendResponse>>(
      `${environment.ApiBLH}/getCrematocritoBySeleccionClasificacion/${idSeleccionClasificacion}`,
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
   * Crea un nuevo crematocrito
   */
  postCrematocrito(datos: CrematocritoBackendRequest): Observable<CrematocritoBackendResponse> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Creando crematocrito:', datos);

    const mockResponse: CrematocritoBackendResponse = {
      id: Math.floor(Math.random() * 1000),
      ct1: datos.ct1,
      ct2: datos.ct2,
      ct3: datos.ct3,
      mediaCt: datos.mediaCt,
      cc1: datos.cc1,
      cc2: datos.cc2,
      cc3: datos.cc3,
      mediaCc: datos.mediaCc,
      kcalL: datos.kcalL,
      seleccionClasificacion: datos.seleccionClasificacion
    };

    return of(mockResponse).pipe(delay(500));

    /*
    return this.http.post<BackendApiResponse<CrematocritoBackendResponse>>(
      `${environment.ApiBLH}/postCrematocrito`,
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
   * Actualiza un crematocrito existente
   */
  putCrematocrito(id: number, datos: CrematocritoBackendRequest): Observable<any> {
    // MOCK - Reemplazar con llamada real al backend
    console.log('Actualizando crematocrito:', id, datos);

    return of({ success: true, data: { id, ...datos } }).pipe(delay(500));

    /*
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putCrematocrito/${id}`,
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
