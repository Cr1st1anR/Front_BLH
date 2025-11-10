import { Routes } from '@angular/router';

export const PASTEURIZACION_ROUTES: Routes = [
  {
    path: 'control-reenvase',
    loadComponent: () =>
      import(
        './friam-032/pages/control-reenvase-page/control-reenvase-page.component'
      ).then((c) => c.ControlReenvasePageComponent),
  },
];
