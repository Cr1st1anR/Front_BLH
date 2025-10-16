import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogExtraccionesService {

  constructor() { }

  /**
   * Obtener extracciones por ID de extracción de leche (datos hardcodeados)
   * TODO: Conectar con backend cuando esté listo
   */
  getExtracciones(idExtraccion: number) {
    // Simulamos datos hardcodeados para las extracciones
    const mockExtracciones = [
      {
        id_registro_extraccion: 1,
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
        id_registro_extraccion: 2,
        fecha: '2025-10-14',
        fecha_display: '14/10/2025',
        extraccion_1: {
          am: '09:15',
          ml: 110
        },
        extraccion_2: {
          pm: '15:30',
          ml: 85
        },
        motivo_consulta: 'Dificultad en la lactancia',
        observaciones: 'Se brindó orientación sobre técnicas de extracción'
      },
      {
        id_registro_extraccion: 3,
        fecha: '2025-10-12',
        fecha_display: '12/10/2025',
        extraccion_1: {
          am: '10:00',
          ml: 140
        },
        extraccion_2: {
          pm: '16:00',
          ml: 100
        },
        motivo_consulta: 'Seguimiento donación',
        observaciones: 'Volumen adecuado, continuar con el programa'
      }
    ];

    // Simular delay de red
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockExtracciones);
      }, 600);
    });
  }

  /**
   * Crear nueva extracción
   * TODO: Implementar llamada al backend
   */
  crearExtraccion(idExtraccion: number, fecha: string | null) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id_registro_extraccion: Date.now(),
          fecha: null, // ✅ CAMBIO: No establecer fecha automáticamente
          fecha_display: 'Sin fecha', // ✅ CAMBIO: Texto indicativo
          extraccion_1: {
            am: null,
            ml: null
          },
          extraccion_2: {
            pm: null,
            ml: null
          },
          motivo_consulta: '',
          observaciones: '',
          isNew: true
        });
      }, 500);
    });
  }

  /**
   * Actualizar extracción existente
   * TODO: Implementar llamada al backend
   */
  actualizarExtraccion(idRegistro: number, data: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...data, isNew: false });
      }, 500);
    });
  }

  /**
   * Formatear fecha para mostrar
   */
  private formatearFecha(fecha: string): string {
    if (fecha.includes('-')) {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }
    return fecha;
  }
}
