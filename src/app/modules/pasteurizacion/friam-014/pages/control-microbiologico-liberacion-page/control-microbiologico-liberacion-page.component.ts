import { Component } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { ControlMicrobiologicoLiberacionTableComponent } from "../../components/control-microbiologico-liberacion-table/control-microbiologico-liberacion-table.component";

@Component({
  selector: 'control-microbiologico-liberacion-page',
  imports: [HeaderComponent, ControlMicrobiologicoLiberacionTableComponent],
  templateUrl: './control-microbiologico-liberacion-page.component.html',
  styleUrl: './control-microbiologico-liberacion-page.component.scss'
})
export class ControlMicrobiologicoLiberacionPageComponent {

}
