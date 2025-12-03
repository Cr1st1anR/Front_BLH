import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  ResponsableOption,
  LoteOption,
  BackendResponse,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion,
  ControlTemperaturaBackendResponse,
  EmpleadoBackendResponse,
  LoteBackendResponse
} from '../interfaces/control-temperatura.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlTemperaturaService {

  constructor(private readonly http: HttpClient) { }

  getLotes(): Observable<LoteOption[]> {
    return this.http.get<BackendResponse<LoteBackendResponse[]>>(
      `${environment.ApiBLH}/lotes-disponibles`
    ).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) {
          return [];
        }

        return response.data.map(lote => ({
          label: `Lote ${lote.numeroLote}`,
          value: `LT-${lote.numeroLote.toString().padStart(3, '0')}`,
          numeroLote: lote.numeroLote,
          ciclo: `C${lote.numeroCiclo}`,
          numeroCiclo: lote.numeroCiclo
        }));
      }),
      catchError(error => {
        console.error('Error al cargar lotes:', error);
        return of([]);
      })
    );
  }

  getEmpleados(): Observable<ResponsableOption[]> {
    return this.http.get<BackendResponse<EmpleadoBackendResponse[]>>(
      `${environment.ApiBLH}/GetEmpleados`
    ).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) {
          return [];
        }

        return response.data.map(empleado => ({
          label: empleado.nombre,
          value: empleado.nombre,
          id_empleado: empleado.id,
          cargo: empleado.cargo,
          telefono: empleado.telefono,
          correo: empleado.correo || undefined
        }));
      }),
      catchError(error => {
        console.error('Error al cargar empleados:', error);
        return of([]);
      })
    );
  }

  getAllControlTemperatura(): Observable<ControlTemperaturaBackendResponse[]> {
    return this.http.get<BackendResponse<ControlTemperaturaBackendResponse[]>>(
      `${environment.ApiBLH}/temperatura-pasteurizador`
    ).pipe(
      map(response => {
        if (!response.data) {
          return [];
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error al cargar control de temperatura:', error);
        return of([]);
      })
    );
  }

  postControlTemperatura(data: DatosBackendParaCreacion): Observable<BackendResponse<any>> {
    return this.http.post<BackendResponse<any>>(
      `${environment.ApiBLH}/temperatura-pasteurizador`,
      data
    ).pipe(
      catchError(error => {
        console.error('Error al crear registro:', error);
        return throwError(() => error);
      })
    );
  }

  putControlTemperatura(id: number, data: DatosBackendParaActualizacion): Observable<BackendResponse<any>> {
    return this.http.put<BackendResponse<any>>(
      `${environment.ApiBLH}/temperatura-pasteurizador/${id}`,
      data
    ).pipe(
      catchError(error => {
        console.error('Error al actualizar registro:', error);
        return throwError(() => error);
      })
    );
  }
}
