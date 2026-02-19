import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

interface MenuBarItems {
  icon?: string;
  label: string;
  route?: string;
  subLabel?: string;
  items?: MenuBarItems[];
  isOpen?: boolean;
  roles?: string[];
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
    ConfirmDialogModule,
    MenuModule,
    BadgeModule,
    TooltipModule,
  ],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.scss',
  providers: [ConfirmationService],
})
export class DashBoardComponent implements OnInit {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  showFiller = false;
  visible: boolean = false;
  selectedItem: any = null;
  userRole: string | null = null;
  username: string | null = null;
  userMenuVisible: boolean = false;
  userMenuItems: MenuItem[] = [];

  allMenuItems: MenuBarItems[] = [
    {
      label: 'Inicio',
      icon: 'fa-solid fa-house',
      route: '/blh',
      items: [],
      isOpen: false,
      roles: ['Administrador', 'Auxiliar'],
    },
    {
      label: 'Captación',
      icon: 'fa-solid fa-users-viewfinder',
      isOpen: false,
      roles: ['Administrador', 'Auxiliar'],
      items: [
        {
          label: 'Registro de línea amiga',
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
      roles: ['Administrador'],
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
      roles: ['Administrador'],
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
      roles: ['Administrador'],
      items: [
        {
          label: 'Distribución de leche humana procesada blh',
          route: '/blh/distribucion/distribucion-leche-procesada',
        },
        {
          label: 'Registro de ingreso de leche humana pasteurizada a sala de pasteurización',
          route: '/blh/distribucion/ingreso-leche-pasteurizada',
        },
      ],
    },
    {
      label: 'Curvas',
      icon: 'fa-solid fa-chart-area',
      isOpen: false,
      roles: ['Administrador'],
      items: [
        {
          label: 'Construcción de curvas de penetración de calor y enfriamiento',
          route: '/blh/curvas/construccion-curvas',
        },
      ],
    },
  ];

  menuBarItems: MenuBarItems[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getRoleFromToken();
    this.username = this.authService.getUsernameFromToken();
    this.filterMenuByRole();
    this.initUserMenu();
  }

  /**
   * Inicializa el menú de usuario con estructura simplificada
   */
  initUserMenu() {
    this.userMenuItems = [
      {
        label: this.username || 'Usuario',
        icon: 'pi pi-user',
        disabled: true,
        badge: this.userRole || undefined,
        styleClass: 'user-info-item'
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        styleClass: 'logout-item',
        command: () => {
          this.confirmLogout();
        }
      }
    ];

    console.log('User menu initialized:', this.userMenuItems);
  }

  /**
   * Muestra el diálogo de confirmación antes de cerrar sesión
   */
  confirmLogout() {
    console.log('confirmLogout called');
    this.confirmationService.confirm({
      header: '¿Cerrar sesión?',
      message: '¿Está seguro que desea cerrar su sesión actual?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar sesión',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
      accept: () => {
        this.singOut();
      }
    });
  }

  filterMenuByRole() {
    if (!this.userRole) {
      this.menuBarItems = [];
      return;
    }

    this.menuBarItems = this.allMenuItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return item.roles.includes(this.userRole!);
    });
  }

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
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /**
   * Obtiene las iniciales del usuario para mostrar en el avatar
   */
  getUserInitials(): string {
    if (!this.username) return 'U';

    const parts = this.username.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.username.substring(0, 2).toUpperCase();
  }

  /**
   * Obtiene un color consistente basado en el nombre de usuario
   */
  getAvatarColor(): string {
    if (!this.username) return '#224186';

    const colors = [
      '#224186', // Azul institucional
      '#456dc4', // Azul claro
      '#2563eb', // Azul
      '#7c3aed', // Púrpura
      '#059669', // Verde
      '#dc2626', // Rojo
    ];

    const index = this.username.length % colors.length;
    return colors[index];
  }
}
