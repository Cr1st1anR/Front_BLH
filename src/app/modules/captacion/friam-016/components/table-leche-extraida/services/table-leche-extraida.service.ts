import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableLecheExtraidaService {

  constructor() { }

  getTableLecheExtraidaData() {
    return [
      {
        id_extraccion: 1,
        fecha_registro: '14/10/2025',
        apellidos_nombre: 'Camila Sofia Arias Toro',
        edad: '27',
        identificacion: '27147852',
        municipio: 'Pasto',
        telefono: '3104478896',
        eps: 'Sanitas',
        procedencia: '255',
        consejeria: {
          individual: null,
          grupal: null
        }
      },
      {
        id_extraccion: 2,
        fecha_registro: '14/10/2025',
        apellidos_nombre: 'Camila Sofia Arias Toro',
        edad: '27',
        identificacion: '27147852',
        municipio: 'Pasto',
        telefono: '3104478896',
        eps: 'Sanitas',
        procedencia: '255',
        consejeria: {
          individual: null,
          grupal: null
        }
      },
      {
        id_extraccion: 3,
        fecha_registro: '14/10/2025',
        apellidos_nombre: 'Camila Sofia Arias Toro',
        edad: '27',
        identificacion: '27147852',
        municipio: 'Pasto',
        telefono: '3104478896',
        eps: 'Sanitas',
        procedencia: '255',
        consejeria: {
          individual: null,
          grupal: null
        }
      },
      {
        id_extraccion: 4,
        fecha_registro: '14/10/2025',
        apellidos_nombre: 'Camila Sofia Arias Toro',
        edad: '27',
        identificacion: '27147852',
        municipio: 'Pasto',
        telefono: '3104478896',
        eps: 'Sanitas',
        procedencia: '255',
        consejeria: {
          individual: null,
          grupal: null
        }
      },
    ];
  }
}
