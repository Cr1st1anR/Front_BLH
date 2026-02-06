import { Routes } from '@angular/router';

export const CURVAS_ROUTES: Routes = [
  {
    path: 'construccion-curvas',
    loadComponent: () =>
      import(
        './friam-019/pages/construccion-curvas-page/construccion-curvas-page.component'
      ).then((c) => c.ConstruccionCurvasPageComponent),
  },
];
