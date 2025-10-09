import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';


@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private http: HttpClient) { }

  getDataRutaRecoleccion(mes: number, anio: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllRutasRecoleccion`;
    const params = { mes, anio };
    return this.http.get<ApiResponse>(url, { params })
  }

  getDataEmpleados():Observable<ApiResponse>{
    const url = `${environment.ApiBLH}/GetEmpleados`;
    return this.http.get<ApiResponse>(url);
  }

  putDataRutaRecoleccion(data: any): Observable<ApiResponse> {
    const id = data.id;
    const url = `${environment.ApiBLH}/updateRutaRecoleccion/${id}`;
    return this.http.put<ApiResponse>(url, data );
  }

  postDataRutaRecoleccion(data: any): Observable<any> {
    const url = `${environment.ApiBLH}/createRutaRecoleccion`;
    return this.http.post<any>(url, data );
  }

  
}
