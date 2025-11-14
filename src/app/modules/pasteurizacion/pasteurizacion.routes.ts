import { Routes } from '@angular/router';

export const PASTEURIZACION_ROUTES: Routes = [
  {
    path: 'control-reenvase',
    loadComponent: () =>
      import(
        './friam-032/pages/control-reenvase-page/control-reenvase-page.component'
      ).then((c) => c.ControlReenvasePageComponent),
  },
  {
    path: 'registro-no-conformidades',
    loadComponent: () =>
      import(
        './friam-017/pages/no-conformidades-page/no-conformidades-page.component'
      ).then((c) => c.NoConformidadesPageComponent),
  },
];
