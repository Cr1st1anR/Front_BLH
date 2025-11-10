import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  PasterizacionData,
  PasterizacionBackendRequest,
  PasterizacionBackendResponse,
  BackendApiResponse
} from '../interfaces/pasterizacion.interface';

@Injectable({
  providedIn: 'root'
})
export class PasterizacionService {

  private readonly baseUrl = environment.ApiBLH;

  constructor(private readonly http: HttpClient) { }

  getPasterizacionesPorControlReenvase(idControlReenvase: number): Observable<PasterizacionBackendResponse[]> {
    return this.http.get<BackendApiResponse<PasterizacionBackendResponse[]>>(
      `${this.baseUrl}/getFrascoPasteurizadoByControlReenvase/${idControlReenvase}`
    ).pipe(
      map(response => {
        console.log('Respuesta del backend:', response);
        return response.data || [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener pasteurizaciones:', error);
        if (error.status === 204) {
          return [];
        }
        return throwError(() => error);
      })
    );
  }

  postPasterizacion(datos: PasterizacionBackendRequest): Observable<PasterizacionBackendResponse> {
    return this.http.post<BackendApiResponse<PasterizacionBackendResponse>>(
      `${this.baseUrl}/postFrascoPasteurizado`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear pasteurización:', error);
        return throwError(() => error);
      })
    );
  }

  putPasterizacion(id: number, datos: PasterizacionBackendRequest): Observable<any> {
    return this.http.put<BackendApiResponse<any>>(
      `${this.baseUrl}/putFrascoPasteurizado/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al actualizar pasteurización:', error);
        return throwError(() => error);
      })
    );
  }
}
