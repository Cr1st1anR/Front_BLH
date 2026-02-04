import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environments';
import { ApiResponse } from '../../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { BodyRespuestasVisita, BodyVisita } from '../../accordion/interfaces/descripcion-situacion.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaDomiciliariaService {

  constructor(
    private http: HttpClient
  ) { }

  getDataVisitaDomiciliaria(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllMadresPotenciales`;
    return this.http.get<ApiResponse>(url);
  }

  getVisitaMadre(id: string): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetVisitaMadre/${id}`;
    return this.http.get<ApiResponse>(url);
  }

  getPreguntas(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetPreguntasVisitaMadre`;
    return this.http.get<ApiResponse>(url);
  }

  getCategorias(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetCategoriasVisitaMadre`;
    return this.http.get<ApiResponse>(url);
  }

  postDataVisitaMadres(body: BodyVisita): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/CreateVisitaMadre`;
    return this.http.post<ApiResponse>(url, body);
  }

  postRespuestasVisita(body: BodyRespuestasVisita[]): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/SaveRespuestasVisitaMadre`;
    return this.http.post<ApiResponse>(url, body);
  }
}
