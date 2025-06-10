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
  styleUrl: './dash-board.component.scss'
})
export class DashBoardComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  showFiller = false;
  visible: boolean = false;
  selectedItem: any = null
  menuBarItems: MenuBarItems[] = [
    {
      label: 'Inicio',
      icon: 'fa-solid fa-house',
      route: '/blh',
      items: []
    },
    {
      label: 'Captacion',
      icon: 'fa-solid fa-users-viewfinder',
      items: [
        {
          label: 'Registro de linea amiga',
          subLabel: '(FRIAM-041)',
          route: '/blh/captacion/registro-linea-amiga'
        },
        { label: 'Ruta de recolección de leche humana cruda',
          subLabel: '(FRIAM-011)',
          route: '/blh/captacion/recoleccion-leche-humana-cruda'
        },
        { label: 'Registro de donante del banco de leche humana',
          subLabel: '(FRIAM-018)',
          route: '/blh/captacion/registro-donante-blh'
        }
      ]
    },
    {
      label: 'Pasteurizacion',
      icon: 'fa-solid fa-flask-vial',
      route: '/pasteurizacion',
      items: []
    },
    {
      label: 'Liberacion',
      icon: 'fa-solid fa-clipboard-list',
      route: '/liberacion',
      items: []
    }

  ]

  constructor(
    private router:Router
  ){

  }

  closeCallback(e:any): void {    
    this.drawerRef.close(e);
  }
  onSelect(item: any) {
    this.selectedItem = item;
  }

  singOut(){
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

}
