import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { EntradasSalidasPasteurizadaTableComponent } from '../../components/entradas-salidas-pasteurizada-table/entradas-salidas-pasteurizada-table.component';
import type { FiltrosBusqueda, BusquedaLote } from '../../interfaces/entradas-salidas-pasteurizada.interface';

@Component({
  selector: 'entradas-salidas-pasteurizada-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    HeaderComponent,
    MonthPickerComponent,
    EntradasSalidasPasteurizadaTableComponent
  ],
  templateUrl: './entradas-salidas-pasteurizada-page.component.html',
  styleUrl: './entradas-salidas-pasteurizada-page.component.scss'
})
export class EntradasSalidasPasteurizadaPageComponent implements OnInit, AfterViewInit {

  @ViewChild(EntradasSalidasPasteurizadaTableComponent)
  private readonly tableComponent!: EntradasSalidasPasteurizadaTableComponent;

  @ViewChild(MonthPickerComponent)
  private readonly monthPickerComponent!: MonthPickerComponent;

  private isInitialized = false;

  filtrosBusqueda: FiltrosBusqueda = {
    n_frasco_pasteurizado: '',
    donante: '',
    n_gaveta: ''
  };

  busquedaLote: BusquedaLote = {
    lote: ''
  };

  ngOnInit(): void {
    // NO preparar filtro inicial automático
  }

  ngAfterViewInit(): void {
    // NO aplicar filtro automático al iniciar
    this.isInitialized = true;
  }

  onMonthPickerChange(filtro: { year: number; month: number }): void {
    this.tableComponent?.filtrarPorFecha(filtro);
  }

  aplicarFiltros(): void {
    this.tableComponent?.aplicarFiltrosBusqueda(this.filtrosBusqueda);
  }

  limpiarFiltros(): void {
    this.filtrosBusqueda = {
      n_frasco_pasteurizado: '',
      donante: '',
      n_gaveta: ''
    };
    this.aplicarFiltros();
  }

  buscarPorLote(): void {
    const lote = parseInt(String(this.busquedaLote.lote || '').trim());

    if (!lote || isNaN(lote) || lote <= 0) {
      return;
    }

    this.tableComponent?.buscarPorLote(lote);
  }

  limpiarBusquedaLote(): void {
    this.busquedaLote = { lote: '' };
    this.tableComponent?.limpiarBusquedaLote();
  }

  get loadingSearch(): boolean {
    return this.tableComponent?.loading.search || false;
  }
}
