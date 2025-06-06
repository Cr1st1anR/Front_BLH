import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse, empleados, entidades, lineaAmigaData } from '../interfaces/linea-amiga.interface';

@Injectable({
  providedIn: 'root'
})
export class LineaAmigaService {

  constructor(private http: HttpClient) { }

  getDataFriam041(mes: number, anio: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getMadresPotenciales`;
    const params = { mes, anio };
    return this.http.get<ApiResponse>(url, { params })
  }
  

  getDataEntidades(): Observable<ApiResponse>{
    const url = `${environment.ApiBLH}/getAllEntidades`;
    return this.http.get<ApiResponse>(url);
  }

  getDataEmpleados():Observable<ApiResponse>{
    const url = `${environment.ApiBLH}/GetEmpleados`;
    return this.http.get<ApiResponse>(url);
  }

  putDataLineaAmiga(data: any): Observable<ApiResponse> {
    const id = data.id;
    const url = `${environment.ApiBLH}/UpdateMadrePotencial/${id}`;
    return this.http.put<ApiResponse>(url, data );
  }

  postDataLineaAmiga(data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/CreateMadrePotencial`;
    return this.http.post<ApiResponse>(url, data );
  }

  
}
