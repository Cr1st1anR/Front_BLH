import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import type {
  ResponsableOption,
  BackendResponse,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion
} from '../interfaces/control-temperatura.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlTemperaturaService {

  private readonly empleadosMock: ResponsableOption[] = [
    { label: 'Juan López', value: 'Juan López', id_empleado: 1, cargo: 'Técnico', telefono: 1234567890, correo: 'juan.lopez@example.com' },
    { label: 'María Fernández', value: 'María Fernández', id_empleado: 2, cargo: 'Supervisor', telefono: 9876543210, correo: 'maria.fernandez@example.com' },
    { label: 'Pedro Sánchez', value: 'Pedro Sánchez', id_empleado: 3, cargo: 'Técnico', telefono: 5555555555, correo: 'pedro.sanchez@example.com' },
    { label: 'Ana García', value: 'Ana García', id_empleado: 4, cargo: 'Enfermera', telefono: 4444444444, correo: 'ana.garcia@example.com' }
  ];

  private registrosMock: any[] = [
    {
      id: 1,
      fecha: '2025-11-10',
      lote: 'LT-001',
      ciclo: 'C1',
      horaInicio: '08:00',
      horaFinalizacion: '09:30',
      observaciones: 'Proceso normal',
      empleado: { id: 1, nombre: 'Juan López', cargo: 'Técnico' }
    },
    {
      id: 2,
      fecha: '2025-11-11',
      lote: 'LT-002',
      ciclo: 'C2',
      horaInicio: '10:00',
      horaFinalizacion: '11:30',
      observaciones: 'Sin novedades',
      empleado: { id: 2, nombre: 'María Fernández', cargo: 'Supervisor' }
    },
    {
      id: 3,
      fecha: '2025-11-12',
      lote: 'LT-003',
      ciclo: 'C1',
      horaInicio: '14:00',
      horaFinalizacion: '15:45',
      observaciones: 'Temperatura estable',
      empleado: { id: 3, nombre: 'Pedro Sánchez', cargo: 'Técnico' }
    },
    {
      id: 4,
      fecha: '2025-11-13',
      lote: 'LT-004',
      ciclo: 'C3',
      horaInicio: '09:00',
      horaFinalizacion: '10:30',
      observaciones: '',
      empleado: { id: 1, nombre: 'Juan López', cargo: 'Técnico' }
    }
  ];

  private nextId = 5;

  constructor() { }

  getEmpleados(): Observable<ResponsableOption[]> {
    return of(this.empleadosMock).pipe(delay(500));
  }

  getAllControlTemperatura(): Observable<any[]> {
    return of(this.registrosMock).pipe(delay(800));
  }

  postControlTemperatura(data: DatosBackendParaCreacion): Observable<BackendResponse<any>> {
    const nuevoRegistro = {
      id: this.nextId++,
      fecha: data.fecha,
      lote: data.lote,
      ciclo: data.ciclo,
      horaInicio: data.horaInicio,
      horaFinalizacion: data.horaFinalizacion,
      observaciones: data.observaciones || '',
      empleado: this.empleadosMock.find(emp => emp.id_empleado === data.empleado.id) || this.empleadosMock[0]
    };

    this.registrosMock.push(nuevoRegistro);

    return of({
      data: nuevoRegistro,
      message: 'Registro creado exitosamente'
    }).pipe(delay(600));
  }

  putControlTemperatura(data: DatosBackendParaActualizacion): Observable<BackendResponse<any>> {
    const index = this.registrosMock.findIndex(r => r.id === data.id);

    if (index === -1) {
      return throwError(() => new Error('Registro no encontrado'));
    }

    const empleado = this.empleadosMock.find(emp => emp.id_empleado === data.empleado.id);

    this.registrosMock[index] = {
      ...this.registrosMock[index],
      fecha: data.fecha,
      lote: data.lote,
      ciclo: data.ciclo,
      horaInicio: data.horaInicio,
      horaFinalizacion: data.horaFinalizacion,
      observaciones: data.observaciones || '',
      empleado: empleado || this.registrosMock[index].empleado
    };

    return of({
      data: this.registrosMock[index],
      message: 'Registro actualizado exitosamente'
    }).pipe(delay(600));
  }
}
