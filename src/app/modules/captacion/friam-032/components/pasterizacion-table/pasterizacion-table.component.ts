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
        next: (pasterizaciones: PasterizacionData[]) => {
          this.dataPasterizacion = pasterizaciones;
          this.mostrarMensajeCarga(pasterizaciones);
          this.loading = false;
        },
        error: (error) => {
          this.manejarErrorCarga(error);
          this.loading = false;
        }
      });
  }

  crearNuevaPasterizacion(): void {
    if (!this.validarCreacionPasterizacion()) return;

    const nuevaPasterizacion: PasterizacionData = {
      id: null,
      no_frasco_pasterizacion: '',
      volumen_frasco_pasterizacion: '',
      id_control_reenvase: this.idControlReenvase!,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };

    this.dataPasterizacion.push(nuevaPasterizacion);
    this.dataPasterizacion = [...this.dataPasterizacion];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevaPasterizacion;

    setTimeout(() => this.table.initRowEdit(nuevaPasterizacion), 100);
    this.mostrarInfo('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  onRowEditInit(dataRow: PasterizacionData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    const rowId = this.getRowId(dataRow);
    this.clonedPasterizaciones[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: PasterizacionData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevaPasterizacion(dataRow, rowElement);
    } else {
      this.actualizarPasterizacionExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: PasterizacionData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarFilaTemporal(index);
      this.hasNewRowInEditing = false;
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataPasterizacion[index] = this.clonedPasterizaciones[rowId];
      delete this.clonedPasterizaciones[rowId];
    }
    this.editingRow = null;
  }

  private guardarNuevaPasterizacion(dataRow: PasterizacionData, rowElement: HTMLTableRowElement): void {
    this.pasterizacionService.crearPasterizacion(dataRow).subscribe({
      next: (response) => {
        console.log('Pasteurización creada:', response);
        dataRow.isNew = false;
        dataRow.id = response.id || Date.now();
        delete dataRow._uid;
        this.resetearEstadoEdicion();
        this.table.saveRowEdit(dataRow, rowElement);
        this.mostrarExito('Pasteurización creada correctamente');
      },
      error: (error) => {
        console.error('Error al crear pasteurización:', error);
        this.mostrarError('Error al crear la pasteurización');
      }
    });
  }

  private actualizarPasterizacionExistente(dataRow: PasterizacionData, rowElement: HTMLTableRowElement): void {
    this.pasterizacionService.actualizarPasterizacion(dataRow).subscribe({
      next: (response) => {
        console.log('Pasteurización actualizada:', response);
        const rowId = this.getRowId(dataRow);
        delete this.clonedPasterizaciones[rowId];
        this.editingRow = null;
        this.table.saveRowEdit(dataRow, rowElement);
        this.mostrarExito('Pasteurización actualizada correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar pasteurización:', error);
        this.mostrarError('Error al actualizar la pasteurización');
      }
    });
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
