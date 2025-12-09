import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  LoteOption,
  BackendResponse,
  DatosBackendParaCreacion,
  NoConformidadesBackendResponse,
  LoteBackendResponse,
  DatosCalculadosResponse
} from '../interfaces/no-conformidades.interface';

@Injectable({
  providedIn: 'root'
})
export class NoConformidadesService {

  constructor(private readonly http: HttpClient) { }

  getNoConformidadesPorMesAnio(mes: number, anio: number): Observable<NoConformidadesBackendResponse[]> {
    return this.http.get<BackendResponse<NoConformidadesBackendResponse[]>>(
      `${environment.ApiBLH}/conformidades/${mes}/${anio}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) return [];
        return response.body?.data || [];
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) return of([]);
        console.error('Error en getNoConformidadesPorMesAnio:', error);
        return throwError(() => error);
      })
    );
  }

  postNoConformidades(data: DatosBackendParaCreacion): Observable<any> {
    return this.http.post<BackendResponse<any>>(
      `${environment.ApiBLH}/conformidades`,
      data
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en postNoConformidades:', error);
        return throwError(() => error);
      })
    );
  }

  getDatosCalculadosPorLote(numeroLote: number, fecha: string): Observable<DatosCalculadosResponse> {
    return this.http.get<BackendResponse<DatosCalculadosResponse>>(
      `${environment.ApiBLH}/lote/${numeroLote}/${fecha}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204 || !response.body?.data) {
          return {
            envase: 0,
            color: 0,
            flavor: 0,
            suciedad: 0,
            acidez: 0,
            muestrasTesteadas: 0,
            muestrasReprobadas: 0
          };
        }
        return response.body.data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of({
            envase: 0,
            color: 0,
            flavor: 0,
            suciedad: 0,
            acidez: 0,
            muestrasTesteadas: 0,
            muestrasReprobadas: 0
          });
        }
        console.error('Error en getDatosCalculadosPorLote:', error);
        return throwError(() => error);
      })
    );
  }

  getLotesDisponibles(): Observable<LoteOption[]> {
    return this.http.get<BackendResponse<LoteBackendResponse[]>>(
      `${environment.ApiBLH}/lotes-disponibles`
    ).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) return [];

        const lotesUnicos = new Map<number, LoteBackendResponse>();
        response.data.forEach(lote => {
          if (!lotesUnicos.has(lote.numeroLote)) {
            lotesUnicos.set(lote.numeroLote, lote);
          }
        });

        return Array.from(lotesUnicos.values()).map(lote => ({
          label: `Lote ${lote.numeroLote}`,
          value: lote.numeroLote.toString(),
          numeroLote: lote.numeroLote,
          loteId: lote.loteId,
          cicloId: lote.cicloId
        }));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getLotesDisponibles:', error);
        return throwError(() => error);
      })
    );
  }
}
