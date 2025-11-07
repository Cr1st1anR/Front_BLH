import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type { ControlReenvaseData, DonanteOption, FrascoOption } from '../interfaces/control-reenvase.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlReenvaseService {

  constructor(private http: HttpClient) { }

  getMadresDonantes(): Observable<DonanteOption[]> {
    return this.http.get<any>(`${environment.ApiBLH}/GetMadreDonante`)
      .pipe(
        map(response => {
          const donantes = response.data || [];

          return donantes.map((madre: any) => ({
            label: `${madre.id_madre_donante} - ${madre.nombre} ${madre.apellido}`,
            value: madre.id_madre_donante.toString(),
            documento: madre.documento
          }));
        })
      );
  }

  getFrascosByMadreDonante(idMadreDonante: string): Observable<any[]> {
    return this.http.get<any>(`${environment.ApiBLH}/getFrascosByMadreDonante/${idMadreDonante}`, {
      observe: 'response'
    })
      .pipe(
        map(response => {
          if (response.status === 204) {
            return [];
          }

          return response.body?.data || [];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error real en getFrascosByMadreDonante:', error);
          return throwError(() => error);
        })
      );
  }

  getControlReenvaseData(): ControlReenvaseData[] {
    return [
      {
        id: 1,
        fecha: '2025-11-01',
        no_donante: '1',
        id_frasco_anterior: 5,
        volumen_frasco_anterior: '500',
        responsable: 'Juan López'
      },
      {
        id: 2,
        fecha: '2025-11-02',
        no_donante: '2',
        id_frasco_anterior: 6,
        volumen_frasco_anterior: '800',
        responsable: 'María Fernández'
      },
      {
        id: 3,
        fecha: '2025-11-03',
        no_donante: '3',
        id_frasco_anterior: 7,
        volumen_frasco_anterior: '1200',
        responsable: 'Juan López'
      },
      {
        id: 4,
        fecha: '2025-11-04',
        no_donante: '1',
        id_frasco_anterior: 8,
        volumen_frasco_anterior: '900',
        responsable: 'Pedro Sánchez'
      },
      {
        id: 5,
        fecha: '2025-11-06',
        no_donante: '2',
        id_frasco_anterior: 9,
        volumen_frasco_anterior: '1100',
        responsable: 'María Fernández'
      }
    ];
  }
}
