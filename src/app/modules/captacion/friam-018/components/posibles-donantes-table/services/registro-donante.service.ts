import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BodyMadreDonante } from '../interfaces/registro-donante.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';

@Injectable({
  providedIn: 'root',
})
export class RegistroDonanteService {

  constructor(private http: HttpClient) { }

  getDataRegistroDonante(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllMadresPotenciales`;
    return this.http.get<ApiResponse>(url)
  }

  getDataMadresDonantesRegistered(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllMadresPotencialesByMadreDonante`;
    return this.http.get<ApiResponse>(url)
  }

  getDataEmpleados(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetEmpleados`;
    return this.http.get<ApiResponse>(url);
  }

  postDataRegistroDonante(body: BodyMadreDonante): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/CreateMadreDonante`;
    return this.http.post<ApiResponse>(url, body);
  }

  getInfoCompleteMadrePotencial(id: number): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getInfoCompleteMadrePotencial/${id}`;
    return this.http.get<ApiResponse>(url);
  }

  uploadPdf(formData: FormData): Observable<any> {
    const url = `${environment.ApiBLH}/uploadPDFs`;
    return this.http.post<any>(url, formData);
  }

  getPDF(doc: string): Observable<Blob> {
    const url = `${environment.ApiBLH}/pdfs/${doc}`;
    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }
}
