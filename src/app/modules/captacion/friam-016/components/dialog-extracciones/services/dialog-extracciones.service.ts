import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { ExtraccionRequest } from '../../interfaces/extraccion-request.interface';
import { ExtraccionTable } from '../../interfaces/extraccion-table.interface';
import { environment } from 'src/environments/environments';
import { LecheExtraidaTable } from '../../interfaces/leche-extraida-table.interface';

@Injectable({
  providedIn: 'root'
})
export class DialogExtraccionesService {

  private readonly dataUpdated = new BehaviorSubject<boolean>(false);
  public readonly dataUpdated$ = this.dataUpdated.asObservable();

  constructor(private readonly http: HttpClient) { }

  getExtracciones(idExtraccion: number): Observable<ExtraccionTable[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${environment.ApiBLH}/getFrascosRecolectadosBySalaExtraccion/${idExtraccion}`,
      { observe: 'response' }
    ).pipe(
      map(response => this.processExtraccionesResponse(response)),
      catchError((error: HttpErrorResponse) => this.handleExtraccionesError(error))
    );
  }

  putExtracciones(idExtraccion: number, body: ExtraccionTable): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.ApiBLH}/putFrascosExtraccion/${idExtraccion}`,
      body
    )
  }

  createExtraccion(extraccionData: ExtraccionRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.ApiBLH}/postFrascosExtraccion`, extraccionData)
      .pipe(
        map(response => {
          this.notifyDataUpdate();
          return response.data;
        })
      );
  }

  /**
   * Procesa la respuesta de extracciones del servidor
   */
  private processExtraccionesResponse(response: any): ExtraccionTable[] {
    if (response.status === 204 || !response.body?.data || response.body.data.length === 0) {
      return [];
    }
    return this.transformApiDataToTableFormat(response.body.data);
  }

  /**
   * Maneja errores específicos al obtener extracciones
   */
  private handleExtraccionesError(error: HttpErrorResponse): Observable<ExtraccionTable[]> {
    if (error.status === 204) {
      return of([]);
    }
    throw error;
  }

  /**
   * Transforma los datos de la API al formato requerido por la tabla
   */
  private transformApiDataToTableFormat(apiData: any[]): ExtraccionTable[] {
    const extraccionesPorFecha = new Map<string, ExtraccionTable>();

    apiData.forEach(extraccion => {
      this.processExtraccionItem(extraccion, extraccionesPorFecha);
    });

    return this.sortExtraccionesByDate(extraccionesPorFecha);
  }

  /**
   * Procesa un item individual de extracción de la API
   */
  private processExtraccionItem(extraccion: any, extraccionesPorFecha: Map<string, ExtraccionTable>): void {
    const fecha = extraccion.fechaExtraccion;
    const hora = extraccion.hora;
    const esAM = this.isAMTime(hora);

    let extraccionTabla = extraccionesPorFecha.get(fecha);

    if (!extraccionTabla) {
      extraccionTabla = this.createNewExtraccionRow(extraccion, fecha);
      extraccionesPorFecha.set(fecha, extraccionTabla);
    }

    this.assignExtraccionData(extraccionTabla, extraccion, esAM);
    this.updateExtraccionMetadata(extraccionTabla, extraccion);
  }

  /**
   * Determina si una hora corresponde al período AM
   */
  private isAMTime(hora: string): boolean {
    const [horas] = hora.split(':').map(Number);
    return horas < 12;
  }

  /**
   * Crea una nueva fila de extracción
   */
  private createNewExtraccionRow(extraccion: any, fecha: string): ExtraccionTable {
    return {
      id_registro_extraccion: extraccion.id,
      fecha,
      fecha_display: this.formatDateForDisplay(fecha),
      extraccion_1: {am: null, ml: null },
      extraccion_2: {pm: null, ml: null },
      motivo_consulta: extraccion.motivoConsulta || '',
      observaciones: extraccion.observaciones || ''
    };
  }

  /**
   * Asigna los datos de extracción a AM o PM según corresponda
   */
  private assignExtraccionData(extraccionTabla: ExtraccionTable, extraccion: any, esAM: boolean): void {
    if (esAM) {
      extraccionTabla.extraccion_1.id = extraccion.id;
      extraccionTabla.extraccion_1.am = extraccion.hora;
      extraccionTabla.extraccion_1.ml = extraccion.cantidad;
    } else {
      extraccionTabla.extraccion_2.id = extraccion.id;
      extraccionTabla.extraccion_2.pm = extraccion.hora;
      extraccionTabla.extraccion_2.ml = extraccion.cantidad;
    }
  }

  /**
   * Actualiza metadatos de la extracción si están disponibles
   */
  private updateExtraccionMetadata(extraccionTabla: ExtraccionTable, extraccion: any): void {
    if (extraccion.motivoConsulta) {
      extraccionTabla.motivo_consulta = extraccion.motivoConsulta;
    }
    if (extraccion.observaciones) {
      extraccionTabla.observaciones = extraccion.observaciones;
    }
  }

  /**
   * Ordena las extracciones por fecha (más antigua primero)
   */
  private sortExtraccionesByDate(extraccionesPorFecha: Map<string, ExtraccionTable>): ExtraccionTable[] {
    return Array.from(extraccionesPorFecha.values())
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  /**
   * Formatea una fecha para mostrar en la tabla evitando problemas de zona horaria
   */
  private formatDateForDisplay(fechaString: string): string {
    if (!fechaString) return 'Sin fecha';

    const [year, month, day] = fechaString.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);

    return [
      fecha.getDate().toString().padStart(2, '0'),
      (fecha.getMonth() + 1).toString().padStart(2, '0'),
      fecha.getFullYear()
    ].join('/');
  }

  /**
   * Crea múltiples extracciones (AM y PM) en el servidor
   */
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

  /**
   * Crea una estructura temporal de extracción para edición
   */
  crearExtraccion(idExtraccion:LecheExtraidaTable , fecha: string | null): Promise<ExtraccionTable> {
    const nuevaExtraccion: ExtraccionTable = {
      id_registro_extraccion: Date.now(),
      fecha: fecha || '',
      fecha_display: 'Sin fecha',
      extraccion_1: { am: null, ml: null },
      extraccion_2: { pm: null, ml: null },
      motivo_consulta: '',
      observaciones: '',
      isNew: true,
      procedencia: idExtraccion.procedencia,
      madrePotencial: idExtraccion.madrePotencial ?? undefined
    };

    return new Promise(resolve => {
      setTimeout(() => resolve(nuevaExtraccion), 500);
    });
  }

  /**
   * Prepara los datos de extracción para enviar a la API
   */
  prepareExtraccionData(
    rowData: ExtraccionTable,
    idLecheSalaExtraccion: number,
    tipoExtraccion: 'AM' | 'PM'
  ): ExtraccionRequest {
    const isAM = tipoExtraccion === 'AM';

    const cantidad = isAM ? rowData.extraccion_1.ml! : rowData.extraccion_2.ml!;
    const hora = isAM ? rowData.extraccion_1.am! : rowData.extraccion_2.pm!;
    return {
      cantidad,
      hora,
      gaveta: 1,
      fechaExtraccion: rowData.fecha,
      congelador: { id: 1 },
      lecheSalaExtraccion: { id: idLecheSalaExtraccion },
      motivoConsulta: rowData.motivo_consulta || '',
      observaciones: rowData.observaciones || '',
      procedencia: rowData.procedencia,
      madrePotencial: rowData.madrePotencial
    };
  }

  /**
   * Detecta si es una extracción faltante o actualización real
   */
  public isExtraccionFaltante(rowData: ExtraccionTable, datosOriginales: ExtraccionTable): boolean {
    const originalState = this.getExtraccionState(datosOriginales);
    const currentState = this.getExtraccionState(rowData);

    return this.isNewExtraccionAdded(originalState, currentState);
  }

  /**
   * Obtiene el estado de las extracciones (qué tiene AM/PM)
   */
  private getExtraccionState(data: ExtraccionTable): { hasAM: boolean; hasPM: boolean } {
    return {
      hasAM: !!(data.extraccion_1?.am && data.extraccion_1?.ml),
      hasPM: !!(data.extraccion_2?.pm && data.extraccion_2?.ml)
    };
  }

  /**
   * Determina si se agregó una nueva extracción comparando estados
   */
  private isNewExtraccionAdded(original: { hasAM: boolean; hasPM: boolean }, current: { hasAM: boolean; hasPM: boolean }): boolean {
    return (!original.hasAM && current.hasAM) || (!original.hasPM && current.hasPM);
  }

  /**
   * Determina qué tipo de extracción es la nueva (faltante)
   */
  private determinarExtraccionFaltante(rowData: ExtraccionTable, datosOriginales: ExtraccionTable): 'AM' | 'PM' | null {
    const originalState = this.getExtraccionState(datosOriginales);
    const currentState = this.getExtraccionState(rowData);

    // Si no tenía AM y ahora lo tiene
    if (!originalState.hasAM && currentState.hasAM) {
      return 'AM';
    }

    // Si no tenía PM y ahora lo tiene
    if (!originalState.hasPM && currentState.hasPM) {
      return 'PM';
    }

    return null;
  }

  /**
   * Guarda una extracción faltante específica
   */
  guardarExtraccionFaltante(rowData: ExtraccionTable, datosOriginales: ExtraccionTable, idLecheSalaExtraccion: number): Observable<any> {
    const tipoFaltante = this.determinarExtraccionFaltante(rowData, datosOriginales);

    if (!tipoFaltante) {
      throw new Error('No se pudo determinar el tipo de extracción faltante');
    }

    const extraccionFaltante = this.prepareExtraccionData(rowData, idLecheSalaExtraccion, tipoFaltante);
    return this.createExtraccion(extraccionFaltante);
  }

  /**
   * Método principal para manejar el guardado inteligente de extracciones
   */
  guardarExtracciones(rowData: ExtraccionTable, idLecheSalaExtraccion: number, datosOriginales?: ExtraccionTable): Observable<any> {
    if (datosOriginales && this.isExtraccionFaltante(rowData, datosOriginales)) {
      return this.guardarExtraccionFaltante(rowData, datosOriginales, idLecheSalaExtraccion);
    }

    return this.guardarExtraccionesNormales(rowData, idLecheSalaExtraccion);
  }

  /**
   * Guarda extracciones normales (nueva fila completa)
   */
  private guardarExtraccionesNormales(rowData: ExtraccionTable, idLecheSalaExtraccion: number): Observable<any> {
    const extracciones = this.prepararExtraccionesParaGuardar(rowData, idLecheSalaExtraccion);

    if (extracciones.length === 0) {
      throw new Error('No hay extracciones válidas para guardar');
    }

    return extracciones.length === 1
      ? this.createExtraccion(extracciones[0])
      : this.createMultipleExtracciones(extracciones);
  }

  /**
   * Prepara las extracciones válidas para guardar
   */
  private prepararExtraccionesParaGuardar(rowData: ExtraccionTable, idLecheSalaExtraccion: number): ExtraccionRequest[] {
    const extracciones: ExtraccionRequest[] = [];

    if (rowData.extraccion_1.am && rowData.extraccion_1.ml) {
      extracciones.push(this.prepareExtraccionData(rowData, idLecheSalaExtraccion, 'AM'));
    }

    if (rowData.extraccion_2.pm && rowData.extraccion_2.ml) {
      extracciones.push(this.prepareExtraccionData(rowData, idLecheSalaExtraccion, 'PM'));
    }

    return extracciones;
  }

  /**
   * Notifica que los datos han sido actualizados
   */
  private notifyDataUpdate(): void {
    this.dataUpdated.next(true);
  }

  /**
   * Reinicia el estado de actualización de datos
   */
  resetUpdateStatus(): void {
    this.dataUpdated.next(false);
  }


}
