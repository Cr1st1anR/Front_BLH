import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TableMadresSeguimientoService {
  constructor() {}

  getTableMadresSeguimientoData() {
    return [
      {
        id_seguimiento: 1,
        codigo_donante: '12345',
        nombres: 'Camila Sofia',
        apellidos: 'Arias Toro',
        donante: 'Interna',
        fecha_visita: '16/07/2025',
      },
      {
        id_seguimiento: 2,
        codigo_donante: '67890',
        nombres: 'María José',
        apellidos: 'González López',
        donante: 'Externa',
        fecha_visita: '15/07/2025',
      },
      {
        id_seguimiento: 3,
        codigo_donante: '11111',
        nombres: 'Ana Lucía',
        apellidos: 'Villareal Rodríguez',
        donante: 'Interna',
        fecha_visita: '14/07/2025',
      },
    ];
  }
}
