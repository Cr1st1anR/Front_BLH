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

import { CrematocritoService } from '../../services/crematocrito.service';
import type {
  CrematocritoData,
  CrematocritoBackendRequest,
  CrematocritoBackendResponse,
  TableColumn
} from '../../interfaces/crematocrito.interface';

@Component({
  selector: 'crematocrito-table',
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
  templateUrl: './crematocrito-table.component.html',
  styleUrl: './crematocrito-table.component.scss',
  providers: [MessageService]
})
export class CrematocritoTableComponent implements OnInit, OnChanges {
  @Input() idSeleccionClasificacion: number | null = null;

  @ViewChild('tableCrematocrito') table!: Table;

  loading: boolean = false;
  editingRow: CrematocritoData | null = null;
  clonedCrematocrito: { [s: string]: CrematocritoData } = {};

  dataCrematocrito: CrematocritoData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersCrematocrito: TableColumn[] = [
    { header: 'CT1', field: 'ct1', width: '100px', tipo: 'number' },
    { header: 'CT2', field: 'ct2', width: '100px', tipo: 'number' },
    { header: 'CT3', field: 'ct3', width: '100px', tipo: 'number' },
    { header: 'MEDIA CT', field: 'media_ct', width: '120px', tipo: 'calculated' },
    { header: 'CC1', field: 'cc1', width: '100px', tipo: 'number' },
    { header: 'CC2', field: 'cc2', width: '100px', tipo: 'number' },
    { header: 'CC3', field: 'cc3', width: '100px', tipo: 'number' },
    { header: 'MEDIA CC', field: 'media_cc', width: '120px', tipo: 'calculated' },
    { header: 'KCAL/L', field: 'kcal_l', width: '120px', tipo: 'pending' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly crematocritoService: CrematocritoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idSeleccionClasificacion) {
      this.loadDataCrematocrito();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idSeleccionClasificacion']?.currentValue && !this.isInitialLoad) {
      this.loadDataCrematocrito();
    } else if (changes['idSeleccionClasificacion']?.currentValue && this.isInitialLoad) {
      this.loadDataCrematocrito();
      this.isInitialLoad = false;
    }
  }

