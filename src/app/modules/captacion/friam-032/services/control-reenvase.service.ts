import { Injectable } from '@angular/core';
import type { ControlReenvaseData } from '../interfaces/control-reenvase.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlReenvaseService {

  constructor() { }

  getControlReenvaseData(): ControlReenvaseData[] {
    return [
      // {
      //   id: 1,
      //   responsable: 'Juan López',
      //   fecha: '2025-10-01',
      //   no_donante: '123456',
      //   no_frasco_anterior: 'FR-001',
      //   volumen_frasco_anterior: '500',
      //   no_frasco_pasterizacion: 'FP-001',
      //   volumen_frasco_pasterizacion: '480',
      // },
      {
        id: 2,
        fecha: '2025-10-02',
        nombre_madre: 'Ana García Rodríguez',
        volumen_inicial: '800',
        volumen_final: '775',
        perdidas: 25,
        responsable: 'María Fernández',
        observaciones: 'Control de calidad OK'
      },
      {
        id: 3,
        fecha: '2025-10-03',
        nombre_madre: 'Carmen Martínez López',
        volumen_inicial: '1200',
        volumen_final: '1125',
        perdidas: 75,
        responsable: 'Juan López',
        observaciones: 'Pérdida por espuma'
      },
      {
        id: 4,
        fecha: '2025-10-04',
        nombre_madre: 'Lucía Hernández Silva',
        volumen_inicial: '900',
        volumen_final: '870',
        perdidas: 30,
        responsable: 'Pedro Sánchez',
        observaciones: 'Proceso normal'
      },
      {
        id: 5,
        fecha: '2025-10-06',
        nombre_madre: 'Isabel Ruiz Castro',
        volumen_inicial: '1100',
        volumen_final: '1060',
        perdidas: 40,
        responsable: 'María Fernández',
        observaciones: 'Reenvase completado'
      }
    ];
  }
}
