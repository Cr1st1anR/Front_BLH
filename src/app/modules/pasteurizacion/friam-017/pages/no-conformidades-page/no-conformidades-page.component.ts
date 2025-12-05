import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { NoConformidadesTableComponent } from "../../components/no-conformidades-table/no-conformidades-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
// import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import type { NoConformidadesData, FiltrosBusqueda } from '../../interfaces/no-conformidades.interface';
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";

@Component({
  selector: 'app-no-conformidades-page',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    HeaderComponent,
    NoConformidadesTableComponent,
    MonthPickerComponent,
    NewRegisterButtonComponent
],
  templateUrl: './no-conformidades-page.component.html',
  styleUrl: './no-conformidades-page.component.scss'
})
export class NoConformidadesPageComponent implements OnInit, AfterViewInit {

  @ViewChild(NoConformidadesTableComponent)
  private readonly tableComponent!: NoConformidadesTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  filtrosBusqueda: FiltrosBusqueda = {
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

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  aplicarFiltros(): void {
    this.tableComponent?.aplicarFiltrosBusqueda(this.filtrosBusqueda);
  }

  limpiarFiltros(): void {
    this.filtrosBusqueda = {
      lote: ''
    };
    this.aplicarFiltros();
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
      this.tableComponent.dataNoConformidades !== undefined &&
      !this.tableComponent.loading?.main
    );
  }

  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    if (this.tableComponent?.dataNoConformidades?.length >= 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}
