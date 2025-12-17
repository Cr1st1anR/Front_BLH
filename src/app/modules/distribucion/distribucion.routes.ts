import { Routes } from '@angular/router';

export const DISTRIBUCION_ROUTES: Routes = [
  {
    path: 'distribucion-leche-procesada',
    loadComponent: () =>
      import(
        './friam-031/pages/distribucion-leche-procesada-page/distribucion-leche-procesada-page.component'
      ).then((c) => c.DistribucionLecheProcesadaPageComponent),
  },
];
