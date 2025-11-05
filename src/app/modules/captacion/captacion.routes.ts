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
  {
    path: 'registro-donante-blh',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './friam-018/components/posibles-donantes-table/posibles-donantes-table.component'
          ).then((c) => c.PosiblesDonantesTableComponent),
      },
      {
        path: ':documento',
        loadComponent: () =>
          import('./friam-018/components/accordion/accordion.component').then(
            (c) => c.AccordionComponent
          ),
      },
    ],
  },
  {
    path: 'visita-domiciliaria',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './friam-037/components/visita-domiciliaria-table/visita-domiciliaria-table.component'
          ).then((c) => c.VisitaDomiciliariaTableComponent),
      },
      {
        path: ':documento',
        loadComponent: () =>
          import('./friam-037/components/accordion/accordion.component').then(
            (c) => c.AccordionComponent
          ),
      },
    ],
  },
  {
    path: 'visitas-domiciliarias-seguimiento',
    loadComponent: () =>
      import(
        './friam-038/components/principal-page/principal-page.component'
      ).then((c) => c.PrincipalPageComponent),
  },
  {
    path: 'control-reenvase',
    loadComponent: () =>
      import(
        './friam-032/pages/control-reenvase-page/control-reenvase-page.component'
      ).then((c) => c.ControlReenvasePageComponent),
  },
];
