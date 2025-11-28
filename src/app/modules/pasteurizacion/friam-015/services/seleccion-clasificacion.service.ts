import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  SeleccionClasificacionData,
  ResponsableOption,
  ApiResponse
} from '../interfaces/seleccion-clasificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class SeleccionClasificacionService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene los datos de selección y clasificación por mes y año
   */
  getSeleccionClasificacionPorMesYAnio(mes: number, anio: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getSeleccionClasificacion`,
      {
        params: { mes: mes.toString(), anio: anio.toString() }
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getSeleccionClasificacionPorMesYAnio:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene empleados del backend
   */
  getEmpleados(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.ApiBLH}/GetEmpleados`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en getEmpleados:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza/Crea un registro de selección y clasificación
   * Funciona como POST (crear infoSeleccionClasificacion) o PUT (actualizar) dependiendo de si tiene infoSeleccionClasificacion.id
   */
  putSeleccionClasificacion(id: number, data: any): Observable<ApiResponse<any>> {
    console.log('Enviando datos a putSeleccionClasificacion:', { id, data });

    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putSeleccionClasificacion/${id}`, data)
      .pipe(
        map(response => {
          console.log('Respuesta de putSeleccionClasificacion:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en putSeleccionClasificacion:', error);
          return throwError(() => error);
        })
      );
  }

  // ============= MÉTODOS MOCK PARA DESARROLLO (FALLBACK) =============

  getAllSeleccionClasificacionMock(): Observable<SeleccionClasificacionData[]> {
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
      }
    ];

    return of(mockData).pipe(delay(500));
  }

  getEmpleadosMock(): Observable<ResponsableOption[]> {
    const mockEmpleados: ResponsableOption[] = [
      { label: 'Dr. Juan Pérez', value: 'Dr. Juan Pérez', id_empleado: 1, cargo: 'Médico' },
      { label: 'Dra. Carmen Silva', value: 'Dra. Carmen Silva', id_empleado: 2, cargo: 'Médico' },
      { label: 'Ana López', value: 'Ana López', id_empleado: 3, cargo: 'Auxiliar' },
      { label: 'Pedro Gómez', value: 'Pedro Gómez', id_empleado: 4, cargo: 'Auxiliar' }
    ];

    return of(mockEmpleados).pipe(delay(300));
  }

  /**
   * Mock de putSeleccionClasificacion para desarrollo/fallback
   */
  putSeleccionClasificacionMock(id: number, data: any): Observable<any> {
    console.log('Mock - Actualizando/Creando registro:', { id, data });

    // Simular respuesta exitosa
    const mockResponse = {
      status: 200,
      statusmsg: "OK",
      data: {
        affected: 1,
        generatedMaps: [],
        raw: data
      }
    };

    return of(mockResponse).pipe(delay(800));
  }
}
