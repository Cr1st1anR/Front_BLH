import { Routes } from '@angular/router';
import { HOMEROUTES } from './modules/home/home.routes';


export const routes: Routes = [
  {
    path: '',
    children: HOMEROUTES
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/pages/login/login-page.component').then((c) => c.LoginPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  } 
];
