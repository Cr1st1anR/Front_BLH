import { Routes } from "@angular/router";


export const CAPTACION_ROUTES: Routes = [
  {
    path:'registro-linea-amiga',
    loadComponent: () => import('./friam-041/components/table-list/table-list.component').then((c) => c.TableListComponent)
  },
  // {
  //   path:'',
  //   component: CaptacionListComponent,
  // },
  // {
  //   path:'',
  //   component: CaptacionListComponent,
  // },
];
