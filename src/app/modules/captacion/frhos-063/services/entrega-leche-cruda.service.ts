import { Injectable } from '@angular/core';

import type { EntregaLecheCrudaData } from '../interfaces/entrega-leche-cruda.interface';

@Injectable({
  providedIn: 'root'
})
export class EntregaLecheCrudaService {

  constructor() { }

  getEntregaLecheCrudaData(): EntregaLecheCrudaData[] {
    return [
      {
        fecha: '2024-06-01',
        nombre_madre: 'María Pérez González',
        volumen_leche_materna_am: '500',
        volumen_leche_materna_pm: '600',
        perdidas: 50,
        responsable: 'Juan López'
      },
      {
        fecha: '2024-06-02',
        nombre_madre: 'Ana García Rodríguez',
        volumen_leche_materna_am: '450',
        volumen_leche_materna_pm: '550',
        perdidas: 25,
        responsable: 'María Fernández'
      },
      {
        fecha: '2024-06-03',
        nombre_madre: 'Carmen Martínez López',
        volumen_leche_materna_am: '600',
        volumen_leche_materna_pm: '700',
        perdidas: 75,
        responsable: 'Juan López'
      },
      {
        fecha: '2024-06-04',
        nombre_madre: 'Lucía Hernández Silva',
        volumen_leche_materna_am: '400',
        volumen_leche_materna_pm: '500',
        perdidas: 30,
        responsable: 'Pedro Sánchez'
      },
      {
        fecha: '2024-06-05',
        nombre_madre: 'Isabel Ruiz Castro',
        volumen_leche_materna_am: '550',
        volumen_leche_materna_pm: '650',
        perdidas: 40,
        responsable: 'María Fernández'
      }
    ];
  }

}
