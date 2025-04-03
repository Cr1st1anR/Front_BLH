import { Component } from '@angular/core';
import { provideRouter, RouterModule, Routes } from '@angular/router';

const homeRoutes: Routes = [
  // { path: '', component: DashboardComponent }, // Ruta por defecto en Home
  // { path: 'profile', component: ProfileComponent },
  { path: 'login', loadComponent: () => import('../auth/pages/login/login-page.component') }
];

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  template: `<p>home works!</p>`,
  // styleUrl: './home.component.css',
})
export default class HomeComponent { }
