import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import type {
  ApiResponseIngresoLeche,
  ApiResponseFrascos,
  IngresoLechePasteurizadaBackendRequest
} from '../interfaces/ingreso-leche-pasteurizada.interface';

@Injectable({
  providedIn: 'root'
})
export class IngresoLechePasteurizadaService {

  constructor(private readonly http: HttpClient) { }

  getIngresosPorMesYAnio(mes: number, anio: number): Observable<ApiResponseIngresoLeche> {
    const mesFormateado = mes.toString().padStart(2, '0');
    return this.http.get<ApiResponseIngresoLeche>(`${environment.ApiBLH}/ingresos/${mesFormateado}/${anio}`);
  }

  postIngresoLechePasteurizada(data: IngresoLechePasteurizadaBackendRequest): Observable<any> {
    return this.http.post(`${environment.ApiBLH}/ingresos`, data);
  }

  putIngresoLechePasteurizada(id: number, data: IngresoLechePasteurizadaBackendRequest): Observable<any> {
    return this.http.put(`${environment.ApiBLH}/ingresos/${id}`, data);
  }

  getFrascosPasteurizados(): Observable<ApiResponseFrascos> {
    return this.http.get<ApiResponseFrascos>(`${environment.ApiBLH}/frascos-pasteurizados-ingreso`);
  }
}
