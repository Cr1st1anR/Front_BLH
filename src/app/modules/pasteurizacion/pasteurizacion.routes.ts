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
    path: 'seleccion-clasificacion-leche-cruda',
    loadComponent: () =>
      import(
        './friam-015/pages/seleccion-clasificacion-page/seleccion-clasificacion-page.component'
      ).then((c) => c.SeleccionClasificacionPageComponent),
  },
  {
    path: 'control-temperatura-pasteurizador',
    loadComponent: () =>
      import(
        './friam-036/pages/control-temperatura-page/control-temperatura-page.component'
      ).then((c) => c.ControlTemperaturaPageComponent),
  },
];
