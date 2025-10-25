import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environments';
import {
  ControlLecheCrudaData,
  EntradasSalidasApiResponse,
  EmpleadoResponse,
  ApiResponse
} from '../interfaces/control-leche-cruda.interface';

@Injectable({
  providedIn: 'root'
})
export class ControlLecheCrudaService {
  private readonly DIAS_VENCIMIENTO = 15;
  private readonly DIAS_POR_MES = 30;
  private empleadosCache: EmpleadoResponse[] = [];

  constructor(private http: HttpClient) { }

  getEntradasSalidasLecheCruda(mes: number, anio: number): Observable<ControlLecheCrudaData[]> {
    const url = `${environment.ApiBLH}/getEntradasSalidaLecheCruda/${mes}/${anio}`;

    return this.http.get<ApiResponse<EntradasSalidasApiResponse[]>>(url, { observe: 'response' })
      .pipe(
        map(response => {
          const hasData = response.status !== 204 && response.body?.data?.length;
          return hasData ? this.mapApiResponseToTableData(response.body.data) : [];
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 204) {
            return of([]);
          }
          throw error;
        })
      );
  }

  getEmpleados(): Observable<EmpleadoResponse[]> {
    const url = `${environment.ApiBLH}/getEmpleados`;
    return this.http.get<ApiResponse<EmpleadoResponse[]>>(url)
      .pipe(map(response => response.data));
  }

  putEntradaSalidaLecheCruda(id: number, data: Partial<ControlLecheCrudaData>): Observable<any> {
    const url = `${environment.ApiBLH}/putEntradaSalidaLecheCruda/${id}`;
    return this.http.put<ApiResponse<any>>(url, data)
      .pipe(map(response => response.data));
  }

  /**
   * Mapea los datos del frontend al formato requerido por el backend
   */
  mapearDatosParaActualizar(rowData: ControlLecheCrudaData): any {
    return {
      fechaVencimiento: this.convertirFechaParaBackend(rowData.fechaVencimiento),
      procedencia: rowData.procedencia || '',
      fechaEntrada: rowData.fechaEntrada ? this.convertirFechaParaBackend(rowData.fechaEntrada) : null,
      fechaSalida: rowData.fechaSalida ? this.convertirFechaParaBackend(rowData.fechaSalida) : null,
      madreDonante: { id: parseInt(rowData.donante) },
      empleadoEntrada: this.crearObjetoEmpleado(rowData.responsableEntrada),
      empleadoSalida: this.crearObjetoEmpleado(rowData.responsableSalida)
    };
  }

  /**
   * Crea el objeto empleado para el backend si el nombre existe
   */
  private crearObjetoEmpleado(nombreEmpleado?: string): { id: number } | null {
    if (!nombreEmpleado) return null;
    const empleadoId = this.obtenerIdEmpleadoPorNombre(nombreEmpleado);
    return empleadoId ? { id: empleadoId } : null;
  }

  /**
   * Convierte fechas de diferentes formatos a YYYY-MM-DD evitando problemas de zona horaria
   */
  private convertirFechaParaBackend(fecha: string | Date | null): string {
    if (!fecha) return '';

    if (typeof fecha === 'string' && fecha.includes('-')) {
      return fecha;
    }

    const fechaObj = this.parsearFecha(fecha);
    if (!fechaObj) return fecha?.toString() || '';

    const año = fechaObj.getFullYear();
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaObj.getDate().toString().padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }

  /**
   * Parsea una fecha desde diferentes formatos
   */
  private parsearFecha(fecha: string | Date): Date | null {
    if (fecha instanceof Date) {
      return fecha;
    }

    if (typeof fecha === 'string' && fecha.includes('/')) {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      }
    }

    return null;
  }

  /**
   * Obtener ID de empleado por nombre
   */
  private obtenerIdEmpleadoPorNombre(nombre: string): number | null {
    const empleado = this.empleadosCache.find(emp => emp.nombre === nombre);
    return empleado ? empleado.id : null;
  }

  /**
   * Actualiza el cache de empleados para evitar múltiples consultas
   */
  actualizarCacheEmpleados(empleados: EmpleadoResponse[]): void {
    this.empleadosCache = empleados;
  }

  /**
   * Mapea la respuesta de la API a los datos de la tabla
   */
  private mapApiResponseToTableData(apiData: EntradasSalidasApiResponse[]): ControlLecheCrudaData[] {
    return apiData.map(item => this.crearRegistroTabla(item));
  }

  /**
   * Crea un registro de tabla a partir de los datos de la API
   */
  private crearRegistroTabla(item: EntradasSalidasApiResponse): ControlLecheCrudaData {
    const datosExtraccion = this.extraerDatosExtraccion(item);
    const fechaVencimiento = this.calcularFechaVencimiento(datosExtraccion.fechaExtraccion);
    const diasPosparto = this.calcularDiasPosparto(
      item.madreDonante.madrePotencial.infoMadre.fechaParto,
      datosExtraccion.fechaExtraccion
    );

    return {
      id: item.id,
      nCongelador: datosExtraccion.congeladorId.toString().padStart(3, '0'),
      ubicacion: 'BLH - área de almacenamiento',
      gaveta: datosExtraccion.gaveta,
      diasPosparto,
      donante: item.madreDonante.id.toString(),
      numFrasco: this.generateFrascoNumber(item.id),
      edadGestacional: this.obtenerEdadGestacional(item.madreDonante.gestacion),
      volumen: datosExtraccion.volumen,
      fechaExtraccion: this.formatearFecha(datosExtraccion.fechaExtraccion),
      fechaVencimiento: this.formatearFecha(fechaVencimiento),
      fechaParto: this.formatearFecha(item.madreDonante.madrePotencial.infoMadre.fechaParto),
      procedencia: item.procedencia || '',
      fechaEntrada: item.fechaEntrada ? this.formatearFecha(item.fechaEntrada) : '',
      responsableEntrada: item.empleadoEntrada?.nombre || '',
      fechaSalida: item.fechaSalida ? this.formatearFecha(item.fechaSalida) : '',
      responsableSalida: item.empleadoSalida?.nombre || '',
      fechaRegistro: this.formatearFecha(datosExtraccion.fechaExtraccion),
      idFrascoLecheCruda: item.id
    };
  }

  /**
   * Extrae los datos de extracción desde frascoRecolectado o extraccion
   */
  private extraerDatosExtraccion(item: EntradasSalidasApiResponse) {
    if (item.frascoRecolectado) {
      return {
        volumen: item.frascoRecolectado.volumen.toString(),
        fechaExtraccion: item.frascoRecolectado.fechaDeExtraccion,
        gaveta: item.frascoRecolectado.gaveta.toString(),
        congeladorId: item.frascoRecolectado.congelador.id
      };
    }

    if (item.extraccion) {
      return {
        volumen: item.extraccion.cantidad.toString(),
        fechaExtraccion: item.extraccion.fechaExtraccion,
        gaveta: item.extraccion.gaveta.toString(),
        congeladorId: item.extraccion.congelador.id
      };
    }

    return {
      volumen: '',
      fechaExtraccion: '',
      gaveta: '',
      congeladorId: 0
    };
  }

  /**
   * Obtiene la edad gestacional formateada
   */
  private obtenerEdadGestacional(gestacion: any): string {
    return gestacion?.semanas ? `${gestacion.semanas}.0` : '';
  }

  /**
   * Genera el número de frasco con formato LHC + año + id
   */
  private generateFrascoNumber(id: number): string {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `LHC${currentYear} ${id}`;
  }

  /**
   * Calcula la fecha de vencimiento (15 días después de la extracción)
   */
  private calcularFechaVencimiento(fechaExtraccion: string): string {
    if (!fechaExtraccion) return '';

    const fecha = new Date(fechaExtraccion);
    fecha.setDate(fecha.getDate() + this.DIAS_VENCIMIENTO);
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Calcula los días posparto en formato legible
   */
  private calcularDiasPosparto(fechaParto: string, fechaExtraccion: string): string {
    if (!fechaParto || !fechaExtraccion) return '';

    const parto = new Date(fechaParto);
    const extraccion = new Date(fechaExtraccion);
    const diffTime = Math.abs(extraccion.getTime() - parto.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return this.formatearDiasPosparto(diffDays);
  }

  /**
   * Formatea los días posparto en meses y días
   */
  private formatearDiasPosparto(dias: number): string {
    if (dias < this.DIAS_POR_MES) {
      return `${dias} días`;
    }

    const meses = Math.floor(dias / this.DIAS_POR_MES);
    const diasRestantes = dias % this.DIAS_POR_MES;

    return diasRestantes > 0
      ? `${meses} meses ${diasRestantes} días`
      : `${meses} meses`;
  }

  /**
   * Formatea fecha de YYYY-MM-DD a DD/MM/YYYY evitando problemas de zona horaria
   */
  private formatearFecha(fecha: string): string {
    if (!fecha) return '';
    if (fecha.includes('/')) return fecha;

    const partes = fecha.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
  }
}
