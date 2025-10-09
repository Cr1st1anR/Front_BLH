import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';


@Injectable({
  providedIn: 'root'
})
export class secondaryDialogServices {

  constructor(private http: HttpClient) { }

  getDataFrascosLeche(idCasa: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getFrascosRecolectados/${idCasa}`
    return this.http.get<ApiResponse>(url)
  }

  getDataCongeladores(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getCongeladores`
    return this.http.get<ApiResponse>(url)
  }

  // getMadresDonantes():Observable<ApiResponse>{
  //   const url = `${environment.ApiBLH}/GetMadreDonante`;
  //   return this.http.get<ApiResponse>(url);
  // }

  // putDataLineaAmiga(data: any): Observable<ApiResponse> {
  //   const id = data.id;
  //   const url = `${environment.ApiBLH}/UpdateMadrePotencial/${id}`;
  //   return this.http.put<ApiResponse>(url, data );
  // }

  postDataFrascosRecolectados(data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/createFrascosRecolectados`;
    return this.http.post<ApiResponse>(url, data );
  }

    updateDataFrascos(id: number, data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/updateFrascos/${id}`;
    return this.http.put<ApiResponse>(url, data);
  }

}
