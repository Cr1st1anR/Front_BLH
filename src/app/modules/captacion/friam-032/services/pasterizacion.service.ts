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
        no_frasco_pasterizacion: 'LHP 25 1',
        volumen_frasco_pasterizacion: '480',
        observaciones_pasterizacion: '',
        id_control_reenvase: 1
      },
      {
        id: 2,
        no_frasco_pasterizacion: 'LHP 25 2',
        volumen_frasco_pasterizacion: '750',
        observaciones_pasterizacion: '',
        id_control_reenvase: 1
      },
      {
        id: 3,
        no_frasco_pasterizacion: 'LHP 25 3',
        volumen_frasco_pasterizacion: '600',
        observaciones_pasterizacion: '',
        id_control_reenvase: 2
      },
      {
        id: 4,
        no_frasco_pasterizacion: 'LHP 25 4',
        volumen_frasco_pasterizacion: '1100',
        observaciones_pasterizacion: '',
        id_control_reenvase: 2
      },
      {
        id: 5,
        no_frasco_pasterizacion: '',
        volumen_frasco_pasterizacion: '0',
        observaciones_pasterizacion: 'Sale por impureza',
        id_control_reenvase: 2
      },
      {
        id: 6,
        no_frasco_pasterizacion: 'LHP 25 5',
        volumen_frasco_pasterizacion: '850',
        observaciones_pasterizacion: '',
        id_control_reenvase: 3
      },
      {
        id: 7,
        no_frasco_pasterizacion: 'LHP 25 6',
        volumen_frasco_pasterizacion: '920',
        observaciones_pasterizacion: '',
        id_control_reenvase: 4
      },
      {
        id: 8,
        no_frasco_pasterizacion: 'LHP 25 7',
        volumen_frasco_pasterizacion: '1020',
        observaciones_pasterizacion: '',
        id_control_reenvase: 5
      }
    ];

    return of(datosPasterizacion);
  }

  postPasterizacion(pasterizacion: PasterizacionData): Observable<any> {
    return of({
      success: true,
      id: Date.now(),
      message: 'Pasteurización creada correctamente'
    });
  }

  putPasterizacion(id: number, pasterizacion: PasterizacionData): Observable<any> {
    return of({
      success: true,
      message: 'Pasteurización actualizada correctamente'
    });
  }
}
