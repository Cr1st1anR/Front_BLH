import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  AcidezDornicBackendRequest,
  AcidezDornicBackendResponse,
  BackendApiResponse
} from '../interfaces/acidez-dornic.interface';

@Injectable({
  providedIn: 'root'
})
export class AcidezDornicService {

  constructor(private readonly http: HttpClient) { }

  getAcidezDornicBySeleccionClasificacion(idSeleccionClasificacion: number): Observable<AcidezDornicBackendResponse | null> {
    return this.http.get<BackendApiResponse<AcidezDornicBackendResponse>>(
      `${environment.ApiBLH}/getAcidezDornic/${idSeleccionClasificacion}`
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
        console.error('Error en getAcidezDornicBySeleccionClasificacion:', error);
        return throwError(() => error);
      })
    );
  }

  postAcidezDornic(datos: AcidezDornicBackendRequest): Observable<AcidezDornicBackendResponse> {
    return this.http.post<BackendApiResponse<AcidezDornicBackendResponse>>(
      `${environment.ApiBLH}/postAcidezDornic`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en postAcidezDornic:', error);
        return throwError(() => error);
      })
    );
  }

  putAcidezDornic(id: number, datos: AcidezDornicBackendRequest): Observable<any> {
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putAcidezDornic/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en putAcidezDornic:', error);
        return throwError(() => error);
      })
    );
  }
}
