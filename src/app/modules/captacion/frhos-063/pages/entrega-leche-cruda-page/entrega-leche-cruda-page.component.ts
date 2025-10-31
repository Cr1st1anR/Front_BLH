import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { MonthPickerComponent } from 'src/app/shared/components/month-picker/month-picker.component';
import { EntregaLecheCrudaTableComponent } from '../../components/entrega-leche-cruda-table/entrega-leche-cruda-table.component';
import { NewRegisterButtonComponent } from '../../components/new-register-button/new-register-button.component';

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

  get hasNewRowInEditing(): boolean {
    return this.tableComponent?.isAnyRowEditing() ?? false;
  }

  crearNuevoRegistro(): void {
    this.tableComponent?.crearNuevoRegistro();
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
    const interval = setInterval(() => {
      if (this.isTableReadyForFilter()) {
        this.aplicarFiltroMesActual();
        clearInterval(interval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  }

  private isTableReadyForFilter(): boolean {
    return !!(
      this.tableComponent &&
      this.tableComponent.dataEntregaLecheCruda &&
      this.tableComponent.dataEntregaLecheCruda.length >= 0 &&
      !this.tableComponent.loading
    );
  }

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
