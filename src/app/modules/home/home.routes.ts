import { Routes } from "@angular/router";
import { HomeComponent } from "./home.component";


export const HOMEROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'captacion',
        loadChildren: () => import('../captacion/captacion.routes').then((c) => c.CAPTACION_ROUTES)
      },
      {
        path: 'pasteurizacion',
        loadChildren: () => import('../pasteurizacion/pasteurizacion.routes').then((c) => c.PASTEURIZACION_ROUTES)
      },
      {
        path: 'liberacion',
        loadChildren: () => import('../liberacion/liberacion.routes').then((c) => c.LIBERACION_ROUTES)
      },
      {
        path: 'distribucion',
        loadChildren: () => import('../distribucion/distribucion.routes').then((c) => c.DISTRIBUCION_ROUTES)
      },
      {
        path: 'curvas',
        loadChildren: () => import('../curvas/curvas.routes').then((c) => c.CURVAS_ROUTES)
      }
    ]
  }
];
