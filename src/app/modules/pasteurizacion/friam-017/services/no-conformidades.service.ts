import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environments';
import type {
  LoteOption,
  BackendResponse,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion
} from '../interfaces/no-conformidades.interface';

@Injectable({
  providedIn: 'root'
})
export class NoConformidadesService {

  constructor(private readonly http: HttpClient) { }

  // Datos mock para lotes
  private mockLotes: LoteOption[] = [
    { label: 'Lote 1', value: '1', numero_lote: 1 },
    { label: 'Lote 2', value: '2', numero_lote: 2 },
    { label: 'Lote 3', value: '3', numero_lote: 3 },
    { label: 'Lote 4', value: '4', numero_lote: 4 },
    { label: 'Lote 5', value: '5', numero_lote: 5 },
    { label: 'Lote 6', value: '6', numero_lote: 6 },
    { label: 'Lote 7', value: '7', numero_lote: 7 },
    { label: 'Lote 8', value: '8', numero_lote: 8 },
    { label: 'Lote 9', value: '9', numero_lote: 9 },
    { label: 'Lote 10', value: '10', numero_lote: 10 }
  ];

  // Datos mock para registros de no conformidades
  private mockNoConformidades: any[] = [
    {
      id: 1,
      fecha: '2025-11-15',
      lote: { id: 1, numeroLote: 1 },
      envase: 2,
      suciedad: 1,
      color: 0,
      flavor: 3,
      acidez: 1,
      numero_muestras_testadas: 50,
      numero_muestras_reprobadas: 7
    },
    {
      id: 2,
      fecha: '2025-11-14',
      lote: { id: 2, numeroLote: 2 },
      envase: 0,
      suciedad: 2,
      color: 1,
      flavor: 0,
      acidez: 2,
      numero_muestras_testadas: 45,
      numero_muestras_reprobadas: 5
    },
    {
      id: 3,
      fecha: '2025-11-13',
      lote: { id: 3, numeroLote: 3 },
      envase: 1,
      suciedad: 0,
      color: 2,
      flavor: 1,
      acidez: 0,
      numero_muestras_testadas: 38,
      numero_muestras_reprobadas: 4
    },
    {
      id: 4,
      fecha: '2025-10-20',
      lote: { id: 4, numeroLote: 4 },
      envase: 3,
      suciedad: 1,
      color: 1,
      flavor: 2,
      acidez: 1,
      numero_muestras_testadas: 42,
      numero_muestras_reprobadas: 8
    },
    {
      id: 5,
      fecha: '2025-10-18',
      lote: { id: 5, numeroLote: 5 },
      envase: 0,
      suciedad: 0,
      color: 0,
      flavor: 1,
      acidez: 0,
      numero_muestras_testadas: 35,
      numero_muestras_reprobadas: 1
    }
  ];

  getLotes(): Observable<LoteOption[]> {
    return of(this.mockLotes).pipe(
      delay(500), // Simular delay de red
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getLotes:', error);
        return throwError(() => error);
      })
    );
  }

  getAllNoConformidades(): Observable<any[]> {
    return of(this.mockNoConformidades).pipe(
      delay(800), // Simular delay de red
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getAllNoConformidades:', error);
        return throwError(() => error);
      })
    );
  }

  postNoConformidades(data: DatosBackendParaCreacion): Observable<any> {
    return of({
      data: {
        id: Math.floor(Math.random() * 1000) + 100,
        ...data,
        lote: {
          id: data.lote.id,
          numeroLote: data.lote.id
        }
      },
      message: 'Registro creado exitosamente'
    }).pipe(
      delay(1000),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en postNoConformidades:', error);
        return throwError(() => error);
      })
    );
  }

  putNoConformidades(data: DatosBackendParaActualizacion): Observable<any> {
    return of({
      data: data,
      message: 'Registro actualizado exitosamente'
    }).pipe(
      delay(1000),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en putNoConformidades:', error);
        return throwError(() => error);
      })
    );
  }

  getNoConformidadesById(id: number): Observable<any> {
    const registro = this.mockNoConformidades.find(item => item.id === id);
    return of(registro || null).pipe(
      delay(300),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en getNoConformidadesById:', error);
        return throwError(() => error);
      })
    );
  }
}
