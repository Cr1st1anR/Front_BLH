import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { DialogExtraccionesComponent } from "../dialog-extracciones/dialog-extracciones.component";
import { NewRegisterButtonComponent } from "../table-leche-extraida/new-register-button/new-register-button.component";
import { TableLecheExtraidaComponent } from "../table-leche-extraida/table-leche-extraida.component";
import type { LecheExtraidaTable } from '../interfaces/leche-extraida-table.interface';

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
export class PrincipalPageLecheExtraidaComponent implements OnInit, AfterViewInit {
  @ViewChild(TableLecheExtraidaComponent)
  private readonly tableComponent!: TableLecheExtraidaComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  showDialog = false;
  selectedRowData: LecheExtraidaTable | null = null;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  ngOnInit(): void {
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    this.esperarInicializacionTabla();
  }

  /**
   * Indica si hay alguna fila nueva siendo editada en la tabla
   */
  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.hasNewRowInEditing || false;
  }

  /**
   * Delega la creación de un nuevo registro a la tabla
   */
  crearNuevoRegistroLecheExtraida(): void {
    this.tableComponent?.crearNuevoRegistroLecheExtraida();
  }

  /**
   * Maneja el click en una fila para abrir el diálogo de extracciones
   */
  onRowClick(rowData: LecheExtraidaTable): void {
    this.selectedRowData = { ...rowData };
    this.showDialog = true;
  }

  /**
   * Cierra el diálogo de extracciones y limpia los datos seleccionados
   */
  onDialogClosed(): void {
    this.showDialog = false;
    this.selectedRowData = null;
  }

  /**
   * Aplica el filtro de mes seleccionado en el month picker
   */
  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  /**
   * Prepara el filtro de mes actual para aplicar cuando la tabla esté lista
   */
  private prepararFiltroMesActual(): void {
    const fechaActual = new Date();
    this.filtroMesActualPendiente = {
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth() + 1
    };
  }

  /**
   * Espera a que la tabla se inicialice y aplica el filtro del mes actual
   */
  private esperarInicializacionTabla(): void {
    const CHECK_INTERVAL = 100;
    const MAX_TIMEOUT = 5000;

    const intervalo = setInterval(() => {
      if (this.isTableReadyForFilter()) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, CHECK_INTERVAL);

    setTimeout(() => {
      if (!this.isInitialized) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, MAX_TIMEOUT);
  }

  /**
   * Verifica si la tabla está lista para aplicar filtros
   */
  private isTableReadyForFilter(): boolean {
    return !!(
      this.tableComponent &&
      this.tableComponent.dataLecheExtraida.length > 0 &&
      !this.isInitialized
    );
  }

  /**
   * Aplica el filtro del mes actual a la tabla si está disponible
   */
  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    if (this.tableComponent?.dataLecheExtraida.length > 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}
