import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RegistroDonanteData } from '../interfaces/registro-donante.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';

@Injectable({
  providedIn: 'root',
})
export class RegistroDonanteService {

  personaSeleccionada?: RegistroDonanteData;
  constructor(private http: HttpClient) {}

  getDataRegistroDonante(mes: number, anio: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getMadresPotenciales`;
    const params = { mes, anio };
    return this.http.get<ApiResponse>(url, { params })
  }

  getDataEmpleados():Observable<ApiResponse>{
    const url = `${environment.ApiBLH}/GetEmpleados`;
    return this.http.get<ApiResponse>(url);
  }
}
