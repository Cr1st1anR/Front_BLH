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
        no_frasco_pasterizacion: 'FP-001',
        volumen_frasco_pasterizacion: '480',
        id_control_reenvase: 2
      },
      {
        id: 2,
        no_frasco_pasterizacion: 'FP-002',
        volumen_frasco_pasterizacion: '750',
        id_control_reenvase: 2
      },
      {
        id: 3,
        no_frasco_pasterizacion: 'FP-003',
        volumen_frasco_pasterizacion: '1100',
        id_control_reenvase: 3
      },
      {
        id: 4,
        no_frasco_pasterizacion: 'FP-004',
        volumen_frasco_pasterizacion: '850',
        id_control_reenvase: 4
      },
      {
        id: 5,
        no_frasco_pasterizacion: 'FP-005',
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
