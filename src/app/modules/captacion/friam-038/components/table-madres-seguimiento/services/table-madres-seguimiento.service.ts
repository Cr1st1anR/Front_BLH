import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class TableMadresSeguimientoService {

  constructor(private readonly http: HttpClient) { }

  getMadresDonantesAptas(): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getMadresDonantesAptas`);
  }

    // NUEVO: Método para obtener visitas por código de donante
  getVisitasPorCodigoDonante(codigoDonante: string): Observable<any> {
    // Convertir codigoDonante (string) a idMadreDonante (number)
    const idMadreDonante = parseInt(codigoDonante);
    return this.http.get(`${environment.ApiBLH}/getVisitasPorMadre/${idMadreDonante}`);
  }

  // NUEVO: Método para crear visita por código de donante
  crearVisitaPorCodigoDonante(codigoDonante: string, fecha: string): Observable<any> {
    const idMadreDonante = parseInt(codigoDonante);
    return this.http.post(`${environment.ApiBLH}/crearVisitaSeguimiento`, {
      idMadreDonante,
      fecha
    });
  }

  // NUEVO: Método para actualizar fecha de visita
  actualizarFechaVisitaPorId(idVisita: number, nuevaFecha: string): Observable<any> {
    return this.http.put(`${environment.ApiBLH}/actualizarFechaVisita`, {
      idVisita,
      nuevaFecha
    });
  }

  getPreguntasFriam038(): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getPreguntasFriam038`);
  }

  guardarRespuestasYDatos(datos: any): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/guardarRespuestasYDatos`, datos);
  }

  getDetallesVisita(idVisita: number): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getDetallesVisita/${idVisita}`);
  }
}
