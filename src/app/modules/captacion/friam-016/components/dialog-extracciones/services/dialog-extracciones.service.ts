import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ExtraccionRequest } from '../../interfaces/extraccion-request.interface';
import { ExtraccionTable } from '../../interfaces/extraccion-table.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DialogExtraccionesService {

  // Subject para manejar actualizaciones de datos
  private dataUpdated = new BehaviorSubject<boolean>(false);
  public dataUpdated$ = this.dataUpdated.asObservable();

  constructor(private http: HttpClient) { }

  // Método para crear una nueva extracción
  createExtraccion(extraccionData: ExtraccionRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.ApiBLH}/postFrascosExtraccion`, extraccionData)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  // Método para crear múltiples extracciones (AM y PM)
  createMultipleExtracciones(extracciones: ExtraccionRequest[]): Observable<any[]> {
    const requests = extracciones.map(extraccion => this.createExtraccion(extraccion));
    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(results => {
          observer.next(results);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  // Método temporal para obtener extracciones (con datos mock hasta que esté la API)
  getExtracciones(idExtraccion: number): Promise<ExtraccionTable[]> {
    const mockExtracciones = this.getMockExtracciones();
    const extraccionesDeEstaMadre = mockExtracciones[idExtraccion] || [];

    return new Promise(resolve => {
      setTimeout(() => resolve(extraccionesDeEstaMadre), 800);
    });
  }

  // Método temporal para crear extracción (estructura inicial)
  crearExtraccion(idExtraccion: number, fecha: string | null): Promise<ExtraccionTable> {
    const nuevaExtraccion: ExtraccionTable = {
      id_registro_extraccion: Date.now(),
      fecha: fecha || '',
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

  // Método para preparar datos de extracción para la API
  prepareExtraccionData(
    rowData: ExtraccionTable,
    idLecheSalaExtraccion: number,
    tipoExtraccion: 'AM' | 'PM'
  ): ExtraccionRequest {
    const isAM = tipoExtraccion === 'AM';

    // Acceder a las propiedades correctas según el tipo de extracción
    const cantidad = isAM ? rowData.extraccion_1.ml! : rowData.extraccion_2.ml!;
    const hora = isAM ? rowData.extraccion_1.am! : rowData.extraccion_2.pm!;

    return {
      cantidad: cantidad,
      hora: hora,
      gaveta: 1, // Valor fijo
      fechaExtraccion: rowData.fecha,
      congelador: { id: 1 }, // Valor fijo
      lecheSalaExtraccion: { id: idLecheSalaExtraccion },
      motivoConsulta: rowData.motivo_consulta || '',
      observaciones: rowData.observaciones || ''
    };
  }

  // Método para guardar extracciones (maneja 1 o 2 extracciones)
  guardarExtracciones(rowData: ExtraccionTable, idLecheSalaExtraccion: number): Observable<any> {
    const extracciones: ExtraccionRequest[] = [];

    // Verificar si hay datos para extracción AM (extraccion_1)
    if (rowData.extraccion_1.am && rowData.extraccion_1.ml) {
      extracciones.push(this.prepareExtraccionData(rowData, idLecheSalaExtraccion, 'AM'));
    }

    // Verificar si hay datos para extracción PM (extraccion_2)
    if (rowData.extraccion_2.pm && rowData.extraccion_2.ml) {
      extracciones.push(this.prepareExtraccionData(rowData, idLecheSalaExtraccion, 'PM'));
    }

    if (extracciones.length === 0) {
      throw new Error('No hay extracciones válidas para guardar');
    }

    // Si solo hay una extracción, usar el método simple
    if (extracciones.length === 1) {
      return this.createExtraccion(extracciones[0]);
    }

    // Si hay dos extracciones, usar el método múltiple
    return this.createMultipleExtracciones(extracciones);
  }

  // Método para notificar actualizaciones de datos
  private notifyDataUpdate(): void {
    this.dataUpdated.next(true);
  }

  // Método para resetear el estado de actualización
  resetUpdateStatus(): void {
    this.dataUpdated.next(false);
  }

  // Datos mock temporales (mantener hasta que esté la API de GET)
  private getMockExtracciones(): { [idExtraccion: number]: ExtraccionTable[] } {
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
        }
      ],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    };
  }
}
