import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environments';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { BodyTemperaturaCasas, BodyTemperaturaRutas } from '../interfaces/primaryDialog.interface';

@Injectable({
  providedIn: 'root',
})
export class primaryDialogServices {
  constructor(private http: HttpClient) { }

  getDataTemperaturaRuta(rutaId: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getTemperaturasCasas/${rutaId}`;
    return this.http.get<ApiResponse>(url);
  }

  getDataCasasRuta(rutaId: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getCasasVisitas/${rutaId}`;
    return this.http.get<ApiResponse>(url);
  }

  getMadresDonantes(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetMadreDonante`;
    return this.http.get<ApiResponse>(url);
  }

  postDataTemperatura(data: BodyTemperaturaRutas): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/createTemperaturaCasas`;
    return this.http.post<ApiResponse>(url, data);
  }

  updateDataTemperatura(id:number, data: BodyTemperaturaCasas): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/updateTemperaturaCasas/${id}`;
    return this.http.put<ApiResponse>(url, data);
  }

  postDataCasasVisitas(data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/createCasasVisitas`;
    return this.http.post<ApiResponse>(url, data);
  }

  updateDataCasas(id: number, data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/updateCasas/${id}`;
    return this.http.put<ApiResponse>(url, data);
  }

  getTemperaturaRuta(id: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getTemperaturaRuta/${id}`;
    return this.http.get<ApiResponse>(url);
  }

  postCreateTemperaturaRuta(data: any): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/createTemperaturaRuta`;
    return this.http.post<ApiResponse>(url, data);
  }

  updateTemperaturaRuta(id:number, data: BodyTemperaturaRutas): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/updateTemperaturaRuta/${id}`;
    return this.http.put<ApiResponse>(url, data);
  }


}
