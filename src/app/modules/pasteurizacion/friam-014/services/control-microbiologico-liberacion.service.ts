import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  FrascoPasteurizadoData,
  ControlMicrobiologicoLiberacionData,
  BackendResponse,
  EmpleadoOption,
  PayloadControlMicrobiologico
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

  getEmpleados(): Observable<EmpleadoOption[]> {
    return of([...this.empleadosMock]).pipe(delay(400));
  }

  /**
   * Nuevo método para guardar todo el control microbiológico de una vez
   * Incluye los datos del formulario y todos los registros de la tabla
   */
  guardarControlMicrobiologicoCompleto(payload: PayloadControlMicrobiologico): Observable<BackendResponse<any>> {
    console.log('📦 Payload completo recibido en el servicio:', payload);
    console.log('📋 Datos del formulario:', payload.datosFormulario);
    console.log('📊 Registros de control:', payload.registrosControl);
    console.log(`✅ Total de registros: ${payload.registrosControl.length}`);

    // Simulación de guardado exitoso
    return of({
      data: {
        id: Math.floor(Math.random() * 10000),
        datosFormulario: payload.datosFormulario,
        registrosGuardados: payload.registrosControl.length,
        mensaje: 'Control microbiológico guardado exitosamente'
      },
      message: `Se guardaron ${payload.registrosControl.length} registros de control microbiológico`,
      status: 201
    }).pipe(delay(1500));
  }
}
