import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/pages/login/login-page.component')// Carga perezosa del módulo Home
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/dashboard/dashboard.component')// Carga perezosa del módulo Home
  },

  {
    path: 'menubar',
    loadComponent: () => import('./shared/components/menubar/menubar.component')// Carga perezosa del módulo Home
  },

  {
    path: '**',
    redirectTo: ''
  } // Redirección en caso de ruta no encontrada
];
