import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type {
  LecheDistribucionRequest,
  LecheDistribucionResponse,
  MadrePotencial,
  Empleado,
  ApiResponse,
  ApiResponseOrDirect
} from '../interfaces/entrega-leche-cruda.interface';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EntregaLecheCrudaService {

  constructor(private readonly http: HttpClient) { }

  getLecheDistribucion(): Observable<ApiResponse<LecheDistribucionResponse[]>> {
    return this.http.get<ApiResponse<LecheDistribucionResponse[]>>(`${environment.ApiBLH}/getLecheDistribucion`);
  }

  postLecheDistribucion(request: LecheDistribucionRequest): Observable<ApiResponseOrDirect<LecheDistribucionResponse>> {
    return this.http.post<ApiResponseOrDirect<LecheDistribucionResponse>>(`${environment.ApiBLH}/postLecheDistribucion`, request);
  }

  putLecheDistribucion(id: number, request: LecheDistribucionRequest): Observable<any> {
    return this.http.put(`${environment.ApiBLH}/putLecheDistribucion/${id}`, request);
  }

  getMadresInternasNoDonantes(): Observable<ApiResponse<MadrePotencial[]>> {
    return this.http.get<ApiResponse<MadrePotencial[]>>(`${environment.ApiBLH}/getMadresInternasNoDonantes`);
  }

  getEmpleados(): Observable<ApiResponse<Empleado[]>> {
    return this.http.get<ApiResponse<Empleado[]>>(`${environment.ApiBLH}/GetEmpleados`);
  }
}
