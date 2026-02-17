import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable, tap } from 'rxjs';
import { Auth, AuthBody, TokenPayload } from '../interfaces/auth.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  postAuthenticated(body: AuthBody): Observable<Auth> {
    const url = `${environment.ApiBLH}/login`;
    return this.http.post<Auth>(url, body).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken)
      })
    );
  }

  /**
   * Obtiene el token almacenado en localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decodifica el token JWT y retorna el payload
   */
  decodeToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  /**
   * Obtiene el rol del usuario desde el token JWT
   */
  getRoleFromToken(): string | null {
    const decoded = this.decodeToken();
    return decoded?.rol || null;
  }

  /**
   * Obtiene el nombre de usuario desde el token JWT
   */
  getUsernameFromToken(): string | null {
    const decoded = this.decodeToken();
    return decoded?.usuario || null;
  }

  /**
   * Obtiene el ID del usuario desde el token JWT
   */
  getUserIdFromToken(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub || null;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationDate = decoded.exp * 1000; // Convertir a milisegundos
    return Date.now() >= expirationDate;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const userRole = this.getRoleFromToken();
    return userRole === role;
  }

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getRoleFromToken();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Cierra la sesión eliminando el token
   */
  logout(): void {
    localStorage.removeItem('token');
  }
}
