import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { TableLecheExtraidaComponent } from "../table-leche-extraida/table-leche-extraida.component";
import { NewRegisterButtonComponent } from "../table-leche-extraida/new-register-button/new-register-button.component";
import { DialogExtraccionesComponent } from "../dialog-extracciones/dialog-extracciones.component";

@Component({
  selector: 'principal-page-leche-extraida',
  imports: [
    HeaderComponent,
    MonthPickerComponent,
    TableLecheExtraidaComponent,
    NewRegisterButtonComponent,
    DialogExtraccionesComponent
],
  templateUrl: './principal-page-leche-extraida.component.html',
  styleUrl: './principal-page-leche-extraida.component.scss',
})
export class PrincipalPageLecheExtraidaComponent {
  @ViewChild(TableLecheExtraidaComponent) tableComponent!: TableLecheExtraidaComponent;

  showDialog: boolean = false;
  selectedRowData: any = null;

  /**
   * Obtener el estado de hasNewRowInEditing desde el componente de la tabla
   */
  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.hasNewRowInEditing || false;
  }

  /**
   * Crear un nuevo registro delegando al componente de la tabla
   */
  crearNuevoRegistroLecheExtraida(): void {
    if (this.tableComponent) {
      this.tableComponent.crearNuevoRegistroLecheExtraida();
    }
  }

  /**
   * Manejar el click en una fila de la tabla
   */
  onRowClick(rowData: any): void {
    console.log('Fila seleccionada en principal-page:', rowData);
    this.selectedRowData = rowData;
    this.showDialog = true;
  }

  /**
   * Manejar el cierre del dialog
   */
  onDialogClosed(): void {
    this.showDialog = false;
    this.selectedRowData = null;
  }
}
