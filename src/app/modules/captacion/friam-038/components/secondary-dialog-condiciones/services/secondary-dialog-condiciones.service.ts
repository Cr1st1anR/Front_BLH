import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosCompletos } from '../../interfaces/datos-completos.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SecondaryDialogCondicionesService {

  constructor(private http: HttpClient) { }

  /**
   * Obtener preguntas del formulario FRIAM-038
   */
  getPreguntas(): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getPreguntasFriam038`);
  }

  /**
   * Guardar formulario completo (respuestas + datos de visita)
   */
  guardarFormularioCompleto(datos: DatosCompletos): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/guardarRespuestasYDatos`, datos).pipe(
      map((response: any) => response),
      catchError(error => {
        console.error('Error en guardarFormularioCompleto:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener detalles completos de una visita específica
   */
  getDetallesVisita(idVisita: number): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getDetallesVisita/${idVisita}`).pipe(
      map((response: any) => {
        if (response?.data) {
          const visita = response.data;
          return {
            datosVisitaSeguimiento: visita.datosVisitaSeguimiento,
            respuestas: visita.respuestas || [],
            visitaInfo: {
              id: visita.id,
              fecha: visita.fecha,
              madreDonante: visita.madreDonante
            }
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error en getDetallesVisita:', error);
        throw error;
      })
    );
  }
}
