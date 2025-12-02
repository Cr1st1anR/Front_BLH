import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  FrascoPasteurizadoData,
  ControlMicrobiologicoLiberacionData,
  BackendResponse,
  EmpleadoOption
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
      fechaPasteurizacion: '2024-11-20',
      ciclo: 1,
      lote: 1
    },
    {
      id: 2,
      numeroFrasco: 2,
      volumen: 200,
      fechaPasteurizacion: '2024-11-20',
      ciclo: 1,
      lote: 1
    },
    {
      id: 3,
      numeroFrasco: 3,
      volumen: 175,
      fechaPasteurizacion: '2024-11-21',
      ciclo: 1,
      lote: 2
    },
    {
      id: 4,
      numeroFrasco: 4,
      volumen: 180,
      fechaPasteurizacion: '2024-11-21',
      ciclo: 1,
      lote: 2
    },
    {
      id: 5,
      numeroFrasco: 5,
      volumen: 160,
      fechaPasteurizacion: '2024-11-22',
      ciclo: 2,
      lote: 1
    },
    {
      id: 6,
      numeroFrasco: 6,
      volumen: 185,
      fechaPasteurizacion: '2024-11-22',
      ciclo: 2,
      lote: 1
    },
    {
      id: 7,
      numeroFrasco: 7,
      volumen: 170,
      fechaPasteurizacion: '2024-11-23',
      ciclo: 2,
      lote: 2
    },
    {
      id: 8,
      numeroFrasco: 8,
      volumen: 190,
      fechaPasteurizacion: '2024-11-23',
      ciclo: 2,
      lote: 2
    }
  ];

  // Datos mock de controles microbiológicos existentes
  private controlesMock: ControlMicrobiologicoLiberacionData[] = [
    {
      id: 1,
      numero_frasco_pasteurizado: 'LHP 24 1',
      id_frasco_pasteurizado: 1,
      coliformes_totales: 0,
      conformidad: 1,
      prueba_confirmatoria: null,
      liberacion_producto: 0,
      fecha_pasteurizacion: new Date('2024-11-20'),
      ciclo: 1,
      lote: 1
    },
    {
      id: 2,
      numero_frasco_pasteurizado: 'LHP 24 2',
      id_frasco_pasteurizado: 2,
      coliformes_totales: 1,
      conformidad: 0,
      prueba_confirmatoria: null,
      liberacion_producto: 0,
      fecha_pasteurizacion: new Date('2024-11-20'),
      ciclo: 1,
      lote: 1
    }
  ];

  // Datos mock de empleados
  private empleadosMock: EmpleadoOption[] = [
    { id: 1, nombre: 'Dr. Ana García Martínez', cargo: 'Médico Pediatra' },
    { id: 2, nombre: 'Dra. Carmen López Silva', cargo: 'Coordinador Médico' },
    { id: 3, nombre: 'María José Rodríguez', cargo: 'Bacteriólogo' },
    { id: 4, nombre: 'Luis Fernando Torres', cargo: 'Tecnólogo en Alimentos' },
    { id: 5, nombre: 'Dr. Roberto Mendoza', cargo: 'Médico Neonatólogo' },
    { id: 6, nombre: 'Patricia Suárez Vega', cargo: 'Microbióloga' },
    { id: 7, nombre: 'Carlos Alberto Ruiz', cargo: 'Auxiliar de Laboratorio' },
    { id: 8, nombre: 'Dra. Sandra Morales', cargo: 'Coordinador Médico' }
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

  getEmpleados(): Observable<EmpleadoOption[]> {
    return of([...this.empleadosMock]).pipe(delay(400));
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
