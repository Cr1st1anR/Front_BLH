import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
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
export class PrincipalPageLecheExtraidaComponent implements OnInit, AfterViewInit {
  @ViewChild(TableLecheExtraidaComponent) tableComponent!: TableLecheExtraidaComponent;
  @ViewChild(MonthPickerComponent) monthPickerComponent!: MonthPickerComponent;

  // Estados del componente
  showDialog: boolean = false;
  selectedRowData: any = null;

  // ✅ NUEVO: Variable para controlar la inicialización
  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    // ✅ MODIFICADO: Solo preparar el filtro, no aplicarlo aún
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    // ✅ MODIFICADO: Esperar a que la tabla se inicialice y luego aplicar filtro
    this.esperarInicializacionTabla();
  }

  // ==================== GETTERS ====================

  /**
   * Obtener el estado de hasNewRowInEditing desde el componente de la tabla
   */
  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.hasNewRowInEditing || false;
  }

  // ==================== MÉTODOS PÚBLICOS ====================

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

  /**
   * Manejar cambio en el month picker
   */
  onMonthPickerChange(filtro: { year: number; month: number }): void {
    console.log('Month picker cambió:', filtro);
    
    if (this.tableComponent) {
      // Aplicar filtro por fecha
      this.tableComponent.filtrarPorFecha(filtro);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * ✅ MODIFICADO: Solo preparar el filtro del mes actual
   */
  private prepararFiltroMesActual(): void {
    const fechaActual = new Date();
    this.filtroMesActualPendiente = {
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth() + 1 // getMonth() retorna 0-11, necesitamos 1-12
    };
  }

  /**
   * ✅ NUEVO: Esperar a que la tabla esté inicializada antes de aplicar filtro
   */
  private esperarInicializacionTabla(): void {
    // Intentar aplicar el filtro cada 100ms hasta que la tabla esté lista
    const intervalo = setInterval(() => {
      if (this.tableComponent && this.tableComponent.dataLecheExtraida.length > 0 && !this.isInitialized) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, 100);

    // Timeout de seguridad: después de 5 segundos, aplicar de todas formas
    setTimeout(() => {
      if (!this.isInitialized) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, 5000);
  }

  /**
   * ✅ MODIFICADO: Aplicar filtro automático del mes actual
   */
  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) return;

    if (this.tableComponent && this.tableComponent.dataLecheExtraida.length > 0) {
      this.tableComponent.filtrarPorFecha(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null; // Limpiar
    }
  }
}