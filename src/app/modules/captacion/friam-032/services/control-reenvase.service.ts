import { Injectable } from '@angular/core';
import type { ControlReenvaseData } from '../interfaces/control-reenvase.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlReenvaseService {

  constructor() { }

  getControlReenvaseData(): ControlReenvaseData[] {
    return [
      {
        id: 1,
        fecha: '2025-11-01',
        no_donante: '123456',
        id_frasco_anterior: 5,
        volumen_frasco_anterior: '500',
        responsable: 'Juan López'
      },
      {
        id: 2,
        fecha: '2025-11-02',
        no_donante: '789012',
        id_frasco_anterior: 6,
        volumen_frasco_anterior: '800',
        responsable: 'María Fernández'
      },
      {
        id: 3,
        fecha: '2025-11-03',
        no_donante: '345678',
        id_frasco_anterior: 7,
        volumen_frasco_anterior: '1200',
        responsable: 'Juan López'
      },
      {
        id: 4,
        fecha: '2025-11-04',
        no_donante: '901234',
        id_frasco_anterior: 8,
        volumen_frasco_anterior: '900',
        responsable: 'Pedro Sánchez'
      },
      {
        id: 5,
        fecha: '2025-11-06',
        no_donante: '567890',
        id_frasco_anterior: 9,
        volumen_frasco_anterior: '1100',
        responsable: 'María Fernández'
      }
    ];
  }
}
