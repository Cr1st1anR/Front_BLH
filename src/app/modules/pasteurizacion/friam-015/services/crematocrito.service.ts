import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  CrematocritoBackendRequest,
  CrematocritoBackendResponse,
  BackendApiResponse
} from '../interfaces/crematocrito.interface';

@Injectable({
  providedIn: 'root'
})
export class CrematocritoService {

  constructor(private readonly http: HttpClient) { }

  getCrematocritoBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<CrematocritoBackendResponse | null> {
    return this.http.get<BackendApiResponse<CrematocritoBackendResponse>>(
      `${environment.ApiBLH}/getCrematocrito/${idSeleccionClasificacion}`
    ).pipe(
      map(response => {
        if (response?.data) {
          return response.data;
        }
        return null;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of(null);
        }
        console.error('Error en getCrematocritoBySeleccionClasificacion:', error);
        return throwError(() => error);
      })
    );
  }

  postCrematocrito(datos: CrematocritoBackendRequest): Observable<CrematocritoBackendResponse> {
    return this.http.post<BackendApiResponse<CrematocritoBackendResponse>>(
      `${environment.ApiBLH}/postCrematocrito`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en postCrematocrito:', error);
        return throwError(() => error);
      })
    );
  }

  putCrematocrito(id: number, datos: CrematocritoBackendRequest): Observable<any> {
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putCrematocrito/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en putCrematocrito:', error);
        return throwError(() => error);
      })
    );
  }
}
