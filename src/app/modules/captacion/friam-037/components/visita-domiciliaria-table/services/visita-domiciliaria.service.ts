import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environments';
import { ApiResponse } from '../../../../friam-041/components/table-list/interfaces/linea-amiga.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaDomiciliariaService {



  constructor(
    private http: HttpClient
  ) {}

  getDataVisitaDomiciliaria(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllMadresPotenciales`;
    return this.http.get<ApiResponse>(url);
  }
}
