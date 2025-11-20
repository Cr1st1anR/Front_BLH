import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { AcidezDornicService } from '../../services/acidez-dornic.service';
import type {
  AcidezDornicData,
  AcidezDornicBackendRequest,
  AcidezDornicBackendResponse,
  TableColumn
} from '../../interfaces/acidez-dornic.interface';

@Component({
  selector: 'acidez-dornic-table',
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
    DecimalPipe
  ],
  templateUrl: './acidez-dornic-table.component.html',
  styleUrl: './acidez-dornic-table.component.scss',
  providers: [MessageService]
})
export class AcidezDornicTableComponent implements OnInit, OnChanges {
  @Input() idSeleccionClasificacion: number | null = null;

  @ViewChild('tableAcidezDornic') table!: Table;

  loading: boolean = false;
  editingRow: AcidezDornicData | null = null;
  clonedAcidezDornic: { [s: string]: AcidezDornicData } = {};

  dataAcidezDornic: AcidezDornicData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersAcidezDornic: TableColumn[] = [
    { header: 'A1', field: 'a1', width: '150px', tipo: 'number' },
    { header: 'A2', field: 'a2', width: '150px', tipo: 'number' },
    { header: 'A3', field: 'a3', width: '150px', tipo: 'number' },
    { header: 'MEDIA', field: 'media', width: '150px', tipo: 'calculated' },
    { header: 'FACTOR', field: 'factor', width: '120px', tipo: 'readonly' },
    { header: 'RESULTADO', field: 'resultado', width: '150px', tipo: 'calculated' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly acidezDornicService: AcidezDornicService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idSeleccionClasificacion) {
      this.loadDataAcidezDornic();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idSeleccionClasificacion']?.currentValue && !this.isInitialLoad) {
      this.loadDataAcidezDornic();
    } else if (changes['idSeleccionClasificacion']?.currentValue && this.isInitialLoad) {
      this.loadDataAcidezDornic();
      this.isInitialLoad = false;
    }
  }

  loadDataAcidezDornic(): void {
    if (!this.idSeleccionClasificacion) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.acidezDornicService.getAcidezDornicBySeleccionClasificacion(this.idSeleccionClasificacion)
      .subscribe({
        next: (acidezBackend: AcidezDornicBackendResponse | null) => {
          if (acidezBackend) {
            // Si hay datos, transformarlos
            this.dataAcidezDornic = [this.transformarDatoBackendAFrontend(acidezBackend)];
            this.mostrarExito('Acidez Dornic cargada correctamente');
          } else {
            // Si no hay datos, crear fila vacía por defecto
            this.dataAcidezDornic = [this.construirRegistroVacio()];
            this.mostrarInfo('No hay acidez dornic registrada. Complete los campos.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.manejarErrorCarga(error);
        }
      });
  }

  private transformarDatoBackendAFrontend(acidez: AcidezDornicBackendResponse): AcidezDornicData {
    return {
      id: acidez.id,
      a1: acidez.a1,
      a2: acidez.a2,
      a3: acidez.a3,
      media: acidez.media,
      factor: acidez.factor,
      resultado: acidez.resultado,
      id_seleccion_clasificacion: acidez.seleccionClasificacion.id,
      isNew: false
    };
  }

  private construirRegistroVacio(): AcidezDornicData {
    return {
      id: null,
      a1: null,
      a2: null,
      a3: null,
      media: null,
      factor: 1, // Siempre es 1
      resultado: null,
      id_seleccion_clasificacion: this.idSeleccionClasificacion!,
      isNew: true
    };
  }

  // ============= CÁLCULO DE MEDIA Y RESULTADO =============
  calcularMedia(rowData: AcidezDornicData): void {
    const a1 = rowData.a1 !== null ? Number(rowData.a1) : 0;
    const a2 = rowData.a2 !== null ? Number(rowData.a2) : 0;
    const a3 = rowData.a3 !== null ? Number(rowData.a3) : 0;

    // Calcular media: (A1 + A2 + A3) / 3
    if (rowData.a1 !== null && rowData.a2 !== null && rowData.a3 !== null) {
      rowData.media = (a1 + a2 + a3) / 3;
      // El resultado es igual a la media (ya que el factor siempre es 1)
      rowData.resultado = rowData.media;
    } else {
      rowData.media = null;
      rowData.resultado = null;
    }
  }

  onRowEditInit(dataRow: AcidezDornicData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: AcidezDornicData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarError('Por favor complete todos los campos requeridos (A1, A2, A3)');
      return;
    }

    // Recalcular antes de guardar
    this.calcularMedia(dataRow);

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionAcidez(dataRow, rowElement);
    } else {
      this.procesarActualizacionAcidez(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: AcidezDornicData, index: number): void {
    if (dataRow.isNew) {
      // Si es nuevo y se cancela, restaurar la fila vacía
      this.dataAcidezDornic[index] = this.construirRegistroVacio();
      this.dataAcidezDornic = [...this.dataAcidezDornic];
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private iniciarEdicionFila(dataRow: AcidezDornicData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedAcidezDornic[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionAcidez(dataRow: AcidezDornicData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.acidezDornicService.postAcidezDornic(datosParaBackend).subscribe({
      next: (response: AcidezDornicBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionAcidez(dataRow: AcidezDornicData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.acidezDornicService.putAcidezDornic(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: AcidezDornicData): AcidezDornicBackendRequest {
    return {
      a1: Number(dataRow.a1),
      a2: Number(dataRow.a2),
      a3: Number(dataRow.a3),
      media: Number(dataRow.media),
      factor: dataRow.factor,
      resultado: Number(dataRow.resultado),
      seleccionClasificacion: { id: this.idSeleccionClasificacion! }
    };
  }

  private manejarExitoCreacion(dataRow: AcidezDornicData, response: AcidezDornicBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Acidez Dornic creada correctamente');
  }

  private manejarExitoActualizacion(dataRow: AcidezDornicData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedAcidezDornic[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Acidez Dornic actualizada correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear acidez dornic:', error);
    this.mostrarError('Error al crear la acidez dornic');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar acidez dornic:', error);
    this.mostrarError('Error al actualizar la acidez dornic');
  }

  private cancelarEdicionExistente(dataRow: AcidezDornicData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataAcidezDornic[index] = this.clonedAcidezDornic[rowId];
    delete this.clonedAcidezDornic[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarCamposRequeridos(dataRow: AcidezDornicData): boolean {
    return !!(
      dataRow.a1 !== null &&
      dataRow.a2 !== null &&
      dataRow.a3 !== null
    );
  }

  private getRowId(dataRow: AcidezDornicData): string {
    return dataRow.id?.toString() || 'new';
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      // Si no hay datos, crear fila vacía
      this.dataAcidezDornic = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay acidez dornic registrada. Complete los campos.');
    } else {
      console.error('Error al cargar acidez dornic:', error);
      this.mostrarError('Error al cargar la acidez dornic');
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
