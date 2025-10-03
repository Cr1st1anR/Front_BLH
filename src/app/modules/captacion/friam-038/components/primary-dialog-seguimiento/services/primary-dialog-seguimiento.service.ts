import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TableMadresSeguimientoService } from '../../table-madres-seguimiento/services/table-madres-seguimiento.service';
import { VisitaSeguimiento, VisitaTabla } from '../../interfaces/visita-seguimiento.interface';

@Injectable({
  providedIn: 'root',
})
export class PrimaryDialogSeguimientoService {

  // Bandera para alternar entre API y hardcoded
  private useApiData: boolean = true;

  constructor(
    private tableMadresSeguimientoService: TableMadresSeguimientoService
  ) {}

  // MÉTODO PRINCIPAL: Obtener visitas (API + fallback)
  getTableVistaData(codigoDonante?: string): Observable<VisitaTabla[]> {
    if (this.useApiData && codigoDonante) {
      return this.getVisitasFromAPI(codigoDonante);
    } else {
      // Fallback a datos hardcodeados
      return this.getVisitasHardcoded();
    }
  }

  // NUEVO: Método para API real
  private getVisitasFromAPI(codigoDonante: string): Observable<VisitaTabla[]> {
    return this.tableMadresSeguimientoService.getVisitasPorCodigoDonante(codigoDonante)
      .pipe(
        map((response: any) => {
          // Extraer datos del wrapper de respuesta
          let visitas: VisitaSeguimiento[] = [];

          if (response?.data && Array.isArray(response.data)) {
            visitas = response.data;
          } else if (Array.isArray(response)) {
            visitas = response;
          }

          // Transformar al formato de tabla
          return this.transformarVisitasParaTabla(visitas);
        }),
        catchError((error) => {
          console.error('Error al cargar visitas desde API:', error);
          // Fallback a datos hardcodeados en caso de error
          return this.getVisitasHardcoded();
        })
      );
  }

  // MANTENER: Método hardcodeado como respaldo
  private getVisitasHardcoded(): Observable<VisitaTabla[]> {
    const visitasHardcoded = [
      {
        id_visita: 1,
        no_visita: 1,
        fecha_visita: '16/07/2025',
      },
      {
        id_visita: 2,
        no_visita: 2,
        fecha_visita: '20/07/2025',
      },
    ];

    // Simular Observable
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(visitasHardcoded);
        observer.complete();
      }, 500);
    });
  }

  // NUEVO: Transformar datos de API al formato de tabla
  private transformarVisitasParaTabla(visitas: VisitaSeguimiento[]): VisitaTabla[] {
    return visitas.map((visita, index) => ({
      id_visita: visita.id,
      no_visita: index + 1, // Número secuencial de visita
      fecha_visita: this.formatearFecha(visita.fecha),
    }));
  }

  // NUEVO: Formatear fecha de yyyy-mm-dd a dd/mm/yyyy
  private formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // NUEVO: Crear nueva visita
  crearNuevaVisita(codigoDonante: string, fecha: string): Observable<any> {
    if (this.useApiData) {
      return this.tableMadresSeguimientoService.crearVisitaPorCodigoDonante(codigoDonante, fecha);
    } else {
      // Simular creación local para testing
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true, id: Date.now() });
          observer.complete();
        }, 500);
      });
    }
  }

  // NUEVO: Actualizar fecha de visita
  actualizarFechaVisita(idVisita: number, nuevaFecha: string): Observable<any> {
    if (this.useApiData) {
      return this.tableMadresSeguimientoService.actualizarFechaVisitaPorId(idVisita, nuevaFecha);
    } else {
      // Simular actualización local para testing
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true });
          observer.complete();
        }, 500);
      });
    }
  }
}
