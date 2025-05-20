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
    path: 'recoleccion-leche-humana-cruda',
    loadComponent: () =>
      import('./friam-011/components/table-list/table-list.component').then(
        (c) => c.TableListComponent
      ),
  },

];
