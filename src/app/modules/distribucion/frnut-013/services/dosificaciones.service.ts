import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import type {
  ApiResponseDosificaciones,
  DosificacionBackendRequest
} from '../interfaces/dosificaciones.interface';

@Injectable({
  providedIn: 'root'
})
export class DosificacionesService {

  constructor(private readonly http: HttpClient) { }

  getDosificacionesByIngresoId(idIngreso: number): Observable<ApiResponseDosificaciones> {
    return this.http.get<ApiResponseDosificaciones>(`${environment.ApiBLH}/lactarios/${idIngreso}`);
  }

  postDosificacion(data: DosificacionBackendRequest): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/lactarios`, data);
  }

  putDosificacion(id: number, data: DosificacionBackendRequest): Observable<any> {
    return this.http.put(`${environment.ApiBLH}/lactarios/${id}`, data);
  }
}
