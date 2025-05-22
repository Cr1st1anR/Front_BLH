import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistroDonanteService {
  constructor(private http: HttpClient) {}

  getDataRegistroDonante() {
    return [
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
    ];
  }
}
