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
        edad: 27,
        identificacion: '27147852',
        municipio: 'Pasto',
        telefono: '3104478896',
        eps: 'Sanitas',
        procedencia: '255',
        consejeria: {
          individual: 1,
          grupal: null
        }
      },
      {
        id_extraccion: 2,
        fecha_registro: '13/10/2025',
        apellidos_nombre: 'María José González López',
        edad: 24,
        identificacion: '31245689',
        municipio: 'Ipiales',
        telefono: '3205647891',
        eps: 'Compensar',
        procedencia: '123',
        consejeria: {
          individual: null,
          grupal: 1
        }
      },
      {
        id_extraccion: 3,
        fecha_registro: '12/10/2025',
        apellidos_nombre: 'Ana Lucía Rodríguez Martín',
        edad: 29,
        identificacion: '45789632',
        municipio: 'Tumaco',
        telefono: '3156789234',
        eps: 'Nueva EPS',
        procedencia: '456',
        consejeria: {
          individual: 1,
          grupal: 1
        }
      },
      {
        id_extraccion: 4,
        fecha_registro: '11/10/2025',
        apellidos_nombre: 'Sofía Alejandra Pérez Castro',
        edad: 26,
        identificacion: '28956741',
        municipio: 'Pasto',
        telefono: '3117894523',
        eps: 'Sura',
        procedencia: '789',
        consejeria: {
          individual: null,
          grupal: null
        }
      },
      {
        id_extraccion: 5,
        fecha_registro: '10/10/2025',
        apellidos_nombre: 'Carolina Isabel Moreno Díaz',
        edad: 31,
        identificacion: '39874562',
        municipio: 'Ipiales',
        telefono: '3208765432',
        eps: 'Medimás',
        procedencia: '321',
        consejeria: {
          individual: 1,
          grupal: null
        }
      },
      {
        id_extraccion: 6,
        fecha_registro: '25/09/2025',
        apellidos_nombre: 'Valentina Herrera Castillo',
        edad: 28,
        identificacion: '33456789',
        municipio: 'Pasto',
        telefono: '3145678901',
        eps: 'Famisanar',
        procedencia: '888',
        consejeria: {
          individual: 1,
          grupal: null
        }
      },
      {
        id_extraccion: 7,
        fecha_registro: '20/09/2025',
        apellidos_nombre: 'Paola Andrea López García',
        edad: 30,
        identificacion: '41234567',
        municipio: 'Ipiales',
        telefono: '3176543210',
        eps: 'Coomeva',
        procedencia: '999',
        consejeria: {
          individual: null,
          grupal: 1
        }
      },
      {
        id_extraccion: 8,
        fecha_registro: '05/11/2025',
        apellidos_nombre: 'Diana Carolina Ruiz Morales',
        edad: 25,
        identificacion: '50123456',
        municipio: 'Tumaco',
        telefono: '3198765432',
        eps: 'Salud Total',
        procedencia: '777',
        consejeria: {
          individual: 1,
          grupal: 1
        }
      }
    ];
  }
}