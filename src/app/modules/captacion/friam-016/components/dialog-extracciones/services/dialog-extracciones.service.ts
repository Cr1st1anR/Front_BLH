import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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

  // ✅ CORREGIDO: URL completa correcta
  getExtracciones(idExtraccion: number): Observable<ExtraccionTable[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getFrascosRecolectadosBySalaExtraccion/${idExtraccion}`,
      { observe: 'response' } // ✅ Observar la respuesta completa
    ).pipe(
      map(response => {
        // ✅ Verificar el status de la respuesta
        if (response.status === 204 || !response.body || !response.body.data) {
          return []; // No hay datos, devolver array vacío
        }

        if (response.body.data.length === 0) {
          return [];
        }

        const extracciones = response.body.data;
        return this.transformApiDataToTableFormat(extracciones);
      }),
      catchError((error: HttpErrorResponse) => {
        // ✅ Manejar errores HTTP
        if (error.status === 204) {
          return of([]); // Devolver array vacío para 204
        }
        // Para otros errores, reenviar el error
        throw error;
      })
    );
  }

  // ✅ CORREGIDO: Transformar datos de la API al formato de la tabla
  private transformApiDataToTableFormat(apiData: any[]): ExtraccionTable[] {
    // Agrupar extracciones por fecha
    const extraccionesPorFecha = new Map<string, ExtraccionTable>();

    apiData.forEach(extraccion => {
      const fecha = extraccion.fechaExtraccion;
      const hora = extraccion.hora;

      // Determinar si es AM o PM basado en la hora (antes de 12:00 es AM)
      const [horas] = hora.split(':').map(Number);
      const esAM = horas < 12;

      let extraccionTabla = extraccionesPorFecha.get(fecha);

      if (!extraccionTabla) {
        // Crear nueva fila de extracción
        extraccionTabla = {
          id_registro_extraccion: extraccion.id,
          fecha: fecha,
          fecha_display: this.formatDateForDisplay(fecha),
          extraccion_1: { am: null, ml: null },
          extraccion_2: { pm: null, ml: null },
          motivo_consulta: extraccion.motivoConsulta || '',
          observaciones: extraccion.observaciones || ''
        };
        extraccionesPorFecha.set(fecha, extraccionTabla);
      }

      // Asignar a AM o PM según la hora
      if (esAM) {
        extraccionTabla.extraccion_1.am = hora;
        extraccionTabla.extraccion_1.ml = extraccion.cantidad;
      } else {
        extraccionTabla.extraccion_2.pm = hora;
        extraccionTabla.extraccion_2.ml = extraccion.cantidad;
      }

      // Actualizar motivo y observaciones si están disponibles
      if (extraccion.motivoConsulta) {
        extraccionTabla.motivo_consulta = extraccion.motivoConsulta;
      }
      if (extraccion.observaciones) {
        extraccionTabla.observaciones = extraccion.observaciones;
      }
    });

    // ✅ CORREGIDO: Ordenar por fecha (más antigua primero)
    return Array.from(extraccionesPorFecha.values())
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  // ✅ CORREGIDO: Método para formatear fecha sin problemas de zona horaria
  private formatDateForDisplay(fechaString: string): string {
    if (!fechaString) return 'Sin fecha';

    // ✅ Parsear la fecha como local, no como UTC
    const [year, month, day] = fechaString.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // mes - 1 porque Date usa 0-based months

    const dayFormatted = fecha.getDate().toString().padStart(2, '0');
    const monthFormatted = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const yearFormatted = fecha.getFullYear();

    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  }

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

    const cantidad = isAM ? rowData.extraccion_1.ml! : rowData.extraccion_2.ml!;
    const hora = isAM ? rowData.extraccion_1.am! : rowData.extraccion_2.pm!;

    return {
      cantidad: cantidad,
      hora: hora,
      gaveta: 1,
      fechaExtraccion: rowData.fecha,
      congelador: { id: 1 },
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
}
