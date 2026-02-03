import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  ApiResponse,
  DistribucionResumenBackend,
  DistribucionCompletaBackend,
  PutDistribucionPayload,
  PostDistribucionPayload,
  FrascoOption,
  Entidad,
  EntidadOption
} from '../interfaces/distribucion-leche-procesada.interface';

@Injectable({
  providedIn: 'root'
})
export class DistribucionLecheProcesadaService {

  constructor(private readonly http: HttpClient) { }


  getDistribucionesPorMes(mes: number, anio: number): Observable<DistribucionResumenBackend[]> {
    return this.http.get<ApiResponse<DistribucionResumenBackend[]>>(
      `${environment.ApiBLH}/distribucion/${mes}/${anio}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204 || !response.body?.data) {
          return [];
        }
        return response.body.data;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of([]);
        }
        throw error;
      })
    );
  }

  getDistribucionById(id: number): Observable<DistribucionCompletaBackend> {
    return this.http.get<ApiResponse<DistribucionCompletaBackend>>(
      `${environment.ApiBLH}/distribucion/${id}`
    ).pipe(
      map(response => response.data)
    );
  }

  putDistribucion(id: number, payload: PutDistribucionPayload): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/distribucion/${id}`,
      payload
    ).pipe(
      map(response => response.data)
    );
  }

  postDistribucion(payload: PostDistribucionPayload): Observable<DistribucionCompletaBackend> {
    return this.http.post<ApiResponse<DistribucionCompletaBackend>>(
      `${environment.ApiBLH}/distribucion`,
      payload
    ).pipe(
      map(response => response.data)
    );
  }

  getAllFrascosPasteurizados(): Observable<FrascoOption[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getAllFrascosPasteurizados`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204 || !response.body?.data) {
          return [];
        }

        return response.body.data
          .filter(frasco => frasco.activo)
          .map(frasco => ({
            label: `LHP 25 ${frasco.numeroFrasco}`,
            value: `LHP 25 ${frasco.numeroFrasco}`,
            id_frasco: frasco.id,
            numeroFrasco: frasco.numeroFrasco,
            año: new Date(frasco.controlReenvase.fecha).getFullYear(),
            calorias: frasco.controlReenvase?.seleccionClasificacion?.crematocrito?.kcal || 0,
            acidezDornic: frasco.controlReenvase?.seleccionClasificacion?.acidezDornic?.resultado || 0,
            gaveta: frasco.entradasSalidasPasteurizada?.gaveta || 0
          }))
          .sort((a, b) => a.numeroFrasco - b.numeroFrasco);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 204) {
          return of([]);
        }
        throw error;
      })
    );
  }

  getAllEntidades(): Observable<EntidadOption[]> {
    return this.http.get<ApiResponse<Entidad[]>>(
      `${environment.ApiBLH}/getAllEntidades`
    ).pipe(
      map(response => {
        return response.data
          .filter(entidad => entidad.activo === 1)
          .map(entidad => ({
            label: entidad.nombre,
            value: entidad.id
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      })
    );
  }
}
