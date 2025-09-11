import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrimaryDialogSeguimientoService {
  constructor() {}

  getTableVistaData(idSeguimiento?: number) {
    const allVisitas = [
      {
        id_seguimiento: 1,
        id_visita: 1,
        no_visita: '1',
        fecha_visita: '16/07/2025',
      },
      {
        id_seguimiento: 2,
        id_visita: 2,
        no_visita: '1',
        fecha_visita: '16/07/2025',
      },
      {
        id_seguimiento: 2,
        id_visita: 3,
        no_visita: '2',
        fecha_visita: '16/07/2025',
      },
    ];
    if (idSeguimiento) {
      return allVisitas.filter(
        (visita) => visita.id_seguimiento === idSeguimiento
      );
    }
    return allVisitas;
  }
}
