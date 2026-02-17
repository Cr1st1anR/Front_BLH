import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../modules/auth/services/auth.service';

/**
 * Guard para verificar que el usuario tenga el rol adecuado para acceder a una ruta
 * 
 * Uso en las rutas:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Administrador'] }
 * }
 */
@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        // Verificar si hay un token
        const token = this.authService.getToken();
        if (!token) {
            console.warn('RoleGuard: No hay token, redirigiendo al login');
            this.router.navigate(['/']);
            return false;
        }

        // Verificar si el token ha expirado
        if (this.authService.isTokenExpired()) {
            console.warn('RoleGuard: Token expirado, redirigiendo al login');
            this.authService.logout();
            this.router.navigate(['/']);
            return false;
        }

        // Obtener los roles requeridos de la configuración de la ruta
        const expectedRoles = route.data['roles'] as Array<string>;

        // Si no se especificaron roles, solo verificamos que esté autenticado
        if (!expectedRoles || expectedRoles.length === 0) {
            return true;
        }

        // Obtener el rol del usuario desde el token
        const userRole = this.authService.getRoleFromToken();

        if (!userRole) {
            console.warn('RoleGuard: No se pudo obtener el rol del usuario');
            this.router.navigate(['/']);
            return false;
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!expectedRoles.includes(userRole)) {
            console.warn(`RoleGuard: Acceso denegado. Rol del usuario: ${userRole}, Roles requeridos: ${expectedRoles.join(', ')}`);
            // Redirigir a una página de acceso denegado o al home
            this.router.navigate(['/home']);
            return false;
        }

        // El usuario tiene el rol adecuado
        return true;
    }
}
