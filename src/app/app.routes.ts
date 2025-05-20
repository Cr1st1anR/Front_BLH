import { Routes } from '@angular/router';
import { HOMEROUTES } from './modules/home/home.routes';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: 'blh',
    children: HOMEROUTES,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadComponent: () => import('./modules/auth/pages/login/login-page.component').then((c) => c.LoginPageComponent)
  },
  {
    path: '**',
    redirectTo: 'blh'
  } 
];
