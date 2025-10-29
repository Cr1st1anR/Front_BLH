import { Component } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { EntregaLecheCrudaTableComponent } from "../../components/entrega-leche-cruda-table/entrega-leche-cruda-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";

@Component({
  selector: 'entrega-leche-cruda-page',
  imports: [HeaderComponent, EntregaLecheCrudaTableComponent, MonthPickerComponent],
  templateUrl: './entrega-leche-cruda-page.component.html',
  styleUrl: './entrega-leche-cruda-page.component.scss'
})
export class EntregaLecheCrudaPageComponent {

}
