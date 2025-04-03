import { Component, ViewChild } from "@angular/core";
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';


@Component({
  selector: 'app-dashboard',
  imports: [DrawerModule, ButtonModule, Ripple, AvatarModule, StyleClass],
  templateUrl: './dashboard.component.html',

})
export default class DashboardComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e:Event): void {
      this.drawerRef.close(e);
  }

  visible: boolean = false;
}
