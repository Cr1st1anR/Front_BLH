import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable, tap } from 'rxjs';
import { Auth, AuthBody } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  postAuthenticated(body:AuthBody): Observable<Auth> {
    const url = `${environment.ApiBLH}/login`;
    return this.http.post<Auth>(url, body).pipe(
      tap((res) => {
        localStorage.setItem('token',res.accessToken)
      })
    );
  }
}
