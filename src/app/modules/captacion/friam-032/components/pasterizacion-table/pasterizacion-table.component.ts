import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { PasterizacionService } from '../../services/pasterizacion.service';
import type { PasterizacionData } from '../../interfaces/pasterizacion.interface';

@Component({
  selector: 'pasterizacion-table',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './pasterizacion-table.component.html',
  styleUrl: './pasterizacion-table.component.scss',
  providers: [MessageService]
})
export class PasterizacionTableComponent implements OnInit, OnChanges {
  @Input() idControlReenvase: number | null = null;

  @ViewChild('tablePasterizacion') table!: Table;

  loading: boolean = false;
  editingRow: PasterizacionData | null = null;
  hasNewRowInEditing: boolean = false;
  clonedPasterizaciones: { [s: string]: PasterizacionData } = {};
  tempIdCounter: number = -1;

  dataPasterizacion: PasterizacionData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersPasterizacion = [
    { header: 'N° DE FRASCO DE PASTEURIZACIÓN', field: 'no_frasco_pasterizacion', width: '200px', tipo: 'text' },
    { header: 'VOLUMEN', field: 'volumen_frasco_pasterizacion', width: '150px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly pasterizacionService: PasterizacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idControlReenvase) {
      this.loadDataPasterizacion();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idControlReenvase']?.currentValue && !this.isInitialLoad) {
      this.loadDataPasterizacion();
    } else if (changes['idControlReenvase']?.currentValue && this.isInitialLoad) {
      this.loadDataPasterizacion();
      this.isInitialLoad = false;
    }
  }

  loadDataPasterizacion(): void {
    if (!this.idControlReenvase) return;

    if (this.loading) return;

    this.loading = true;

    this.pasterizacionService.getPasterizacionesPorControlReenvase(this.idControlReenvase)
      .subscribe({
        next: (todasLasPasterizaciones: PasterizacionData[]) => {
          this.dataPasterizacion = this.filtrarPasterizacionesPorControlReenvase(
            todasLasPasterizaciones, 
            this.idControlReenvase!
          );
          this.mostrarMensajeCarga(this.dataPasterizacion);
          this.loading = false;
        },
        error: (error) => {
          this.manejarErrorCarga(error);
          this.loading = false;
        }
      });
  }

  private filtrarPasterizacionesPorControlReenvase(
    pasterizaciones: PasterizacionData[], 
    idControlReenvase: number
  ): PasterizacionData[] {
    return pasterizaciones.filter(item => 
      item.id_control_reenvase === idControlReenvase
    );
  }

