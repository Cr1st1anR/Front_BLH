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
        responsable: 'Juan López',
        fecha: '2025-11-01',
        no_donante: '123456',
        no_frasco_anterior: 'FR-001',
        volumen_frasco_anterior: '500'
      },
      {
        id: 2,
        responsable: 'María Fernández',
        fecha: '2025-11-02',
        no_donante: '789012',
        no_frasco_anterior: 'FR-002',
        volumen_frasco_anterior: '800'
      },
      {
        id: 3,
        responsable: 'Juan López',
        fecha: '2025-11-03',
        no_donante: '345678',
        no_frasco_anterior: 'FR-003',
        volumen_frasco_anterior: '1200'
      },
      {
        id: 4,
        responsable: 'Pedro Sánchez',
        fecha: '2025-11-04',
        no_donante: '901234',
        no_frasco_anterior: 'FR-004',
        volumen_frasco_anterior: '900'
      },
      {
        id: 5,
        responsable: 'María Fernández',
        fecha: '2025-11-06',
        no_donante: '567890',
        no_frasco_anterior: 'FR-005',
        volumen_frasco_anterior: '1100'
      }
    ];
  }
}
