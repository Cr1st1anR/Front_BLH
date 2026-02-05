import { Routes } from '@angular/router';

export const LIBERACION_ROUTES: Routes = [
  {
    path: 'entradas-salidas-pasteurizada',
    loadComponent: () =>
      import(
        './friam-013/pages/entradas-salidas-pasteurizada-page/entradas-salidas-pasteurizada-page.component'
      ).then((c) => c.EntradasSalidasPasteurizadaPageComponent),
  },
];