  crearNuevaPasterizacion(): void {
    if (!this.validarCreacionPasterizacion()) return;

    const nuevaPasterizacion: PasterizacionData = this.construirNuevaPasterizacion();

    this.agregarPasterizacionATabla(nuevaPasterizacion);
    this.inicializarModoEdicion(nuevaPasterizacion);
    this.mostrarInfo('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  onRowEditInit(dataRow: PasterizacionData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.iniciarEdicionFila(dataRow);
  }

  onRowEditSave(dataRow: PasterizacionData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionPasterizacion(dataRow, rowElement);
    } else {
      this.procesarActualizacionPasterizacion(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: PasterizacionData, index: number): void {
    if (dataRow.isNew) {
      this.cancelarCreacionNueva(index);
    } else {
      this.cancelarEdicionExistente(dataRow, index);
    }
    this.editingRow = null;
  }

  private construirNuevaPasterizacion(): PasterizacionData {
    return {
      id: null,
      no_frasco_pasterizacion: '',
      volumen_frasco_pasterizacion: '',
      id_control_reenvase: this.idControlReenvase!,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarPasterizacionATabla(pasteurizacion: PasterizacionData): void {
    this.dataPasterizacion.push(pasteurizacion);
    this.dataPasterizacion = [...this.dataPasterizacion];
  }

  private inicializarModoEdicion(pasteurizacion: PasterizacionData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = pasteurizacion;
    setTimeout(() => this.table.initRowEdit(pasteurizacion), 100);
  }

  private iniciarEdicionFila(dataRow: PasterizacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedPasterizaciones[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  private procesarCreacionPasterizacion(dataRow: PasterizacionData, rowElement: HTMLTableRowElement): void {
    const datosParaEnviar = this.prepararDatosParaCreacion(dataRow);

    this.pasterizacionService.postPasterizacion(datosParaEnviar).subscribe({
      next: (response) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionPasterizacion(dataRow: PasterizacionData, rowElement: HTMLTableRowElement): void {
    const datosParaEnviar = this.prepararDatosParaActualizacion(dataRow);

    this.pasterizacionService.putPasterizacion(dataRow.id!, datosParaEnviar).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaCreacion(dataRow: PasterizacionData): PasterizacionData {
    return {
      no_frasco_pasterizacion: dataRow.no_frasco_pasterizacion.trim(),
      volumen_frasco_pasterizacion: dataRow.volumen_frasco_pasterizacion.trim(),
      id_control_reenvase: this.idControlReenvase!
    };
  }

  private prepararDatosParaActualizacion(dataRow: PasterizacionData): PasterizacionData {
    return {
      id: dataRow.id,
      no_frasco_pasterizacion: dataRow.no_frasco_pasterizacion.trim(),
      volumen_frasco_pasterizacion: dataRow.volumen_frasco_pasterizacion.trim(),
      id_control_reenvase: dataRow.id_control_reenvase
    };
  }

  private manejarExitoCreacion(dataRow: PasterizacionData, response: any, rowElement: HTMLTableRowElement): void {
    console.log('Pasteurización creada:', response);

    dataRow.isNew = false;
    dataRow.id = response.id || Date.now();
    delete dataRow._uid;

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito(response.message || 'Pasteurización creada correctamente');
  }

  private manejarExitoActualizacion(dataRow: PasterizacionData, response: any, rowElement: HTMLTableRowElement): void {
    console.log('Pasteurización actualizada:', response);

    const rowId = this.getRowId(dataRow);
    delete this.clonedPasterizaciones[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito(response.message || 'Pasteurización actualizada correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    console.error('Error al crear pasteurización:', error);
    this.mostrarError('Error al crear la pasteurización');
  }

  private manejarErrorActualizacion(error: any): void {
    console.error('Error al actualizar pasteurización:', error);
    this.mostrarError('Error al actualizar la pasteurización');
  }

  private cancelarCreacionNueva(index: number): void {
    this.eliminarFilaTemporal(index);
    this.hasNewRowInEditing = false;
  }

  private cancelarEdicionExistente(dataRow: PasterizacionData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataPasterizacion[index] = this.clonedPasterizaciones[rowId];
    delete this.clonedPasterizaciones[rowId];
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private eliminarFilaTemporal(index: number): void {
    this.dataPasterizacion.splice(index, 1);
    this.dataPasterizacion = [...this.dataPasterizacion];
  }

  private validarCreacionPasterizacion(): boolean {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de crear una nueva pasteurización');
      return false;
    }

    if (!this.idControlReenvase) {
      this.mostrarError('No se puede crear pasteurización sin ID de control de reenvase');
      return false;
    }

    return true;
  }

  private validarCamposRequeridos(dataRow: PasterizacionData): boolean {
    return !!(
      dataRow.no_frasco_pasterizacion?.trim() &&
      dataRow.volumen_frasco_pasterizacion?.trim()
    );
  }

  private getRowId(dataRow: PasterizacionData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  isEditing(rowData: PasterizacionData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: PasterizacionData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private mostrarMensajeCarga(pasterizaciones: PasterizacionData[]): void {
    if (pasterizaciones.length > 0) {
      this.mostrarExito(`${pasterizaciones.length} pasteurización${pasterizaciones.length > 1 ? 'es' : ''} cargada${pasterizaciones.length > 1 ? 's' : ''}`);
    } else {
      this.mostrarInfo('No hay pasteurizaciones registradas para este control de reenvase');
    }
  }

  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar pasteurizaciones:', error);
    this.mostrarError('Error al cargar las pasteurizaciones');
  }

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje, key: 'tr', life: 2000 });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarAdvertencia(mensaje: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarInfo(mensaje: string): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: mensaje, key: 'tr', life: 2000 });
  }
}
