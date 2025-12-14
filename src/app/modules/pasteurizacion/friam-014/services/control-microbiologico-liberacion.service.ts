import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

import type {
  EmpleadoOption,
  GetControlMicrobiologicoResponse,
  PostPutControlMicrobiologicoPayload,
  EmpleadoBackend
} from '../interfaces/control-microbiologico-liberacion.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlMicrobiologicoLiberacionService {

  constructor(private readonly http: HttpClient) { }

  // ============= GET: BÚSQUEDA POR CICLO Y LOTE =============

  getControlMicrobiologicoCompleto(ciclo: number, lote: number): Observable<GetControlMicrobiologicoResponse> {
    const url = `${environment.ApiBLH}/getControlMicrobiologico/${lote}/${ciclo}`;

    return this.http.get<GetControlMicrobiologicoResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  // ============= GET: EMPLEADOS =============

  getEmpleados(): Observable<EmpleadoOption[]> {
    const url = `${environment.ApiBLH}/GetEmpleados`;

    return this.http.get<{ status: number; statusmsg: string; data: EmpleadoBackend[] }>(url).pipe(
      map(response => response.data.map(empleado => ({
        id: empleado.id,
        nombre: empleado.nombre,
        cargo: empleado.cargo
      }))),
      catchError(this.handleError)
    );
  }

  // ============= POST: GUARDAR CONTROL MICROBIOLÓGICO =============

  guardarControlMicrobiologicoCompleto(payload: PostPutControlMicrobiologicoPayload): Observable<any> {
    const url = `${environment.ApiBLH}/postControlMicrobiologico`;

    console.log('📦 POST Payload:', payload);

    return this.http.post(url, payload).pipe(
      map(response => {
        console.log('✅ Respuesta POST:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // ============= PUT: ACTUALIZAR CONTROL MICROBIOLÓGICO =============

  actualizarControlMicrobiologicoCompleto(payload: PostPutControlMicrobiologicoPayload): Observable<any> {
    const url = `${environment.ApiBLH}/putControlMicrobiologico`;

    console.log('📦 PUT Payload:', payload);

    return this.http.put(url, payload).pipe(
      map(response => {
        console.log('✅ Respuesta PUT:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // ============= MANEJO DE ERRORES =============

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status}\nMensaje: ${error.message}`;

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('❌ Error en servicio:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
