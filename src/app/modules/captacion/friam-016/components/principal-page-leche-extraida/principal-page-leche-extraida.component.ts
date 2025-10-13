import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { TableLecheExtraidaComponent } from "../table-leche-extraida/table-leche-extraida.component";
import { NewRegisterButtonComponent } from "../table-leche-extraida/new-register-button/new-register-button.component";

@Component({
  selector: 'principal-page-leche-extraida',
  imports: [HeaderComponent, MonthPickerComponent, TableLecheExtraidaComponent, NewRegisterButtonComponent],
  templateUrl: './principal-page-leche-extraida.component.html',
  styleUrl: './principal-page-leche-extraida.component.scss',
})
export class PrincipalPageLecheExtraidaComponent {
  @ViewChild(TableLecheExtraidaComponent) tableComponent!: TableLecheExtraidaComponent;

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
}
