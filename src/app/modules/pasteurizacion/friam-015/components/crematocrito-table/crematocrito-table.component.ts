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
    { header: 'KCAL/L', field: 'kcal_l', width: '120px', tipo: 'calculated' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly crematocritoService: CrematocritoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['idSeleccionClasificacion']?.currentValue) {
    this.loadDataCrematocrito();
  }
}

  loadDataCrematocrito(): void {
  if (!this.idSeleccionClasificacion || this.loading) {
    return;
  }

  this.loading = true;

  this.crematocritoService.getCrematocritoBySeleccionClasificacion(this.idSeleccionClasificacion)
    .subscribe({
      next: (crematocritoBackend: CrematocritoBackendResponse | null) => {
        if (crematocritoBackend) {
          this.dataCrematocrito = [this.transformarDatoBackendAFrontend(crematocritoBackend)];
          this.mostrarExito('Crematocrito cargado correctamente');
        } else {
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
  const mediaCt = this.calcularMediaCt(crematocrito.ct1, crematocrito.ct2, crematocrito.ct3);
  const mediaCc = this.calcularMediaCc(crematocrito.cc1, crematocrito.cc2, crematocrito.cc3);

  return {
    id: crematocrito.id,
    ct1: crematocrito.ct1,
    ct2: crematocrito.ct2,
    ct3: crematocrito.ct3,
    media_ct: mediaCt,
    cc1: crematocrito.cc1,
    cc2: crematocrito.cc2,
    cc3: crematocrito.cc3,
    media_cc: mediaCc,
    kcal_l: crematocrito.kcal,
    id_seleccion_clasificacion: this.idSeleccionClasificacion!,
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
      kcal_l: null,
      id_seleccion_clasificacion: this.idSeleccionClasificacion!,
      isNew: true
    };
  }

  // ============= CÁLCULO DE MEDIAS =============

  private calcularMediaCt(ct1: number | null, ct2: number | null, ct3: number | null): number | null {
  const valores = [ct1, ct2, ct3].filter(val => {
    if (val === null || val === undefined) return false;
    const numero = Number(val);
    return !isNaN(numero);
  }).map(val => Number(val));

  if (valores.length === 0) return null;

  const suma = valores.reduce((acc, val) => acc + val, 0);
  return suma / valores.length;
}

private calcularMediaCc(cc1: number | null, cc2: number | null, cc3: number | null): number | null {
  const valores = [cc1, cc2, cc3].filter(val => {
    if (val === null || val === undefined) return false;
    const numero = Number(val);
    return !isNaN(numero);
  }).map(val => Number(val));

  if (valores.length === 0) return null;

  const suma = valores.reduce((acc, val) => acc + val, 0);
  return suma / valores.length;
}

calcularMedias(rowData: CrematocritoData): void {
  rowData.ct1 = this.limpiarValor(rowData.ct1);
  rowData.ct2 = this.limpiarValor(rowData.ct2);
  rowData.ct3 = this.limpiarValor(rowData.ct3);
  rowData.cc1 = this.limpiarValor(rowData.cc1);
  rowData.cc2 = this.limpiarValor(rowData.cc2);
  rowData.cc3 = this.limpiarValor(rowData.cc3);

  rowData.media_ct = this.calcularMediaCt(rowData.ct1, rowData.ct2, rowData.ct3);
  rowData.media_cc = this.calcularMediaCc(rowData.cc1, rowData.cc2, rowData.cc3);
  rowData.kcal_l = this.calcularKcalL(rowData.media_ct, rowData.media_cc);
}

private limpiarValor(valor: any): number | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === 'string' && valor.trim() === '') {
    return null;
  }

  const numero = Number(valor);
  return isNaN(numero) ? null : numero;
}

  // ============= MÉTODO PARA KCAL/L =============
  private calcularKcalL(mediaCt: number | null, mediaCc: number | null): number | null {
    if (mediaCt === null || mediaCc === null || mediaCt === 0) {
      return null;
    }

    // Fórmula: (media cc x 100) / media ct x 66.8 + 290
    const resultado = ((mediaCc * 100) / mediaCt) * 66.8 + 290;

    // Retornar solo la parte entera (sin decimales)
    return Math.floor(resultado);
  }

  onRowEditInit(dataRow: CrematocritoData): void {
    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: CrematocritoData, index: number, event: MouseEvent): void {
  if (!this.validarCamposRequeridos(dataRow)) {
    return;
  }

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
    ct1: this.convertirANumeroONull(dataRow.ct1),
    ct2: this.convertirANumeroONull(dataRow.ct2),
    ct3: this.convertirANumeroONull(dataRow.ct3),
    cc1: this.convertirANumeroONull(dataRow.cc1),
    cc2: this.convertirANumeroONull(dataRow.cc2),
    cc3: this.convertirANumeroONull(dataRow.cc3),
    kcal: Number(dataRow.kcal_l),
    seleccionClasificacion: { id: this.idSeleccionClasificacion! }
  };
}

private convertirANumeroONull(valor: any): number | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === 'string' && valor.trim() === '') {
    return null;
  }

  const numero = Number(valor);

  if (isNaN(numero)) {
    return null;
  }

  return numero;
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
  const valoresCt = [dataRow.ct1, dataRow.ct2, dataRow.ct3].filter(val => this.esValorValido(val));
  const valoresCc = [dataRow.cc1, dataRow.cc2, dataRow.cc3].filter(val => this.esValorValido(val));

  const tieneCtSuficientes = valoresCt.length >= 2;
  const tieneCcSuficientes = valoresCc.length >= 2;

  if (!tieneCtSuficientes) {
    this.mostrarError('Debe completar al menos 2 valores de CT (CT1, CT2, CT3)');
    return false;
  }

  if (!tieneCcSuficientes) {
    this.mostrarError('Debe completar al menos 2 valores de CC (CC1, CC2, CC3)');
    return false;
  }

  return true;
}

esValorValido(valor: any): boolean {
  if (valor === null || valor === undefined) {
    return false;
  }

  if (typeof valor === 'string' && valor.trim() === '') {
    return false;
  }

  const numero = Number(valor);
  return !isNaN(numero);
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
