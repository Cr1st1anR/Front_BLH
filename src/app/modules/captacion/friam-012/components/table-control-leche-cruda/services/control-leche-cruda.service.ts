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
   * Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
   */
  private formatearFecha(fecha: string): string {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
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
