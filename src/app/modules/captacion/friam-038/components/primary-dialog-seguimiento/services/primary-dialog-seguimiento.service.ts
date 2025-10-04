import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableMadresSeguimientoService } from '../../table-madres-seguimiento/services/table-madres-seguimiento.service';
import { VisitaSeguimiento, VisitaTabla } from '../../interfaces/visita-seguimiento.interface';

@Injectable({
  providedIn: 'root',
})
export class PrimaryDialogSeguimientoService {

  constructor(
    private readonly tableMadresSeguimientoService: TableMadresSeguimientoService
  ) { }

  getTableVistaData(codigoDonante: string): Observable<VisitaTabla[]> {
    return this.tableMadresSeguimientoService.getVisitasPorCodigoDonante(codigoDonante)
      .pipe(
        map((response: any) => this.transformarRespuestaAPI(response))
      );
  }

  crearNuevaVisita(codigoDonante: string, fecha: string): Observable<any> {
    return this.tableMadresSeguimientoService.crearVisitaPorCodigoDonante(codigoDonante, fecha);
  }

  actualizarFechaVisita(idVisita: number, nuevaFecha: string): Observable<any> {
    return this.tableMadresSeguimientoService.actualizarFechaVisitaPorId(idVisita, nuevaFecha);
  }

  private transformarRespuestaAPI(response: any): VisitaTabla[] {
    let visitas: VisitaSeguimiento[] = [];

    if (response?.data && Array.isArray(response.data)) {
      visitas = response.data;
    } else if (Array.isArray(response)) {
      visitas = response;
    }

    return this.transformarVisitasParaTabla(visitas);
  }

  private transformarVisitasParaTabla(visitas: VisitaSeguimiento[]): VisitaTabla[] {
    const visitasOrdenadas = visitas.sort((a, b) =>
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return visitasOrdenadas.map((visita, index) => ({
      id_visita: visita.id,
      no_visita: index + 1,
      fecha_visita: this.formatearFecha(visita.fecha),
    }));
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }
}
