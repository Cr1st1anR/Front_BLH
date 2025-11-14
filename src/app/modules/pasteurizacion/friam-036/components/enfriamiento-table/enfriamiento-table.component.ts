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

import { EnfriamientoService } from '../../services/enfriamiento.service';
import type {
  EnfriamientoData,
  EnfriamientoBackendRequest,
  EnfriamientoBackendResponse,
  TableColumn
} from '../../interfaces/enfriamiento.interface';

@Component({
  selector: 'enfriamiento-table',
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
  templateUrl: './enfriamiento-table.component.html',
  styleUrl: './enfriamiento-table.component.scss',
  providers: [MessageService]
})
export class EnfriamientoTableComponent implements OnInit, OnChanges {
  @Input() idControlTemperatura: number | null = null;

  @ViewChild('tableEnfriamiento') table!: Table;

  loading: boolean = false;
  editingRow: EnfriamientoData | null = null;
  clonedEnfriamiento: { [s: string]: EnfriamientoData } = {};

  dataEnfriamiento: EnfriamientoData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersEnfriamiento: TableColumn[] = [
    { header: '0', field: 'temp_0', width: '100px', tipo: 'number' },
    { header: '5', field: 'temp_5', width: '100px', tipo: 'number' },
    { header: '10', field: 'temp_10', width: '100px', tipo: 'number' },
    { header: '15', field: 'temp_15', width: '100px', tipo: 'number' },
    { header: '20', field: 'temp_20', width: '100px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly enfriamientoService: EnfriamientoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idControlTemperatura) {
      this.loadDataEnfriamiento();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idControlTemperatura']?.currentValue && !this.isInitialLoad) {
      this.loadDataEnfriamiento();
    } else if (changes['idControlTemperatura']?.currentValue && this.isInitialLoad) {
      this.loadDataEnfriamiento();
      this.isInitialLoad = false;
    }
  }

  loadDataEnfriamiento(): void {
    if (!this.idControlTemperatura) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.enfriamientoService.getEnfriamientoByControlTemperatura(this.idControlTemperatura)
      .subscribe({
        next: (enfriamientoBackend: EnfriamientoBackendResponse | null) => {
          if (enfriamientoBackend) {
            // Si hay datos, transformarlos
            this.dataEnfriamiento = [this.transformarDatoBackendAFrontend(enfriamientoBackend)];
            this.mostrarExito('Enfriamiento cargado correctamente');
          } else {
            // Si no hay datos, crear fila vacía por defecto
            this.dataEnfriamiento = [this.construirRegistroVacio()];
            this.mostrarInfo('No hay enfriamiento registrado. Complete los campos.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.manejarErrorCarga(error);
        }
      });
  }

  private transformarDatoBackendAFrontend(enfriamiento: EnfriamientoBackendResponse): EnfriamientoData {
    return {
      id: enfriamiento.id,
      temp_0: enfriamiento.temp_0,
      temp_5: enfriamiento.temp_5,
      temp_10: enfriamiento.temp_10,
      temp_15: enfriamiento.temp_15,
      temp_20: enfriamiento.temp_20,
      id_control_temperatura: enfriamiento.controlTemperatura.id,
      isNew: false
    };
  }

  private construirRegistroVacio(): EnfriamientoData {
    return {
      id: null,
      temp_0: null,
      temp_5: null,
      temp_10: null,
      temp_15: null,
      temp_20: null,
      id_control_temperatura: this.idControlTemperatura!,
      isNew: true
    };
  }

  onRowEditInit(dataRow: EnfriamientoData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: EnfriamientoData, index: number, event: MouseEvent): void {
    if (!this.validarAlMenosUnCampo(dataRow)) {
      this.mostrarError('Debe ingresar al menos una temperatura');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionEnfriamiento(dataRow, rowElement);
    } else {
      this.procesarActualizacionEnfriamiento(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: EnfriamientoData, index: number): void {
    if (dataRow.isNew) {
      // Si es nuevo y se cancela, restaurar la fila vacía
      this.dataEnfriamiento[index] = this.construirRegistroVacio();
      this.dataEnfriamiento = [...this.dataEnfriamiento];
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private iniciarEdicionFila(dataRow: EnfriamientoData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedEnfriamiento[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionEnfriamiento(dataRow: EnfriamientoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.enfriamientoService.postEnfriamiento(datosParaBackend).subscribe({
      next: (response: EnfriamientoBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionEnfriamiento(dataRow: EnfriamientoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.enfriamientoService.putEnfriamiento(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: EnfriamientoData): EnfriamientoBackendRequest {
    return {
      temp_0: dataRow.temp_0,
      temp_5: dataRow.temp_5,
      temp_10: dataRow.temp_10,
      temp_15: dataRow.temp_15,
      temp_20: dataRow.temp_20,
      controlTemperatura: { id: this.idControlTemperatura! }
    };
  }

  private manejarExitoCreacion(dataRow: EnfriamientoData, response: EnfriamientoBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Enfriamiento creado correctamente');
  }

  private manejarExitoActualizacion(dataRow: EnfriamientoData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedEnfriamiento[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Enfriamiento actualizado correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear enfriamiento:', error);
    this.mostrarError('Error al crear el enfriamiento');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar enfriamiento:', error);
    this.mostrarError('Error al actualizar el enfriamiento');
  }

  private cancelarEdicionExistente(dataRow: EnfriamientoData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataEnfriamiento[index] = this.clonedEnfriamiento[rowId];
    delete this.clonedEnfriamiento[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarAlMenosUnCampo(dataRow: EnfriamientoData): boolean {
    return !!(
      dataRow.temp_0 !== null || dataRow.temp_5 !== null ||
      dataRow.temp_10 !== null || dataRow.temp_15 !== null ||
      dataRow.temp_20 !== null
    );
  }

  private getRowId(dataRow: EnfriamientoData): string {
    return dataRow.id?.toString() || 'new';
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      // Si no hay datos, crear fila vacía
      this.dataEnfriamiento = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay enfriamiento registrado. Complete los campos.');
    } else {
      console.error('Error al cargar enfriamiento:', error);
      this.mostrarError('Error al cargar el enfriamiento');
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
