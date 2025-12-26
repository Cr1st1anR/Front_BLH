import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { IngresoLechePasteurizadaTableComponent } from "../../components/ingreso-leche-pasteurizada-table/ingreso-leche-pasteurizada-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { DosificacionesDialogComponent } from "../../components/dosificaciones-dialog/dosificaciones-dialog.component";
import type { FiltrosBusqueda } from '../../interfaces/ingreso-leche-pasteurizada.interface';
import type { IngresoLechePasteurizadaData } from '../../interfaces/ingreso-leche-pasteurizada.interface';

@Component({
  selector: 'ingreso-leche-pasteurizada-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    HeaderComponent,
    IngresoLechePasteurizadaTableComponent,
    MonthPickerComponent,
    NewRegisterButtonComponent,
    DosificacionesDialogComponent
  ],
  templateUrl: './ingreso-leche-pasteurizada-page.component.html',
  styleUrl: './ingreso-leche-pasteurizada-page.component.scss'
})
export class IngresoLechePasteurizadaPageComponent implements OnInit, AfterViewInit {

  @ViewChild(IngresoLechePasteurizadaTableComponent)
  private readonly tableComponent!: IngresoLechePasteurizadaTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  showDosificacionesDialog = false;
  selectedData: IngresoLechePasteurizadaData | null = null;

  filtrosBusqueda: FiltrosBusqueda = {
    n_frasco: '',
    n_donante: '',
    lote: ''
  };

  ngOnInit(): void {
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    this.esperarInicializacionTabla();
  }

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  aplicarFiltros(): void {
    this.tableComponent?.aplicarFiltrosBusqueda(this.filtrosBusqueda);
  }

  limpiarFiltros(): void {
    this.filtrosBusqueda = {
      n_frasco: '',
      n_donante: '',
      lote: ''
    };
    this.aplicarFiltros();
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  private prepararFiltroMesActual(): void {
    const fechaActual = new Date();
    this.filtroMesActualPendiente = {
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth() + 1
    };
  }

  private esperarInicializacionTabla(): void {
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

  private isTableReadyForFilter(): boolean {
    return !!(
      this.tableComponent &&
      this.tableComponent.isTableInitialized &&
      this.tableComponent.isTableInitialized()
    );
  }

  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
    this.isInitialized = true;
    this.filtroMesActualPendiente = null;
  }

  onDosificacionesClick(data: IngresoLechePasteurizadaData): void {
  if (this.tableComponent?.isAnyRowEditing()) {
    return;
  }

  this.selectedData = data;
  this.showDosificacionesDialog = true;
}

  onDosificacionesDialogClosed(): void {
    this.showDosificacionesDialog = false;
    this.selectedData = null;
  }

}
