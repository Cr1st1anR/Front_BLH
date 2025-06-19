import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistroDonanteService {
  constructor() {}

  getDataRegistroDonante(): Observable<any[]> {
    return of([
      {
        id: 1,
        nombre: 'Daniela',
        apellido: 'Toro',
        documento: 789451234,
        entidad: 'HUDN',
      },
      {
        id: 2,
        nombre: 'Chili',
        apellido: 'Willy',
        documento: 123456789,
        entidad: 'LA ROSA',
      },
    ]).pipe(delay(1000)); // Simula 1 segundo de carga
  }
}
