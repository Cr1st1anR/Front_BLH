import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  SeleccionClasificacionData,
  ResponsableOption,
  BackendResponse
} from '../interfaces/seleccion-clasificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class SeleccionClasificacionService {

  constructor(private readonly http: HttpClient) { }

  getAllSeleccionClasificacion(): Observable<SeleccionClasificacionData[]> {
    const mockData: SeleccionClasificacionData[] = [
      {
        id: 1,
        fecha: '2025-11-15',
        gaveta_cruda: '3',
        dias_produccion: '2M',
        no_frasco_procesado: 'LHP 25 1',
        donante: '1834',
        frasco_leche_cruda: 'LHC 25 1',
        edad_gestacional: 38.1,
        volumen: '150',
        nombre_profesional: 'Alejandra Lopez',
        nombre_auxiliar: 'Ana Benavides',
        n_frascos_pasteurizados: 30,
        volumen_pasteurizado: '100',
        fecha_vencimiento: '2025-11-22',
        observaciones: 'Sin observaciones',
        ciclo: '13',
        n_lote_medios_cultivo: '259-260',
        fecha_vencimiento_cultivos: '2025-11-15',
        lote: '1062'
      },
      {
        id: 2,
        fecha: '2025-11-16',
        gaveta_cruda: '3',
        dias_produccion: '9D',
        no_frasco_procesado: 'LHP 25 2',
        donante: '1845',
        frasco_leche_cruda: 'LHC 25 2',
        edad_gestacional: 39,
        volumen: '176',
        nombre_profesional: 'Alejandra Lopez',
        nombre_auxiliar: 'Ana Benavides',
        n_frascos_pasteurizados: 30,
        volumen_pasteurizado: '100',
        fecha_vencimiento: '2025-11-22',
        observaciones: 'Sin observaciones',
        ciclo: '13',
        n_lote_medios_cultivo: '259-260',
        fecha_vencimiento_cultivos: '2025-11-15',
        lote: '1062'
      },
      {
        id: 3,
        fecha: '2025-11-20',
        gaveta_cruda: '4',
        dias_produccion: '5D',
        no_frasco_procesado: 'LHP 25 3',
        donante: '1850',
        frasco_leche_cruda: 'LHC 25 3',
        edad_gestacional: 40,
        volumen: '200',
        nombre_profesional: 'Alejandra Lopez',
        nombre_auxiliar: 'Ana Benavides',
        n_frascos_pasteurizados: 35,
        volumen_pasteurizado: '120',
        fecha_vencimiento: '2025-11-27',
        observaciones: 'Sin observaciones',
        ciclo: '14',
        n_lote_medios_cultivo: '261-262',
        fecha_vencimiento_cultivos: '2025-11-20',
        lote: '1063'
      }
    ];

    return of(mockData).pipe(delay(500));
  }

  getEmpleados(): Observable<ResponsableOption[]> {
    const mockEmpleados: ResponsableOption[] = [
      { label: 'Dr. Juan Pérez', value: 'Dr. Juan Pérez', id_empleado: 1, cargo: 'Médico' },
      { label: 'Dra. Carmen Silva', value: 'Dra. Carmen Silva', id_empleado: 2, cargo: 'Médico' },
      { label: 'Ana López', value: 'Ana López', id_empleado: 3, cargo: 'Auxiliar' },
      { label: 'Pedro Gómez', value: 'Pedro Gómez', id_empleado: 4, cargo: 'Auxiliar' }
    ];

    return of(mockEmpleados).pipe(delay(300));
  }

  putSeleccionClasificacion(data: any): Observable<any> {
    console.log('Actualizando registro:', data);
    return of({ success: true, data }).pipe(delay(500));
  }

  /*
  getAllSeleccionClasificacion(): Observable<SeleccionClasificacionData[]> {
    return this.http.get<BackendResponse<SeleccionClasificacionData[]>>(
      `${environment.ApiBLH}/getAllSeleccionClasificacion`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) return [];
        return response.body?.data || [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getAllSeleccionClasificacion:', error);
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

  putSeleccionClasificacion(data: any): Observable<any> {
    return this.http.put<BackendResponse<any>>(`${environment.ApiBLH}/putSeleccionClasificacion`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en putSeleccionClasificacion:', error);
          return throwError(() => error);
        })
      );
  }
  */
}
