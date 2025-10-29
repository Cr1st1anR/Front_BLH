import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { EntregaLecheCrudaTableComponent } from "../../components/entrega-leche-cruda-table/entrega-leche-cruda-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterButtonComponent } from "../../components/new-register-button/new-register-button.component";

@Component({
  selector: 'entrega-leche-cruda-page',
  imports: [
    HeaderComponent,
    EntregaLecheCrudaTableComponent,
    MonthPickerComponent,
    NewRegisterButtonComponent
  ],
  templateUrl: './entrega-leche-cruda-page.component.html',
  styleUrl: './entrega-leche-cruda-page.component.scss'
})
export class EntregaLecheCrudaPageComponent implements AfterViewInit {

  @ViewChild(EntregaLecheCrudaTableComponent) tableComponent!: EntregaLecheCrudaTableComponent;

  ngAfterViewInit(): void {
  }

  /**
   * Indica si hay alguna fila nueva siendo editada en la tabla
   */
  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  /**
   * Delega la creación de un nuevo registro a la tabla
   */
  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }
}
