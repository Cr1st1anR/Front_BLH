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


  constructor(private http: HttpClient) { }

  /**
   * Obtener entradas y salidas de leche cruda por mes y año
   */
  getEntradasSalidasLecheCruda(mes: number, anio: number): Observable<ControlLecheCrudaData[]> {
    return this.http.get<ApiResponse<EntradasSalidasApiResponse[]>>(
      `${environment.ApiBLH}/getEntradasSalidaLecheCruda/${mes}/${anio}`,
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

        return this.mapApiResponseToTableData(response.body.data);
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

  /**
   * Obtener lista de empleados
   */
  getEmpleados(): Observable<EmpleadoResponse[]> {
    return this.http.get<ApiResponse<EmpleadoResponse[]>>(`${environment.ApiBLH}/getEmpleados`)
      .pipe(map(response => response.data));
  }

  /**
   * Actualizar entrada/salida de leche cruda
   */
  putEntradaSalidaLecheCruda(id: number, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${environment.ApiBLH}/putEntradaSalidaLecheCruda/${id}`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Mapear datos del frontend al formato que espera el backend
   */
  mapearDatosParaActualizar(rowData: ControlLecheCrudaData): any {
    // Convertir fechas de DD/MM/YYYY a YYYY-MM-DD o manejar objetos Date
    const fechaVencimiento = this.convertirFechaParaBackend(rowData.fechaVencimiento);
    const fechaEntrada = rowData.fechaEntrada ? this.convertirFechaParaBackend(rowData.fechaEntrada) : null;
    const fechaSalida = rowData.fechaSalida ? this.convertirFechaParaBackend(rowData.fechaSalida) : null;

    // Buscar IDs de empleados por nombre
    const empleadoEntradaId = rowData.responsableEntrada ?
      this.obtenerIdEmpleadoPorNombre(rowData.responsableEntrada) : null;
    const empleadoSalidaId = rowData.responsableSalida ?
      this.obtenerIdEmpleadoPorNombre(rowData.responsableSalida) : null;

    return {
      fechaVencimiento: fechaVencimiento,
      procedencia: rowData.procedencia || '',
      fechaEntrada: fechaEntrada,
      fechaSalida: fechaSalida,
      madreDonante: { id: parseInt(rowData.donante) },
      empleadoEntrada: empleadoEntradaId ? { id: empleadoEntradaId } : null,
      empleadoSalida: empleadoSalidaId ? { id: empleadoSalidaId } : null
    };
  }

  /**
   * Convertir fecha de diferentes formatos a YYYY-MM-DD (SIN problema de zona horaria)
   */
  private convertirFechaParaBackend(fecha: string | Date | null): string {
    if (!fecha) return '';

    let fechaObj: Date;

    // Si es un objeto Date (viene del DatePicker)
    if (fecha instanceof Date) {
      fechaObj = fecha;
    }
    // Si es string en formato DD/MM/YYYY
    else if (typeof fecha === 'string' && fecha.includes('/')) {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        // Crear fecha sin problemas de zona horaria
        fechaObj = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      } else {
        return fecha;
      }
    }
    // Si ya está en formato YYYY-MM-DD
    else if (typeof fecha === 'string' && fecha.includes('-')) {
      return fecha;
    }
    else {
      return fecha ? fecha.toString() : '';
    }

    // ✅ SOLUCIÓN: Usar métodos locales para evitar zona horaria
    const año = fechaObj.getFullYear();
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaObj.getDate().toString().padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }

  /**
   * Obtener ID de empleado por nombre
   */
  private obtenerIdEmpleadoPorNombre(nombre: string): number | null {
    const empleado = this.empleadosCache.find(emp => emp.nombre === nombre);
    return empleado ? empleado.id : null;
  }

  // Cache de empleados para evitar múltiples consultas
  private empleadosCache: EmpleadoResponse[] = [];

  /**
   * Método para actualizar el cache de empleados
   */
  actualizarCacheEmpleados(empleados: EmpleadoResponse[]): void {
    this.empleadosCache = empleados;
  }

  /**
   * Mapear la respuesta de la API a los datos de la tabla
   */
  private mapApiResponseToTableData(apiData: EntradasSalidasApiResponse[]): ControlLecheCrudaData[] {
    return apiData.map(item => {
      // Determinar la fuente de datos (frascoRecolectado o extraccion)
      const esFrasco = item.frascoRecolectado !== null;
      const esExtraccion = item.extraccion !== null;

      // Obtener datos según la fuente
      const volumen = esFrasco ? item.frascoRecolectado!.volumen.toString() :
        esExtraccion ? item.extraccion!.cantidad.toString() : '';

      const fechaExtraccion = esFrasco ? item.frascoRecolectado!.fechaDeExtraccion :
        esExtraccion ? item.extraccion!.fechaExtraccion : '';

      const gaveta = esFrasco ? item.frascoRecolectado!.gaveta.toString() :
        esExtraccion ? item.extraccion!.gaveta.toString() : '';

      const congeladorId = esFrasco ? item.frascoRecolectado!.congelador.id :
        esExtraccion ? item.extraccion!.congelador.id : '';

      // Calcular fecha de vencimiento (15 días después de la fecha de extracción)
      const fechaVencimiento = this.calcularFechaVencimiento(fechaExtraccion);

      // Calcular días posparto
      const diasPosparto = this.calcularDiasPosparto(
        item.madreDonante.madrePotencial.infoMadre.fechaParto,
        fechaExtraccion
      );

      // Obtener edad gestacional desde la base de datos
      const edadGestacional = this.obtenerEdadGestacional(item.madreDonante.gestacion);

      // Generar número de frasco con la lógica LHC + año + id
      const numFrasco = this.generateFrascoNumber(item.id);

      return {
        id: item.id,
        nCongelador: congeladorId.toString().padStart(3, '0'),
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: gaveta,
        diasPosparto: diasPosparto,
        donante: item.madreDonante.id.toString(),
        numFrasco: numFrasco,
        edadGestacional: edadGestacional,
        volumen: volumen,
        fechaExtraccion: this.formatearFecha(fechaExtraccion),
        fechaVencimiento: this.formatearFecha(fechaVencimiento),
        fechaParto: this.formatearFecha(item.madreDonante.madrePotencial.infoMadre.fechaParto),
        procedencia: item.procedencia || '',
        fechaEntrada: item.fechaEntrada ? this.formatearFecha(item.fechaEntrada) : '',
        responsableEntrada: item.empleadoEntrada ? item.empleadoEntrada.nombre : '',
        fechaSalida: item.fechaSalida ? this.formatearFecha(item.fechaSalida) : '',
        responsableSalida: item.empleadoSalida ? item.empleadoSalida.nombre : '',
        fechaRegistro: this.formatearFecha(fechaExtraccion),
        idFrascoLecheCruda: item.id
      };
    });
  }

  /**
   * Obtener edad gestacional desde los datos de la base de datos
   */
  private obtenerEdadGestacional(gestacion: any): string {
    if (!gestacion || !gestacion.semanas) {
      return ''; // Sin datos de gestación
    }

    // Formatear las semanas como decimal (ej: 38.1, 40.0)
    return gestacion.semanas.toString() + '.0';
  }

  /**
   * Generar número de frasco con formato LHC + año + id
   */
  private generateFrascoNumber(id: number): string {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `LHC${currentYear} ${id}`;
  }

  /**
   * Calcular fecha de vencimiento (15 días después de la fecha de extracción)
   */
  private calcularFechaVencimiento(fechaExtraccion: string): string {
    if (!fechaExtraccion) return '';

    const fecha = new Date(fechaExtraccion);
    fecha.setDate(fecha.getDate() + 15);
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Calcular días posparto
   */
  private calcularDiasPosparto(fechaParto: string, fechaExtraccion: string): string {
    if (!fechaParto || !fechaExtraccion) return '';

    const parto = new Date(fechaParto);
    const extraccion = new Date(fechaExtraccion);
    const diffTime = Math.abs(extraccion.getTime() - parto.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} días`;
    } else {
      const meses = Math.floor(diffDays / 30);
      const diasRestantes = diffDays % 30;
      return diasRestantes > 0 ? `${meses} meses ${diasRestantes} días` : `${meses} meses`;
    }
  }

  /**
   * Formatear fecha de YYYY-MM-DD a DD/MM/YYYY (SIN problema de zona horaria)
   */
  private formatearFecha(fecha: string): string {
    if (!fecha) return '';

    // Si la fecha ya está en formato DD/MM/YYYY, devolverla tal como está
    if (fecha.includes('/')) return fecha;

    // ✅ SOLUCIÓN: Parsear manualmente para evitar zona horaria
    const partes = fecha.split('T')[0].split('-'); // Tomar solo la parte de fecha
    if (partes.length === 3) {
      const año = partes[0];
      const mes = partes[1];
      const dia = partes[2];

      return `${dia}/${mes}/${año}`;
    }

    return fecha;
  }

  // Métodos heredados del código original para mantener compatibilidad
  getTableControlLecheCrudaData(): ControlLecheCrudaData[] {
    // Método mantenido para compatibilidad, pero ya no se usará
    return [];
  }

  generateNextFrascoNumber(): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString().slice(-2);
    const lastId = this.getLastFrascoId();
    const nextId = lastId + 1;
    return `LHC${currentYear} ${nextId}`;
  }

  private getLastFrascoId(): number {
    return 1129; // Valor por defecto
  }
}
