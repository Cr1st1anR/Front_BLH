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

  getVisitasPorMadre(idMadre: number): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getVisitasPorMadre/${idMadre}`);
  }

  crearVisitaSeguimiento(idMadreDonante: number, fecha: string): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/crearVisitaSeguimiento`, {
      idMadreDonante,
      fecha
    });
  }

  actualizarFechaVisita(idVisita: number, nuevaFecha: string): Observable<any> {
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
