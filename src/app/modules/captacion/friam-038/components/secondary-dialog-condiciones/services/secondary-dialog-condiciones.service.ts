import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecondaryDialogCondicionesService {

  constructor() { }

  getCondicionesSituacion(): any[] {
    return [
      {
        id: 1,
        descripcion: 'Cuenta con condiciones adecuadas físicas e higiénicas',
        respuesta: null
      },
      {
        id: 2,
        descripcion: 'Cumple con normas de bioseguridad',
        respuesta: null
      },
      {
        id: 3,
        descripcion: 'Realiza la técnica adecuada de extracción manual de leche',
        respuesta: null
      },
      {
        id: 4,
        descripcion: 'Presenta adecuado almacenamiento y rotulación de frascos',
        respuesta: null
      },
      {
        id: 5,
        descripcion: 'Presenta dificultad con el almacenamiento',
        respuesta: null
      }
    ];
  }

  saveCondicionesRespuestas(condiciones: any[]): void {
    // Aquí implementarías la lógica para guardar las respuestas
    console.log('Guardando condiciones:', condiciones);
  }

  getCondicionesById(visitaId: number): any[] {
    // Aquí implementarías la lógica para obtener condiciones guardadas por ID de visita
    return this.getCondicionesSituacion();
  }
}
