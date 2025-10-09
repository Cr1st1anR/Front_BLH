import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosCompletos } from '../../interfaces/datos-completos.interface';

@Injectable({
  providedIn: 'root'
})
export class SecondaryDialogCondicionesService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Obtener preguntas del formulario FRIAM-038
  getPreguntas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getPreguntasFriam038`);
  }

  // Guardar formulario completo (respuestas + datos)
  guardarFormularioCompleto(datos: DatosCompletos): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('🔄 Enviando datos al servidor:', datos);

    return this.http.post(
      `${this.baseUrl}/guardarRespuestasYDatos`,
      datos,
      { headers }
    ).pipe(
      map((response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error en la petición:', error);
        throw error;
      })
    );
  }

  // Obtener detalles completos de una visita
  getDetallesVisita(idVisita: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getDetallesVisita/${idVisita}`).pipe(
      map((response: any) => {
        console.log('🔍 Respuesta completa del servidor:', response);

        if (response && response.data) {
          const visita = response.data;

          // Mapear correctamente los datos
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
        console.error('❌ Error al obtener detalles de visita:', error);
        throw error;
      })
    );
  }
}
