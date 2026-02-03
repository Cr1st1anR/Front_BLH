import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  getControlMicrobiologicoCompleto(ciclo: number, lote: number): Observable<GetControlMicrobiologicoResponse> {
    const url = `${environment.ApiBLH}/getControlMicrobiologico/${lote}/${ciclo}`;

    return this.http.get<GetControlMicrobiologicoResponse>(url, {
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.status === 204 || !response.body) {
          return {
            status: 204,
            statusmsg: 'No Content',
            data: {
              infoControl: null,
              frascos: []
            }
          } as GetControlMicrobiologicoResponse;
        }

        return response.body!;
      })
    );
  }

  getEmpleados(): Observable<EmpleadoOption[]> {
    const url = `${environment.ApiBLH}/GetEmpleados`;

    return this.http.get<{ status: number; statusmsg: string; data: EmpleadoBackend[] }>(url).pipe(
      map(response => response.data.map(empleado => ({
        id: empleado.id,
        nombre: empleado.nombre,
        cargo: empleado.cargo
      })))
    );
  }

  guardarControlMicrobiologicoCompleto(payload: PostPutControlMicrobiologicoPayload): Observable<any> {
    const url = `${environment.ApiBLH}/postControlMicrobiologico`;
    return this.http.post(url, payload);
  }

  actualizarControlMicrobiologicoCompleto(payload: PostPutControlMicrobiologicoPayload): Observable<any> {
    const url = `${environment.ApiBLH}/putControlMicrobiologico`;
    return this.http.put(url, payload);
  }
}
