import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { CommonModule } from '@angular/common';

interface MenuBarItems {
  icon?: string;
  label: string;
  route?: string;
  subLabel?: string;
  items?: MenuBarItems[];
  isOpen?: boolean;
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
    CommonModule,
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
      isOpen: false,
    },
    {
      label: 'Captación',
      icon: 'fa-solid fa-users-viewfinder',
      isOpen: false,
      items: [
        {
          label: 'Registro de linea amiga',
          route: '/blh/captacion/registro-linea-amiga',
        },
        {
          label: 'Ruta de recolección de leche humana cruda',
          route: '/blh/captacion/recoleccion-leche-humana-cruda',
        },
        {
          label: 'Registro de donante del banco de leche humana',
          route: '/blh/captacion/registro-donante-blh',
        },
        {
          label: 'Visita domiciliaria de ingreso para madres donantes del programa blh',
          route: '/blh/captacion/visita-domiciliaria',
        },
        {
          label: 'Visitas domiciliarias de seguimiento para madres donantes del programa blh',
          route: '/blh/captacion/visitas-domiciliarias-seguimiento',
        },
        {
          label: 'Control de entradas y salidas de leche humana extraída cruda',
          route: '/blh/captacion/control-leche-cruda'
        },
        {
          label: 'Registro de leche materna extraída en sala de extracción de blh',
          route: '/blh/captacion/registro-leche-extraida',
        },
        {
          label: 'Entrega de leche humana cruda a sala de distribución blh',
          route: '/blh/captacion/entrega-leche-cruda',
        },
      ],
    },
    {
      label: 'Pasteurización',
      icon: 'fa-solid fa-flask-vial',
      isOpen: false,
      items: [
        {
          label: 'Control de reenvase red colombiana de bancos de leche humana',
          route: '/blh/pasteurizacion/control-reenvase',
        },
        {
          label: 'Selección y clasificación de leche humana extraída cruda',
          route: '/blh/pasteurizacion/seleccion-clasificacion-leche-cruda',
        },
        {
          label: 'Control de temperatura del pasteurizador blh',
          route: '/blh/pasteurizacion/control-temperatura-pasteurizador',
        },
        {
          label: 'Registro diario de no conformidades',
          route: '/blh/pasteurizacion/registro-no-conformidades',
        },
        {
          label: 'Relación de control de calidad microbiológico y liberación de producto',
          route: '/blh/pasteurizacion/control-calidad-microbiologico-liberacion',
        },
      ],
    },
    {
      label: 'Liberación',
      icon: 'fa-solid fa-clipboard-list',
      isOpen: false,
      items: [
        {
          label: 'Control de entradas y salidas de leche humana extraída pasteurizada',
          route: '/blh/liberacion/entradas-salidas-pasteurizada',
        },
      ],
    },
    {
      label: 'Distribución',
      icon: 'fa-solid fa-share',
      isOpen: false,
      items: [
        {
          label: 'Distribución de leche humana procesada blh',
          route: '/blh/distribucion/distribucion-leche-procesada',
        },
        {
          label: 'Registro de ingreso de leche humana pasteurizada',
          route: '/blh/distribucion/ingreso-leche-pasteurizada',
        },
      ],
    },
    {
      label: 'Curvas',
      icon: 'fa-solid fa-chart-area',
      isOpen: false,
      items: [
        {
          label: 'Construcción de curvas de penetración de calor y enfriamiento',
          route: '/blh/curvas/construccion-curvas',
        },
      ],
    },
  ];

  constructor(private router: Router) { }

  toggleModule(item: MenuBarItems): void {
    if (item.items && item.items.length > 0) {
      this.menuBarItems.forEach(menuItem => {
        if (menuItem !== item) {
          menuItem.isOpen = false;
        }
      });

      item.isOpen = !item.isOpen;
    } else {
      this.menuBarItems.forEach(menuItem => {
        menuItem.isOpen = false;
      });
    }
  }

  shouldShowSubitems(item: MenuBarItems): boolean {
    return item.isOpen ?? false;
  }

  closeCallback(e: any): void {
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
