import { Routes } from '@angular/router';

export const CAPTACION_ROUTES: Routes = [
  {
    path: 'registro-linea-amiga',
    loadComponent: () =>
      import('./friam-041/components/table-list/table-list.component').then(
        (c) => c.TableListComponent
      ),
  },
  {
    path: 'registro-donante-blh',
    loadComponent: () =>
      import('./friam-018/components/posibles-donantes-table/posibles-donantes-table.component').then(
        (c) => c.PosiblesDonantesTableComponent
      ),
  },
];
