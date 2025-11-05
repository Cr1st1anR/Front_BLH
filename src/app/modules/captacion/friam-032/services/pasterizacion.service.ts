import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { PasterizacionData } from '../interfaces/pasterizacion.interface';

@Injectable({
  providedIn: 'root'
})
export class PasterizacionService {

  constructor() { }

  getPasterizacionesPorControlReenvase(idControlReenvase: number): Observable<PasterizacionData[]> {
    const datosPasterizacion: PasterizacionData[] = [
      {
        id: 1,
        no_frasco_pasterizacion: 'LHP 25 5',
        volumen_frasco_pasterizacion: '480',
        id_control_reenvase: 2
      },
      {
        id: 2,
        no_frasco_pasterizacion: 'LHP 25 6',
        volumen_frasco_pasterizacion: '750',
        id_control_reenvase: 2
      },
      {
        id: 3,
        no_frasco_pasterizacion: 'LHP 25 7',
        volumen_frasco_pasterizacion: '1100',
        id_control_reenvase: 3
      },
      {
        id: 4,
        no_frasco_pasterizacion: 'LHP 25 8',
        volumen_frasco_pasterizacion: '850',
        id_control_reenvase: 4
      },
      {
        id: 5,
        no_frasco_pasterizacion: 'LHP 25 9',
        volumen_frasco_pasterizacion: '1020',
        id_control_reenvase: 5
      }
    ];

    return of(datosPasterizacion);
  }

  postPasterizacion(pasterizacion: PasterizacionData): Observable<any> {
    // Simulación temporal
    return of({
      success: true,
      id: Date.now(),
      message: 'Pasteurización creada correctamente'
    });
  }

  putPasterizacion(id: number, pasterizacion: PasterizacionData): Observable<any> {
    // Simulación temporal
    return of({
      success: true,
      message: 'Pasteurización actualizada correctamente'
    });
  }

}
