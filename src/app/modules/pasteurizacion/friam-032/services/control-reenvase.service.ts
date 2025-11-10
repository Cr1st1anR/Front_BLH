import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  DonanteOption,
  ResponsableOption,
  BackendResponse,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion
} from '../interfaces/control-reenvase.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlReenvaseService {

  constructor(private readonly http: HttpClient) { }

  getMadresDonantes(): Observable<DonanteOption[]> {
    return this.http.get<BackendResponse<any[]>>(`${environment.ApiBLH}/GetMadreDonante`)
      .pipe(
        map(response => {
          const donantes = response.data || [];
          return donantes.map((madre: any) => ({
            label: `${madre.id_madre_donante} - ${madre.nombre} ${madre.apellido}`,
            value: madre.id_madre_donante.toString(),
            documento: madre.documento
          }));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getMadresDonantes:', error);
          return throwError(() => error);
        })
      );
  }

  getFrascosByMadreDonante(idMadreDonante: string): Observable<any[]> {
    return this.http.get<BackendResponse<any[]>>(`${environment.ApiBLH}/getFrascosByMadreDonante/${idMadreDonante}`, {
      observe: 'response'
    })
      .pipe(
        map(response => {
          if (response.status === 204) return [];
          return response.body?.data || [];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getFrascosByMadreDonante:', error);
          return throwError(() => error);
        })
      );
  }

  getEmpleados(): Observable<ResponsableOption[]> {
    return this.http.get<BackendResponse<any[]>>(`${environment.ApiBLH}/GetEmpleados`, {
      observe: 'response'
    })
      .pipe(
        map(response => {
          if (response.status === 204) return [];
          const empleados = response.body?.data || [];
          return empleados.map((empleado: any) => ({
            label: empleado.nombre,
            value: empleado.nombre,
            id_empleado: empleado.id,
            cargo: empleado.cargo,
            telefono: empleado.telefono,
            correo: empleado.correo
          }));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getEmpleados:', error);
          return throwError(() => error);
        })
      );
  }

  getAllControlReenvase(): Observable<any[]> {
    return this.http.get<BackendResponse<any[]>>(`${environment.ApiBLH}/getAllControlReenvase`, {
      observe: 'response'
    })
      .pipe(
        map(response => {
          if (response.status === 204) return [];
          return response.body?.data || [];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getAllControlReenvase:', error);
          return throwError(() => error);
        })
      );
  }

  postControlReenvase(data: DatosBackendParaCreacion): Observable<any> {
    return this.http.post<BackendResponse<any>>(`${environment.ApiBLH}/postControlReenvase`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en postControlReenvase:', error);
          return throwError(() => error);
        })
      );
  }

  putControlReenvase(data: DatosBackendParaActualizacion): Observable<any> {
    return this.http.put<BackendResponse<any>>(`${environment.ApiBLH}/putControlReenvase`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en putControlReenvase:', error);
          return throwError(() => error);
        })
      );
  }
}
