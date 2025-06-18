import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';


@Injectable({
  providedIn: 'root'
})
export class primaryDialogServices {

  constructor(private http: HttpClient) { }

  getDataTemperaturaRuta(rutaId: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getTemperaturasCasas/${rutaId}`
    return this.http.get<ApiResponse>(url)
  }

  getDataCasasRuta(rutaId: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getCasasVisitas/${rutaId}`
    return this.http.get<ApiResponse>(url)
  }

  getMadresDonantes():Observable<ApiResponse>{
    const url = `${environment.ApiBLH}/GetMadreDonante`;
    return this.http.get<ApiResponse>(url);
  }

  // putDataLineaAmiga(data: any): Observable<ApiResponse> {
  //   const id = data.id;
  //   const url = `${environment.ApiBLH}/UpdateMadrePotencial/${id}`;
  //   return this.http.put<ApiResponse>(url, data );
  // }

  postDataTemperatura(data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/createTemperaturaCasas`;
    return this.http.post<ApiResponse>(url, data );
  }


}
