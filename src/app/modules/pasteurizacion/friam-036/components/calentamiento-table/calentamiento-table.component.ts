import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { CalentamientoService } from '../../services/calentamiento.service';
import type {
  CalentamientoData,
  CalentamientoBackendRequest,
  CalentamientoBackendResponse,
  TableColumn
} from '../../interfaces/calentamiento.interface';

@Component({
  selector: 'calentamiento-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    HttpClientModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './calentamiento-table.component.html',
  styleUrl: './calentamiento-table.component.scss',
  providers: [MessageService]
})
export class CalentamientoTableComponent implements OnInit, OnChanges {
  @Input() idControlTemperatura: number | null = null;

  @ViewChild('tableCalentamiento') table!: Table;

  loading: boolean = false;
  editingRow: CalentamientoData | null = null;
  clonedCalentamiento: { [s: string]: CalentamientoData } = {};

  dataCalentamiento: CalentamientoData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersCalentamiento: TableColumn[] = [
    { header: '0', field: 'temp_0', width: '80px', tipo: 'number' },
    { header: '5', field: 'temp_5', width: '80px', tipo: 'number' },
    { header: '10', field: 'temp_10', width: '80px', tipo: 'number' },
    { header: '15', field: 'temp_15', width: '80px', tipo: 'number' },
    { header: '20', field: 'temp_20', width: '80px', tipo: 'number' },
    { header: '25', field: 'temp_25', width: '80px', tipo: 'number' },
    { header: '30', field: 'temp_30', width: '80px', tipo: 'number' },
    { header: '35', field: 'temp_35', width: '80px', tipo: 'number' },
    { header: '40', field: 'temp_40', width: '80px', tipo: 'number' },
    { header: '45', field: 'temp_45', width: '80px', tipo: 'number' },
    { header: '50', field: 'temp_50', width: '80px', tipo: 'number' },
    { header: '55', field: 'temp_55', width: '80px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly calentamientoService: CalentamientoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idControlTemperatura) {
      this.loadDataCalentamiento();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idControlTemperatura']?.currentValue && !this.isInitialLoad) {
      this.loadDataCalentamiento();
    } else if (changes['idControlTemperatura']?.currentValue && this.isInitialLoad) {
      this.loadDataCalentamiento();
      this.isInitialLoad = false;
    }
  }

  loadDataCalentamiento(): void {
    if (!this.idControlTemperatura) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.calentamientoService.getCalentamientoByControlTemperatura(this.idControlTemperatura)
      .subscribe({
        next: (calentamientoBackend: CalentamientoBackendResponse | null) => {
          if (calentamientoBackend) {
            // Si hay datos, transformarlos
            this.dataCalentamiento = [this.transformarDatoBackendAFrontend(calentamientoBackend)];
            this.mostrarExito('Calentamiento cargado correctamente');
          } else {
            // Si no hay datos, crear fila vacía por defecto
            this.dataCalentamiento = [this.construirRegistroVacio()];
            this.mostrarInfo('No hay calentamiento registrado. Complete los campos.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.manejarErrorCarga(error);
        }
      });
  }

  private transformarDatoBackendAFrontend(calentamiento: CalentamientoBackendResponse): CalentamientoData {
    return {
      id: calentamiento.id,
      temp_0: calentamiento.temp_0,
      temp_5: calentamiento.temp_5,
      temp_10: calentamiento.temp_10,
      temp_15: calentamiento.temp_15,
      temp_20: calentamiento.temp_20,
      temp_25: calentamiento.temp_25,
      temp_30: calentamiento.temp_30,
      temp_35: calentamiento.temp_35,
      temp_40: calentamiento.temp_40,
      temp_45: calentamiento.temp_45,
      temp_50: calentamiento.temp_50,
      temp_55: calentamiento.temp_55,
      id_control_temperatura: calentamiento.controlTemperatura.id,
      isNew: false
    };
  }

  private construirRegistroVacio(): CalentamientoData {
    return {
      id: null,
      temp_0: null,
      temp_5: null,
      temp_10: null,
      temp_15: null,
      temp_20: null,
      temp_25: null,
      temp_30: null,
      temp_35: null,
      temp_40: null,
      temp_45: null,
      temp_50: null,
      temp_55: null,
      id_control_temperatura: this.idControlTemperatura!,
      isNew: true
    };
  }

  onRowEditInit(dataRow: CalentamientoData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: CalentamientoData, index: number, event: MouseEvent): void {
    if (!this.validarAlMenosUnCampo(dataRow)) {
      this.mostrarError('Debe ingresar al menos una temperatura');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionCalentamiento(dataRow, rowElement);
    } else {
      this.procesarActualizacionCalentamiento(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: CalentamientoData, index: number): void {
    if (dataRow.isNew) {
      // Si es nuevo y se cancela, restaurar la fila vacía
      this.dataCalentamiento[index] = this.construirRegistroVacio();
      this.dataCalentamiento = [...this.dataCalentamiento];
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private iniciarEdicionFila(dataRow: CalentamientoData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedCalentamiento[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionCalentamiento(dataRow: CalentamientoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.calentamientoService.postCalentamiento(datosParaBackend).subscribe({
      next: (response: CalentamientoBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionCalentamiento(dataRow: CalentamientoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.calentamientoService.putCalentamiento(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: CalentamientoData): CalentamientoBackendRequest {
    return {
      temp_0: dataRow.temp_0,
      temp_5: dataRow.temp_5,
      temp_10: dataRow.temp_10,
      temp_15: dataRow.temp_15,
      temp_20: dataRow.temp_20,
      temp_25: dataRow.temp_25,
      temp_30: dataRow.temp_30,
      temp_35: dataRow.temp_35,
      temp_40: dataRow.temp_40,
      temp_45: dataRow.temp_45,
      temp_50: dataRow.temp_50,
      temp_55: dataRow.temp_55,
      controlTemperatura: { id: this.idControlTemperatura! }
    };
  }

  private manejarExitoCreacion(dataRow: CalentamientoData, response: CalentamientoBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Calentamiento creado correctamente');
  }

  private manejarExitoActualizacion(dataRow: CalentamientoData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedCalentamiento[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Calentamiento actualizado correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear calentamiento:', error);
    this.mostrarError('Error al crear el calentamiento');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar calentamiento:', error);
    this.mostrarError('Error al actualizar el calentamiento');
  }

  private cancelarEdicionExistente(dataRow: CalentamientoData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataCalentamiento[index] = this.clonedCalentamiento[rowId];
    delete this.clonedCalentamiento[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarAlMenosUnCampo(dataRow: CalentamientoData): boolean {
    return !!(
      dataRow.temp_0 !== null || dataRow.temp_5 !== null ||
      dataRow.temp_10 !== null || dataRow.temp_15 !== null ||
      dataRow.temp_20 !== null || dataRow.temp_25 !== null ||
      dataRow.temp_30 !== null || dataRow.temp_35 !== null ||
      dataRow.temp_40 !== null || dataRow.temp_45 !== null ||
      dataRow.temp_50 !== null || dataRow.temp_55 !== null
    );
  }

  private getRowId(dataRow: CalentamientoData): string {
    return dataRow.id?.toString() || 'new';
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      // Si no hay datos, crear fila vacía
      this.dataCalentamiento = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay calentamiento registrado. Complete los campos.');
    } else {
      console.error('Error al cargar calentamiento:', error);
      this.mostrarError('Error al cargar el calentamiento');
    }
  }

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje, key: 'tr', life: 2000 });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarInfo(mensaje: string): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: mensaje, key: 'tr', life: 2000 });
  }
}
