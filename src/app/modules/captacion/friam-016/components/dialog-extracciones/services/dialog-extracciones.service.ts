import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogExtraccionesService {

  constructor() { }

  getExtracciones(idExtraccion: number) {
    const mockExtracciones = this.getMockExtracciones();
    const extraccionesDeEstaMadre = mockExtracciones[idExtraccion] || [];
    
    return new Promise(resolve => {
      setTimeout(() => resolve(extraccionesDeEstaMadre), 800);
    });
  }

  private getMockExtracciones(): { [idExtraccion: number]: any[] } {
    return {
      1: [
        {
          id_registro_extraccion: 101,
          fecha: '2025-10-15',
          fecha_display: '15/10/2025',
          extraccion_1: {
            am: '08:30',
            ml: 120
          },
          extraccion_2: {
            pm: '14:45',
            ml: 95
          },
          motivo_consulta: 'Control rutinario postparto',
          observaciones: 'Madre presenta buena técnica de extracción'
        },
        {
          id_registro_extraccion: 102,
          fecha: '2025-10-12',
          fecha_display: '12/10/2025',
          extraccion_1: {
            am: '09:00',
            ml: 130
          },
          extraccion_2: {
            pm: '15:00',
            ml: 100
          },
          motivo_consulta: 'Seguimiento semanal',
          observaciones: 'Incremento en volumen de leche'
        },
        {
          id_registro_extraccion: 103,
          fecha: '2025-10-10',
          fecha_display: '10/10/2025',
          extraccion_1: {
            am: '08:45',
            ml: 110
          },
          extraccion_2: {
            pm: '14:30',
            ml: 90
          },
          motivo_consulta: 'Control inicial',
          observaciones: 'Primera extracción exitosa'
        }
      ],

      2: [
        {
          id_registro_extraccion: 201,
          fecha: '2025-10-14',
          fecha_display: '14/10/2025',
          extraccion_1: {
            am: '09:15',
            ml: 85
          },
          extraccion_2: {
            pm: '15:30',
            ml: 70
          },
          motivo_consulta: 'Dificultad en la lactancia',
          observaciones: 'Se brindó orientación sobre técnicas de extracción'
        },
        {
          id_registro_extraccion: 202,
          fecha: '2025-10-11',
          fecha_display: '11/10/2025',
          extraccion_1: {
            am: '10:00',
            ml: 75
          },
          extraccion_2: {
            pm: '16:00',
            ml: 65
          },
          motivo_consulta: 'Consulta inicial',
          observaciones: 'Madre requiere más práctica'
        }
      ],

      3: [
        {
          id_registro_extraccion: 301,
          fecha: '2025-10-13',
          fecha_display: '13/10/2025',
          extraccion_1: {
            am: '07:30',
            ml: 150
          },
          extraccion_2: {
            pm: '13:45',
            ml: 140
          },
          motivo_consulta: 'Donación regular',
          observaciones: 'Excelente productora, volumen muy bueno'
        },
        {
          id_registro_extraccion: 302,
          fecha: '2025-10-09',
          fecha_display: '09/10/2025',
          extraccion_1: {
            am: '07:45',
            ml: 145
          },
          extraccion_2: {
            pm: '14:00',
            ml: 135
          },
          motivo_consulta: 'Seguimiento donación',
          observaciones: 'Mantiene buen volumen de producción'
        },
        {
          id_registro_extraccion: 303,
          fecha: '2025-10-05',
          fecha_display: '05/10/2025',
          extraccion_1: {
            am: '08:00',
            ml: 140
          },
          extraccion_2: {
            pm: '14:15',
            ml: 130
          },
          motivo_consulta: 'Control semanal',
          observaciones: 'Técnica de extracción perfecta'
        }
      ],

      4: [
        {
          id_registro_extraccion: 401,
          fecha: '2025-10-11',
          fecha_display: '11/10/2025',
          extraccion_1: {
            am: '09:30',
            ml: 95
          },
          extraccion_2: {
            pm: '15:45',
            ml: 80
          },
          motivo_consulta: 'Primera visita',
          observaciones: 'Madre nerviosa, necesita más confianza'
        }
      ],

      5: [
        {
          id_registro_extraccion: 501,
          fecha: '2025-10-10',
          fecha_display: '10/10/2025',
          extraccion_1: {
            am: '08:15',
            ml: 105
          },
          extraccion_2: {
            pm: '14:45',
            ml: 88
          },
          motivo_consulta: 'Control prenatal',
          observaciones: 'Buena técnica, madre experimentada'
        },
        {
          id_registro_extraccion: 502,
          fecha: '2025-10-07',
          fecha_display: '07/10/2025',
          extraccion_1: {
            am: '08:30',
            ml: 100
          },
          extraccion_2: {
            pm: '15:00',
            ml: 85
          },
          motivo_consulta: 'Seguimiento',
          observaciones: 'Mantiene buen ritmo de extracción'
        }
      ],
      6: [], 
      7: [], 
      8: []  
    };
  }

  crearExtraccion(idExtraccion: number, fecha: string | null) {
    const nuevaExtraccion = {
      id_registro_extraccion: Date.now(),
      id_extraccion: idExtraccion,
      fecha: fecha,
      fecha_display: 'Sin fecha',
      extraccion_1: { am: null, ml: null },
      extraccion_2: { pm: null, ml: null },
      motivo_consulta: '',
      observaciones: '',
      isNew: true
    };

    return new Promise(resolve => {
      setTimeout(() => resolve(nuevaExtraccion), 500);
    });
  }

  actualizarExtraccion(idRegistro: number, data: any) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
}