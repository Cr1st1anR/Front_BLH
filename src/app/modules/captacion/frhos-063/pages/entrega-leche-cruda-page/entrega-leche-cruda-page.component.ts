import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
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
export class EntregaLecheCrudaPageComponent implements OnInit, AfterViewInit {

  @ViewChild(EntregaLecheCrudaTableComponent)
  private readonly tableComponent!: EntregaLecheCrudaTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

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
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  /**
   * Delega la creación de un nuevo registro a la tabla
   */
  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
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
    // Verificar periódicamente si la tabla está lista
    const interval = setInterval(() => {
      if (this.isTableReadyForFilter()) {
        this.aplicarFiltroMesActual();
        clearInterval(interval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      if (!this.isInitialized) {
        console.warn('Timeout: No se pudo aplicar el filtro inicial del mes actual');
      }
    }, 5000);
  }

  /**
   * Verifica si la tabla está lista para aplicar filtros
   */
  private isTableReadyForFilter(): boolean {
    return !!(
      this.tableComponent &&
      this.tableComponent.dataEntregaLecheCruda &&
      this.tableComponent.dataEntregaLecheCruda.length >= 0 &&
      !this.tableComponent.loading
    );
  }

  /**
   * Aplica el filtro del mes actual a la tabla si está disponible
   */
  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    if (this.tableComponent?.dataEntregaLecheCruda?.length >= 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}
