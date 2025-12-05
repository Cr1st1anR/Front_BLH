import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CalentamientoService {

  constructor(private readonly http: HttpClient) { }

  getAllControlTemperatura(): Observable<any> {
    return this.http.get(`${environment.ApiBLH}/temperatura-pasteurizador`).pipe(
      catchError(error => {
        console.error('Error al obtener datos:', error);
        return throwError(() => error);
      })
    );
  }

  postCalentamiento(arrayCalentamiento: any[]): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/temperatura-pasteurizador/calentamiento`, arrayCalentamiento).pipe(
      catchError(error => {
        console.error('Error al crear calentamiento:', error);
        return throwError(() => error);
      })
    );
  }

  putCalentamiento(arrayCalentamiento: any[]): Observable<any> {
    return this.http.put(`${environment.ApiBLH}/temperatura-pasteurizador/calentamiento`, arrayCalentamiento).pipe(
      catchError(error => {
        console.error('Error al actualizar calentamiento:', error);
        return throwError(() => error);
      })
    );
  }
}
