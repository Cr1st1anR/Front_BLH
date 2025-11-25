import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  FrascoPasteurizadoData,
  ControlMicrobiologicoLiberacionData,
  BackendResponse
} from '../interfaces/control-microbiologico-liberacion.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlMicrobiologicoLiberacionService {

  private frascosPasteurizadosMock: FrascoPasteurizadoData[] = [
    {
      id: 1,
      numeroFrasco: 1,
      volumen: 150,
      // observaciones: null,
      fechaPasteurizacion: '2024-11-20',
      ciclo: 1,
      lote: 1
    },
    {
      id: 2,
      numeroFrasco: 2,
      volumen: 200,
      // observaciones: null,
      fechaPasteurizacion: '2024-11-20',
      ciclo: 1,
      lote: 1
    },
    {
      id: 3,
      numeroFrasco: 3,
      volumen: 175,
      // observaciones: null,
      fechaPasteurizacion: '2024-11-21',
      ciclo: 1,
      lote: 2
    },
    {
      id: 4,
      numeroFrasco: 4,
      volumen: 180,
      // observaciones: null,
      fechaPasteurizacion: '2024-11-21',
      ciclo: 1,
      lote: 2
    },
    {
      id: 5,
      numeroFrasco: 5,
      volumen: 160,
      // observaciones: null,
      fechaPasteurizacion: '2024-11-22',
      ciclo: 2,
      lote: 1
    }
  ];

  // Datos mock de controles microbiológicos existentes
  private controlesMock: ControlMicrobiologicoLiberacionData[] = [
    {
      id: 1,
      numero_frasco_pasteurizado: 'LHP 24 1',
      id_frasco_pasteurizado: 1,
      coliformes_totales: 'A',
      conformidad: 'C',
      prueba_confirmatoria: null,
      liberacion_producto: 'Si',
      fecha_pasteurizacion: new Date('2024-11-20'),
      ciclo: 1,
      lote: 1
    },
    {
      id: 2,
      numero_frasco_pasteurizado: 'LHP 24 2',
      id_frasco_pasteurizado: 2,
      coliformes_totales: 'P',
      conformidad: 'NC',
      prueba_confirmatoria: 'PC',
      liberacion_producto: 'No',
      fecha_pasteurizacion: new Date('2024-11-20'),
      ciclo: 1,
      lote: 1
    }
  ];

  constructor() { }

  getFrascosPasteurizadosPorCicloLote(ciclo: number, lote: number): Observable<FrascoPasteurizadoData[]> {
    const frascosFiltrados = this.frascosPasteurizadosMock.filter(
      frasco => frasco.ciclo === ciclo && frasco.lote === lote
    );

    return of(frascosFiltrados).pipe(delay(800));
  }

  getAllControlesMicrobiologicos(): Observable<ControlMicrobiologicoLiberacionData[]> {
    return of([...this.controlesMock]).pipe(delay(500));
  }

  postControlMicrobiologico(data: Omit<ControlMicrobiologicoLiberacionData, 'id'>): Observable<BackendResponse<ControlMicrobiologicoLiberacionData>> {
    const newId = Math.max(...this.controlesMock.map(c => c.id || 0)) + 1;
    const newControl: ControlMicrobiologicoLiberacionData = {
      ...data,
      id: newId
    };

    this.controlesMock.push(newControl);

    return of({
      data: newControl,
      message: 'Control microbiológico creado exitosamente',
      status: 201
    }).pipe(delay(600));
  }

  putControlMicrobiologico(id: number, data: ControlMicrobiologicoLiberacionData): Observable<BackendResponse<ControlMicrobiologicoLiberacionData>> {
    const index = this.controlesMock.findIndex(c => c.id === id);

    if (index !== -1) {
      this.controlesMock[index] = { ...data, id };

      return of({
        data: this.controlesMock[index],
        message: 'Control microbiológico actualizado exitosamente',
        status: 200
      }).pipe(delay(600));
    }

    return of({
      data: data,
      message: 'Control microbiológico no encontrado',
      status: 404
    }).pipe(delay(600));
  }
}
