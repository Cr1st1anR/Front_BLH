import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { ControlTemperaturaTableComponent } from "../../components/control-temperatura-table/control-temperatura-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { CalentamientoDialogComponent } from "../../components/calentamiento-dialog/calentamiento-dialog.component";
import type { ControlTemperaturaData, TipoDialog } from '../../interfaces/control-temperatura.interface';
import { EnfriamientoDialogComponent } from "../../components/enfriamiento-dialog/enfriamiento-dialog.component";

@Component({
  selector: 'app-control-temperatura-page',
  imports: [
    HeaderComponent,
    ControlTemperaturaTableComponent,
    MonthPickerComponent,
    NewRegisterButtonComponent,
    CalentamientoDialogComponent,
    EnfriamientoDialogComponent
],
  templateUrl: './control-temperatura-page.component.html',
  styleUrl: './control-temperatura-page.component.scss'
})
export class ControlTemperaturaPageComponent implements OnInit, AfterViewInit {

  @ViewChild(ControlTemperaturaTableComponent)
  private readonly tableComponent!: ControlTemperaturaTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  showCalentamientoDialog = false;
  showEnfriamientoDialog = false;
  selectedControlTemperaturaData: ControlTemperaturaData | null = null;

  ngOnInit(): void {
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    this.esperarInicializacionTabla();
  }

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  onEyeClicked(event: { tipo: TipoDialog; data: ControlTemperaturaData }): void {
    if (this.tableComponent?.isAnyRowEditing()) {
      return;
    }

    this.selectedControlTemperaturaData = event.data;

    switch (event.tipo) {
      case 'calentamiento':
        this.showCalentamientoDialog = true;
        break;
      case 'enfriamiento':
        this.showEnfriamientoDialog = true;
        break;
    }
  }

  onCalentamientoDialogClosed(): void {
    this.showCalentamientoDialog = false;
    this.selectedControlTemperaturaData = null;
  }

  onEnfriamientoDialogClosed(): void {
    this.showEnfriamientoDialog = false;
    this.selectedControlTemperaturaData = null;
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
      this.tableComponent.dataControlTemperatura !== undefined &&
      !this.tableComponent.loading?.main
    );
  }

  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    if (this.tableComponent?.dataControlTemperatura?.length >= 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}
