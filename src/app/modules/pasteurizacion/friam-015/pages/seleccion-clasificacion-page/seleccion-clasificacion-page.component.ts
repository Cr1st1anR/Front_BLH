import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { SeleccionClasificacionTableComponent } from "../../components/seleccion-clasificacion-table/seleccion-clasificacion-table.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { AnalisisSensorialDialogComponent } from "../../components/analisis-sensorial-dialog/analisis-sensorial-dialog.component";
import { AcidezDornicDialogComponent } from "../../components/acidez-dornic-dialog/acidez-dornic-dialog.component";

import type { TipoDialog, FiltrosBusqueda, SeleccionClasificacionData } from '../../interfaces/seleccion-clasificacion.interface';
import { CrematocritoDialogComponent } from "../../components/crematocrito-dialog/crematocrito-dialog.component";

@Component({
  selector: 'seleccion-clasificacion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    HeaderComponent,
    SeleccionClasificacionTableComponent,
    MonthPickerComponent,
    AnalisisSensorialDialogComponent,
    AcidezDornicDialogComponent,
    CrematocritoDialogComponent
  ],
  templateUrl: './seleccion-clasificacion-page.component.html',
  styleUrl: './seleccion-clasificacion-page.component.scss'
})
export class SeleccionClasificacionPageComponent implements OnInit, AfterViewInit {

  @ViewChild(SeleccionClasificacionTableComponent)
  private readonly tableComponent!: SeleccionClasificacionTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  private isInitialized = false;
  private filtroMesActualPendiente: { year: number; month: number } | null = null;

  filtrosBusqueda: FiltrosBusqueda = {
    no_frasco_procesado: '',
    donante: '',
    frasco_leche_cruda: '',
    ciclo: '',
    lote: ''
  };

  showAnalisisSensorialDialog = false;
  showAcidezDornicDialog = false;
  showCrematocritoDialog = false;
  selectedData: SeleccionClasificacionData | null = null;

  ngOnInit(): void {
    this.prepararFiltroMesActual();
  }

  ngAfterViewInit(): void {
    this.esperarInicializacionTabla();
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  aplicarFiltros(): void {
    this.tableComponent?.aplicarFiltrosBusqueda(this.filtrosBusqueda);
  }

  limpiarFiltros(): void {
    this.filtrosBusqueda = {
      no_frasco_procesado: '',
      donante: '',
      frasco_leche_cruda: '',
      ciclo: '',
      lote: ''
    };
    this.aplicarFiltros();
  }

  onEyeClicked(event: { tipo: TipoDialog; data: SeleccionClasificacionData }): void {
    if (this.tableComponent?.isAnyRowEditing()) {
      return;
    }

    this.selectedData = event.data;

    switch (event.tipo) {
      case 'analisis_sensorial':
        this.showAnalisisSensorialDialog = true;
        break;
      case 'acidez_dornic':
        this.showAcidezDornicDialog = true;
        break;
      case 'crematocrito':
        this.showCrematocritoDialog = true;
        break;
    }
  }

  onAnalisisSensorialDialogClosed(): void {
    this.showAnalisisSensorialDialog = false;
    this.selectedData = null;
  }

  onAcidezDornicDialogClosed(): void {
    this.showAcidezDornicDialog = false;
    this.selectedData = null;
  }

  onCrematocritoDialogClosed(): void {
    this.showCrematocritoDialog = false;
    this.selectedData = null;
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
      this.tableComponent.dataSeleccionClasificacion !== undefined &&
      !this.tableComponent.loading?.main
    );
  }

  private aplicarFiltroMesActual(): void {
    if (this.isInitialized || !this.filtroMesActualPendiente) {
      return;
    }

    if (this.tableComponent?.dataSeleccionClasificacion?.length >= 0) {
      this.tableComponent.aplicarFiltroInicialConNotificacion(this.filtroMesActualPendiente);
      this.isInitialized = true;
      this.filtroMesActualPendiente = null;
    }
  }
}
