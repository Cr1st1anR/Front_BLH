import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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

  constructor(private readonly http: HttpClient) { }

  getPasterizacionesPorControlReenvase(idControlReenvase: number): Observable<PasterizacionBackendResponse[]> {
    return this.http.get<BackendApiResponse<PasterizacionBackendResponse[]>>(
      `${environment.ApiBLH}/getFrascoPasteurizadoByControlReenvase/${idControlReenvase}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204 || !response.body?.data) {
          return [];
        }

        return response.body.data || [];
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of([]);
        }

        return throwError(() => error);
      })
    );
  }

  postPasterizacion(datos: PasterizacionBackendRequest): Observable<PasterizacionBackendResponse> {
    return this.http.post<BackendApiResponse<PasterizacionBackendResponse>>(
      `${environment.ApiBLH}/postFrascoPasteurizado`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  putPasterizacion(id: number, datos: PasterizacionBackendRequest): Observable<any> {
    return this.http.put<BackendApiResponse<any>>(
      `${environment.ApiBLH}/putFrascoPasteurizado/${id}`,
      datos
    ).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getAllPasteurizaciones(): Observable<PasterizacionBackendResponse[]> {
    return this.http.get<BackendApiResponse<PasterizacionBackendResponse[]>>(
      `${environment.ApiBLH}/getAllFrascosPasteurizados`
    ).pipe(
      map(response => response.data || []),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of([]);
        }
        return throwError(() => error);
      })
    );
  }
}
