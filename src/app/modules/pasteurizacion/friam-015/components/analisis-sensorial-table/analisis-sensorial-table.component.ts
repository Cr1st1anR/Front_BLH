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

import { AnalisisSensorialService } from '../../services/analisis-sensorial.service';
import type {
  AnalisisSensorialData,
  AnalisisSensorialBackendRequest,
  AnalisisSensorialBackendResponse,
  TableColumn
} from '../../interfaces/analisis-sensorial.interface';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'analisis-sensorial-table',
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
    TooltipModule,
    RadioButtonModule
  ],
  templateUrl: './analisis-sensorial-table.component.html',
  styleUrl: './analisis-sensorial-table.component.scss',
  providers: [MessageService]
})
export class AnalisisSensorialTableComponent implements OnInit, OnChanges {
  @Input() idSeleccionClasificacion: number | null = null;

  @ViewChild('tableAnalisisSensorial') table!: Table;

  loading: boolean = false;
  editingRow: AnalisisSensorialData | null = null;
  clonedAnalisisSensorial: { [s: string]: AnalisisSensorialData } = {};

  dataAnalisisSensorial: AnalisisSensorialData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersAnalisisSensorial: TableColumn[] = [
    { header: 'EMBALAJE', field: 'embalaje', width: '200px', tipo: 'text' },
    { header: 'SUCIEDAD', field: 'suciedad', width: '200px', tipo: 'text' },
    { header: 'COLOR', field: 'color', width: '200px', tipo: 'text' },
    { header: 'FLAVOR', field: 'flavor', width: '200px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly analisisSensorialService: AnalisisSensorialService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idSeleccionClasificacion) {
      this.loadDataAnalisisSensorial();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idSeleccionClasificacion']?.currentValue && !this.isInitialLoad) {
      this.loadDataAnalisisSensorial();
    } else if (changes['idSeleccionClasificacion']?.currentValue && this.isInitialLoad) {
      this.loadDataAnalisisSensorial();
      this.isInitialLoad = false;
    }
  }

  loadDataAnalisisSensorial(): void {
    if (!this.idSeleccionClasificacion) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.analisisSensorialService.getAnalisisSensorialBySeleccionClasificacion(this.idSeleccionClasificacion)
      .subscribe({
        next: (analisisBackend: AnalisisSensorialBackendResponse | null) => {
          if (analisisBackend) {
            // Si hay datos, transformarlos
            this.dataAnalisisSensorial = [this.transformarDatoBackendAFrontend(analisisBackend)];
            this.mostrarExito('Análisis sensorial cargado correctamente');
          } else {
            // Si no hay datos, crear fila vacía por defecto
            this.dataAnalisisSensorial = [this.construirRegistroVacio()];
            this.mostrarInfo('No hay análisis sensorial registrado. Complete los campos.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.manejarErrorCarga(error);
        }
      });
  }

  getDisplayValue(value: number | null): string {
    if (value === null) return 'Sin selección';
    return value === 1 ? 'C' : 'NC'; // C = 1 (Conforme), NC = 0 (No Conforme)
  }

  private transformarDatoBackendAFrontend(analisis: AnalisisSensorialBackendResponse): AnalisisSensorialData {
    return {
      id: analisis.id,
      embalaje: analisis.embalaje,
      suciedad: analisis.suciedad,
      color: analisis.color,
      flavor: analisis.flavor,
      id_seleccion_clasificacion: analisis.seleccionClasificacion.id,
      isNew: false
    };
  }

  private construirRegistroVacio(): AnalisisSensorialData {
    return {
      id: null,
      embalaje: null,
      suciedad: null,
      color: null,
      flavor: null,
      id_seleccion_clasificacion: this.idSeleccionClasificacion!,
      isNew: true
    };
  }

  onRowEditInit(dataRow: AnalisisSensorialData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: AnalisisSensorialData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionAnalisis(dataRow, rowElement);
    } else {
      this.procesarActualizacionAnalisis(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: AnalisisSensorialData, index: number): void {
    if (dataRow.isNew) {
      this.dataAnalisisSensorial[index] = this.construirRegistroVacio();
      this.dataAnalisisSensorial = [...this.dataAnalisisSensorial];
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private iniciarEdicionFila(dataRow: AnalisisSensorialData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedAnalisisSensorial[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionAnalisis(dataRow: AnalisisSensorialData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.analisisSensorialService.postAnalisisSensorial(datosParaBackend).subscribe({
      next: (response: AnalisisSensorialBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionAnalisis(dataRow: AnalisisSensorialData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.analisisSensorialService.putAnalisisSensorial(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: AnalisisSensorialData): AnalisisSensorialBackendRequest {
    return {
      embalaje: dataRow.embalaje!,
      suciedad: dataRow.suciedad!,
      color: dataRow.color!,
      flavor: dataRow.flavor!,
      seleccionClasificacion: { id: this.idSeleccionClasificacion! }
    };
  }

  private manejarExitoCreacion(dataRow: AnalisisSensorialData, response: AnalisisSensorialBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Análisis sensorial creado correctamente');
  }

  private manejarExitoActualizacion(dataRow: AnalisisSensorialData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedAnalisisSensorial[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Análisis sensorial actualizado correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear análisis sensorial:', error);
    this.mostrarError('Error al crear el análisis sensorial');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar análisis sensorial:', error);
    this.mostrarError('Error al actualizar el análisis sensorial');
  }

  private cancelarEdicionExistente(dataRow: AnalisisSensorialData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataAnalisisSensorial[index] = this.clonedAnalisisSensorial[rowId];
    delete this.clonedAnalisisSensorial[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarCamposRequeridos(dataRow: AnalisisSensorialData): boolean {
    return !!(
      dataRow.embalaje !== null &&
      dataRow.suciedad !== null &&
      dataRow.color !== null &&
      dataRow.flavor !== null
    );
  }

  private getRowId(dataRow: AnalisisSensorialData): string {
    return dataRow.id?.toString() || 'new';
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      // Si no hay datos, crear fila vacía
      this.dataAnalisisSensorial = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay análisis sensorial registrado. Complete los campos.');
    } else {
      console.error('Error al cargar análisis sensorial:', error);
      this.mostrarError('Error al cargar el análisis sensorial');
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