  loadDataCrematocrito(): void {
    if (!this.idSeleccionClasificacion) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.crematocritoService.getCrematocritoBySeleccionClasificacion(this.idSeleccionClasificacion)
      .subscribe({
        next: (crematocritoBackend: CrematocritoBackendResponse | null) => {
          if (crematocritoBackend) {
            // Si hay datos, transformarlos
            this.dataCrematocrito = [this.transformarDatoBackendAFrontend(crematocritoBackend)];
            this.mostrarExito('Crematocrito cargado correctamente');
          } else {
            // Si no hay datos, crear fila vacía por defecto
            this.dataCrematocrito = [this.construirRegistroVacio()];
            this.mostrarInfo('No hay crematocrito registrado. Complete los campos.');
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.manejarErrorCarga(error);
        }
      });
  }

  private transformarDatoBackendAFrontend(crematocrito: CrematocritoBackendResponse): CrematocritoData {
    return {
      id: crematocrito.id,
      ct1: crematocrito.ct1,
      ct2: crematocrito.ct2,
      ct3: crematocrito.ct3,
      media_ct: crematocrito.mediaCt,
      cc1: crematocrito.cc1,
      cc2: crematocrito.cc2,
      cc3: crematocrito.cc3,
      media_cc: crematocrito.mediaCc,
      kcal_l: crematocrito.kcalL,
      id_seleccion_clasificacion: crematocrito.seleccionClasificacion.id,
      isNew: false
    };
  }

  private construirRegistroVacio(): CrematocritoData {
    return {
      id: null,
      ct1: null,
      ct2: null,
      ct3: null,
      media_ct: null,
      cc1: null,
      cc2: null,
      cc3: null,
      media_cc: null,
      kcal_l: null, // Pendiente de fórmula
      id_seleccion_clasificacion: this.idSeleccionClasificacion!,
      isNew: true
    };
  }

  // ============= CÁLCULO DE MEDIAS =============
  calcularMedias(rowData: CrematocritoData): void {
    // Calcular MEDIA CT: (CT1 + CT2 + CT3) / 3
    if (rowData.ct1 !== null && rowData.ct2 !== null && rowData.ct3 !== null) {
      const ct1 = Number(rowData.ct1);
      const ct2 = Number(rowData.ct2);
      const ct3 = Number(rowData.ct3);
      rowData.media_ct = (ct1 + ct2 + ct3) / 3;
    } else {
      rowData.media_ct = null;
    }

    // Calcular MEDIA CC: (CC1 + CC2 + CC3) / 3
    if (rowData.cc1 !== null && rowData.cc2 !== null && rowData.cc3 !== null) {
      const cc1 = Number(rowData.cc1);
      const cc2 = Number(rowData.cc2);
      const cc3 = Number(rowData.cc3);
      rowData.media_cc = (cc1 + cc2 + cc3) / 3;
    } else {
      rowData.media_cc = null;
    }

    // TODO: Calcular KCAL/L cuando se tenga la fórmula
    // Por ahora lo dejamos en null
    // rowData.kcal_l = this.calcularKcalL(rowData.media_ct, rowData.media_cc);
  }

  // ============= MÉTODO PENDIENTE PARA KCAL/L =============
  // Cuando tengas la fórmula, descomenta y completa este método
  /*
  private calcularKcalL(mediaCt: number | null, mediaCc: number | null): number | null {
    if (mediaCt === null || mediaCc === null) {
      return null;
    }

    // TODO: Implementar la fórmula correcta aquí
    // Ejemplo: return (mediaCt * 0.5) + (mediaCc * 0.3) + 50;

    return null;
  }
  */

  onRowEditInit(dataRow: CrematocritoData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: CrematocritoData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarError('Por favor complete todos los campos requeridos (CT1-CT3 y CC1-CC3)');
      return;
    }

    // Recalcular medias antes de guardar
    this.calcularMedias(dataRow);

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionCrematocrito(dataRow, rowElement);
    } else {
      this.procesarActualizacionCrematocrito(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: CrematocritoData, index: number): void {
    if (dataRow.isNew) {
      // Si es nuevo y se cancela, restaurar la fila vacía
      this.dataCrematocrito[index] = this.construirRegistroVacio();
      this.dataCrematocrito = [...this.dataCrematocrito];
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private iniciarEdicionFila(dataRow: CrematocritoData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedCrematocrito[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionCrematocrito(dataRow: CrematocritoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.crematocritoService.postCrematocrito(datosParaBackend).subscribe({
      next: (response: CrematocritoBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionCrematocrito(dataRow: CrematocritoData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.crematocritoService.putCrematocrito(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: CrematocritoData): CrematocritoBackendRequest {
    return {
      ct1: Number(dataRow.ct1),
      ct2: Number(dataRow.ct2),
      ct3: Number(dataRow.ct3),
      mediaCt: Number(dataRow.media_ct),
      cc1: Number(dataRow.cc1),
      cc2: Number(dataRow.cc2),
      cc3: Number(dataRow.cc3),
      mediaCc: Number(dataRow.media_cc),
      kcalL: dataRow.kcal_l !== null ? Number(dataRow.kcal_l) : null,
      seleccionClasificacion: { id: this.idSeleccionClasificacion! }
    };
  }

  private manejarExitoCreacion(dataRow: CrematocritoData, response: CrematocritoBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Crematocrito creado correctamente');
  }

  private manejarExitoActualizacion(dataRow: CrematocritoData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedCrematocrito[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Crematocrito actualizado correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear crematocrito:', error);
    this.mostrarError('Error al crear el crematocrito');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar crematocrito:', error);
    this.mostrarError('Error al actualizar el crematocrito');
  }

  private cancelarEdicionExistente(dataRow: CrematocritoData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataCrematocrito[index] = this.clonedCrematocrito[rowId];
    delete this.clonedCrematocrito[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarCamposRequeridos(dataRow: CrematocritoData): boolean {
    return !!(
      dataRow.ct1 !== null &&
      dataRow.ct2 !== null &&
      dataRow.ct3 !== null &&
      dataRow.cc1 !== null &&
      dataRow.cc2 !== null &&
      dataRow.cc3 !== null
    );
  }

  private getRowId(dataRow: CrematocritoData): string {
    return dataRow.id?.toString() || 'new';
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      // Si no hay datos, crear fila vacía
      this.dataCrematocrito = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay crematocrito registrado. Complete los campos.');
    } else {
      console.error('Error al cargar crematocrito:', error);
      this.mostrarError('Error al cargar el crematocrito');
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
