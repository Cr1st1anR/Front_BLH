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
        no_frasco_pasterizacion: 'SALE POR IMPUREZA',
        volumen_frasco_pasterizacion: '0',
        id_control_reenvase: 2
      },
      {
        id: 2,
        no_frasco_pasterizacion: 'LHP 25 11',
        volumen_frasco_pasterizacion: '750',
        id_control_reenvase: 2
      },
      {
        id: 3,
        no_frasco_pasterizacion: 'LHP 25 12',
        volumen_frasco_pasterizacion: '1100',
        id_control_reenvase: 3
      },
      {
        id: 4,
        no_frasco_pasterizacion: 'LHP 25 13',
        volumen_frasco_pasterizacion: '850',
        id_control_reenvase: 4
      },
      {
        id: 5,
        no_frasco_pasterizacion: 'LHP 25 14',
        volumen_frasco_pasterizacion: '1020',
        id_control_reenvase: 5
      }
    ];

    const datosFiltrados = datosPasterizacion.filter(item =>
      item.id_control_reenvase === idControlReenvase
    );

    return of(datosFiltrados);
  }

  crearPasterizacion(pasterizacion: PasterizacionData): Observable<any> {
    console.log('Creando pasteurización:', pasterizacion);
    return of({ success: true, id: Date.now() });
  }

  actualizarPasterizacion(pasterizacion: PasterizacionData): Observable<any> {
    console.log('Actualizando pasteurización:', pasterizacion);
    return of({ success: true });
  }

  eliminarPasterizacion(id: number): Observable<any> {
    console.log('Eliminando pasteurización:', id);
    return of({ success: true });
  }
}
