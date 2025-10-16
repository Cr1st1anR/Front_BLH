import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { DialogExtraccionesComponent } from "../dialog-extracciones/dialog-extracciones.component";
import { NewRegisterButtonComponent } from "../table-leche-extraida/new-register-button/new-register-button.component";
import { TableLecheExtraidaComponent } from "../table-leche-extraida/table-leche-extraida.component";

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

  showDialog = false;
  selectedRowData: any = null;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  ngOnInit(): void {
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    this.esperarInicializacionTabla();
  }

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.hasNewRowInEditing || false;
  }

  crearNuevoRegistroLecheExtraida(): void {
    this.tableComponent?.crearNuevoRegistroLecheExtraida();
  }

  onRowClick(rowData: any): void {
    this.selectedRowData = rowData;
    this.showDialog = true;
  }

  onDialogClosed(): void {
    this.showDialog = false;
    this.selectedRowData = null;
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  private prepararFiltroMesActual(): void {
    const fechaActual = new Date();
    this.filtroMesActualPendiente = {
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth() + 1
    };
  }

  private esperarInicializacionTabla(): void {
    const checkInterval = 100;
    const maxTimeout = 5000;

    const intervalo = setInterval(() => {
      if (this.shouldApplyFilter()) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, checkInterval);

    setTimeout(() => {
      if (!this.isInitialized) {
        this.aplicarFiltroMesActual();
        clearInterval(intervalo);
      }
    }, maxTimeout);
  }

  private shouldApplyFilter(): boolean {
    return this.tableComponent && 
           this.tableComponent.dataLecheExtraida.length > 0 && 
           !this.isInitialized;
  }

  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) return;

    if (this.tableComponent && this.tableComponent.dataLecheExtraida.length > 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}