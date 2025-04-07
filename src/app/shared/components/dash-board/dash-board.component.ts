import { Component, ViewChild } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-dash-board',
  imports: [
    DrawerModule, 
    ButtonModule,
    MenubarModule,
    AvatarModule,
    StyleClassModule,
    RippleModule
  ],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.scss'
})
export class DashBoardComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  showFiller = false;
  visible: boolean = false;
  selectedItem: any = null
  menuBarItems = [
    {
      label: 'Inicio',
      items: []
    },
    {
      label: 'Captacion',
      items: [
        { label: 'Registro de linea amiga', icon: '' , router :'/Regitro-linea-amiga'},
        { label: 'linea amiga', icon: '' },
        { label: 'amiga', icon: '' }
      ]
    },
    {
      label: 'Pasteurizacion',
      items: []
    }
  ]

  closeCallback(e:any): void {
    this.drawerRef.close(e);
  }
  onSelect(item: any) {
    this.selectedItem = item;
  }

}
