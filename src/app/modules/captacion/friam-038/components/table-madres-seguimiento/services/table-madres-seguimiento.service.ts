import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class TableMadresSeguimientoService {

  constructor(private readonly http: HttpClient) { }

  getMadresDonantesAptas(): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getMadresDonantesAptas`);
  }

  // ✅ NUEVO: Obtener madres donantes con su primera visita
  getMadresDonantesAptasConVisitas(): Observable<any> {
    return this.getMadresDonantesAptas().pipe(
      map((response: any) => {
        // Extraer datos de madres
        let madres: any[] = [];
        if (response?.data && Array.isArray(response.data)) {
          madres = response.data;
        } else if (Array.isArray(response)) {
          madres = response;
        }

        // Crear observables para obtener primera visita de cada madre
        const visitasObservables = madres.map(madre =>
          this.getPrimeraVisitaPorMadre(madre.id)
        );

        // Ejecutar todas las consultas en paralelo
        return forkJoin(visitasObservables).pipe(
          map((todasLasVisitas: any[]) => {
            // Combinar madres con sus primeras visitas
            return madres.map((madre, index) => {
              const primeraVisita = todasLasVisitas[index];
              return {
                ...madre,
                primeraVisita: primeraVisita
              };
            });
          })
        );
      })
    );
  }

  // ✅ NUEVO: Obtener solo la primera visita de una madre
  private getPrimeraVisitaPorMadre(idMadreDonante: number): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/getVisitasPorMadre/${idMadreDonante}`).pipe(
      map((response: any) => {
        let visitas: any[] = [];
        if (response?.data && Array.isArray(response.data)) {
          visitas = response.data;
        } else if (Array.isArray(response)) {
          visitas = response;
        }

        // Retornar solo la primera visita (más antigua)
        return visitas.length > 0 ? visitas[0] : null;
      })
    );
  }

  getVisitasPorCodigoDonante(codigoDonante: string): Observable<any> {
    const idMadreDonante = parseInt(codigoDonante);
    return this.http.get(`${environment.ApiBLH}/getVisitasPorMadre/${idMadreDonante}`);
  }

  crearVisitaPorCodigoDonante(codigoDonante: string, fecha: string): Observable<any> {
    const idMadreDonante = parseInt(codigoDonante);
    return this.http.post(`${environment.ApiBLH}/crearVisitaSeguimiento`, {
      idMadreDonante,
      fecha
    });
  }

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
