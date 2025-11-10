import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
interface MenuBarItems {
  icon?: string;
  label: string;
  route?: string;
  subLabel?: string;
  items?: MenuBarItems[];
}

@Component({
  selector: 'app-dash-board',
  imports: [
    DrawerModule,
    ButtonModule,
    MenubarModule,
    AvatarModule,
    StyleClassModule,
    RippleModule,
    RouterLink,
  ],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.scss',
})
export class DashBoardComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  showFiller = false;
  visible: boolean = false;
  selectedItem: any = null;
  menuBarItems: MenuBarItems[] = [
    {
      label: 'Inicio',
      icon: 'fa-solid fa-house',
      route: '/blh',
      items: [],
    },
    {
      label: 'Captacion',
      icon: 'fa-solid fa-users-viewfinder',
      items: [
        {
          label: 'Registro de linea amiga',
          subLabel: '(FRIAM-041)',
          route: '/blh/captacion/registro-linea-amiga',
        },
        {
          label: 'Ruta de recolección de leche humana cruda',
          subLabel: '(FRIAM-011)',
          route: '/blh/captacion/recoleccion-leche-humana-cruda',
        },
        {
          label: 'Registro de donante del banco de leche humana',
          subLabel: '(FRIAM-018)',
          route: '/blh/captacion/registro-donante-blh',
        },
        {
          label: 'Visita domiciliaria de ingreso para madres donantes del programa blh',
          subLabel: '(FRIAM-037)',
          route: '/blh/captacion/visita-domiciliaria',
        },
        {
          label: 'Visitas domiciliarias de seguimiento para madres donantes del programa blh',
          subLabel: '(FRIAM-038)',
          route: '/blh/captacion/visitas-domiciliarias-seguimiento',
        },
        { label: 'Control de entradas y salidas de leche humana extraida cruda',
          subLabel: '(FRIAM-012)',
          route: '/blh/captacion/control-leche-cruda'
        },
        {
          label: 'Registro de leche materna extraida en sala de extracción de blh',
          subLabel: '(FRIAM-016)',
          route: '/blh/captacion/registro-leche-extraida',
        },
        {
          label: 'Entrega de leche humana cruda a sala de distribución blh',
          subLabel: '(FRHOS-063)',
          route: '/blh/captacion/entrega-leche-cruda',
        },
      ],
    },
    {
      label: 'Pasteurizacion',
      icon: 'fa-solid fa-flask-vial',
      route: '/pasteurizacion',
      items: [
        {
          label: 'Control de reenvase red colombiana de bancos de leche humana',
          subLabel: '(FRIAM-032)',
          route: '/blh/pasteurizacion/control-reenvase',
        },
      ],
    },
    {
      label: 'Liberacion',
      icon: 'fa-solid fa-clipboard-list',
      route: '/liberacion',
      items: [],
    },
  ];

  constructor(private router: Router) { }

  closeCallback(e: any): void {
    console.log(e);

    this.drawerRef.close(e);
  }
  onSelect(item: any) {
    this.selectedItem = item;
  }

  singOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
