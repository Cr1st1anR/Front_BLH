import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VisitaDomiciliariaService {
  constructor(private http: HttpClient) {}

  getDataVisitaDomiciliaria() {
    return [
      {
        id: 1,
        fecha_visita: '01/05/2025',
        nombre: 'Sofia',
        apellido: 'Mejia',
        documento: 889451200,
        edad: 25,
        direccion: 'Calle 123 #45-67',
        celular: 3001234567,
        municipio: 'Barbacoas',
        encuesta_realizada: 'Si',
      },
      {
        id: 2,
        fecha_visita: '01/06/2025',
        nombre: 'Paula',
        apellido: 'Morales',
        documento: 1139879559,
        edad: 22,
        direccion: 'Calle 456 #78-90',
        celular: 3009876543,
        municipio: 'Samaniego',
        encuesta_realizada: 'No',
      },
    ];
  }
}
