import { Routes } from '@angular/router';

export const DISTRIBUCION_ROUTES: Routes = [
  {
    path: 'distribucion-leche-procesada',
    loadComponent: () =>
      import(
        './friam-031/pages/distribucion-leche-procesada-page/distribucion-leche-procesada-page.component'
      ).then((c) => c.DistribucionLecheProcesadaPageComponent),
  },
  {
    path: 'ingreso-leche-pasteurizada',
    loadComponent: () =>
      import(
        './frnut-013/pages/ingreso-leche-pasteurizada-page/ingreso-leche-pasteurizada-page.component'
      ).then((c) => c.IngresoLechePasteurizadaPageComponent),
  },
];
