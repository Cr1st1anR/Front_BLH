import { Routes } from "@angular/router";
import { HomeComponent } from "./home.component";
import { RoleGuard } from "../../guards/role.guard";


export const HOMEROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'captacion',
        loadChildren: () => import('../captacion/captacion.routes').then((c) => c.CAPTACION_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador', 'Auxiliar'] } // Ambos roles pueden acceder
      },
      {
        path: 'pasteurizacion',
        loadChildren: () => import('../pasteurizacion/pasteurizacion.routes').then((c) => c.PASTEURIZACION_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] } // Solo administradores
      },
      {
        path: 'liberacion',
        loadChildren: () => import('../liberacion/liberacion.routes').then((c) => c.LIBERACION_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] } // Solo administradores
      },
      {
        path: 'distribucion',
        loadChildren: () => import('../distribucion/distribucion.routes').then((c) => c.DISTRIBUCION_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] } // Solo administradores
      },
      {
        path: 'curvas',
        loadChildren: () => import('../curvas/curvas.routes').then((c) => c.CURVAS_ROUTES),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] } // Solo administradores
      }
    ]
  }
];
