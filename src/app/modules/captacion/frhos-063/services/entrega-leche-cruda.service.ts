import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntregaLecheCrudaService {

  constructor() { }

  getEntregaLecheCrudaData() {
    return [
      {
        fecha: '2024-06-01',
        nombre_madre: 'María Pérez',
        volumen_leche_materna_am: '500ml',
        volumen_leche_materna_pm: '600ml',
        perdidas: 50,
        responsable: 'Juan López'
      },
      {
        fecha: '2024-06-01',
        nombre_madre: 'María Pérez',
        volumen_leche_materna_am: '500ml',
        volumen_leche_materna_pm: '600ml',
        perdidas: 50,
        responsable: 'Juan López'
      },
      {
        fecha: '2024-06-01',
        nombre_madre: 'María Pérez',
        volumen_leche_materna_am: '500ml',
        volumen_leche_materna_pm: '600ml',
        perdidas: 50,
        responsable: 'Juan López'
      },
      {
        fecha: '2024-06-01',
        nombre_madre: 'María Pérez',
        volumen_leche_materna_am: '500ml',
        volumen_leche_materna_pm: '600ml',
        perdidas: 50,
        responsable: 'Juan López'
      },
    ];
  }

}
