import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { PasterizacionService } from '../../services/pasterizacion.service';
import type {
  PasterizacionData,
  PasterizacionBackendRequest,
  PasterizacionBackendResponse
} from '../../interfaces/pasterizacion.interface';

@Component({
  selector: 'pasterizacion-table',
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
  todasLasPasterizaciones: PasterizacionData[] = [];

  private isInitialLoad: boolean = true;

  readonly headersPasterizacion = [
    { header: 'N° DE FRASCO DE PASTEURIZACIÓN', field: 'no_frasco_pasterizacion', width: '250px', tipo: 'text' },
    { header: 'VOLUMEN', field: 'volumen_frasco_pasterizacion', width: '150px', tipo: 'text' },
    { header: 'OBSERVACIONES', field: 'observaciones_pasterizacion', width: '200px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly pasterizacionService: PasterizacionService,
    private readonly messageService: MessageService
  ) { }

  private obtenerAñoActualCorto(): string {
    const añoCompleto = new Date().getFullYear();
    return añoCompleto.toString().slice(-2);
  }

  private generarCodigoLHP(id: number): string {
    const añoActual = this.obtenerAñoActualCorto();
    return `LHP ${añoActual} ${id}`;
  }

  private extraerIdDeCodigoLHP(codigoCompleto: string): number | null {
    if (!codigoCompleto) return null;

    const match = codigoCompleto.match(/LHP\s+\d+\s+(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  private validarFormatoCodigoLHP(codigo: string): boolean {
    if (!codigo) return false;

    const regex = /^LHP\s+\d{2}\s+\d+$/;
    return regex.test(codigo);
  }

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
  if (!this.idControlReenvase) {
    console.warn('No hay idControlReenvase para cargar datos');
    return;
  }

  if (this.loading) {
    console.warn('Ya hay una carga en progreso');
    return;
  }

  console.log('Cargando pasteurizaciones para control reenvase:', this.idControlReenvase); // 👈 Debug
  this.loading = true;

  this.pasterizacionService.getPasterizacionesPorControlReenvase(this.idControlReenvase)
    .subscribe({
      next: (pasteurizacionesBackend: PasterizacionBackendResponse[]) => {
        console.log('Datos recibidos del backend:', pasteurizacionesBackend); // 👈 Debug

        this.todasLasPasterizaciones = this.transformarDatosBackendAFrontend(pasteurizacionesBackend);

        this.dataPasterizacion = this.filtrarPasterizacionesPorControlReenvase(
          this.todasLasPasterizaciones,
          this.idControlReenvase!
        );

        console.log('Datos transformados para mostrar:', this.dataPasterizacion); // 👈 Debug
        this.mostrarMensajeCarga(this.dataPasterizacion);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error completo al cargar pasteurizaciones:', error); // 👈 Debug mejorado
        this.manejarErrorCarga(error);
        this.loading = false;
      }
    });
}

  private transformarDatosBackendAFrontend(datosBackend: PasterizacionBackendResponse[]): PasterizacionData[] {
  return datosBackend.map(item => {
    console.log('Transformando item:', item); // 👈 Debug temporal

    return {
      id: item.id,
      no_frasco_pasterizacion: item.numeroFrasco ? this.generarCodigoLHP(item.numeroFrasco) : '',
      id_frasco_pasterizacion: item.numeroFrasco,
      volumen_frasco_pasterizacion: item.volumen ? item.volumen.toString() : '0',
      observaciones_pasterizacion: item.observaciones || '',
      id_control_reenvase: item.controlReenvase?.id
    };
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

  onObservacionesChange(rowData: PasterizacionData): void {
    if (rowData.observaciones_pasterizacion?.trim()) {
      rowData.no_frasco_pasterizacion = '';
      rowData.volumen_frasco_pasterizacion = '0';
      rowData.id_frasco_pasterizacion = null;
    } else {
      const siguienteId = this.obtenerSiguienteIdConsecutivoGlobal();
      rowData.no_frasco_pasterizacion = this.generarCodigoLHP(siguienteId);
      rowData.id_frasco_pasterizacion = siguienteId;
      rowData.volumen_frasco_pasterizacion = '';
    }
  }

  private obtenerSiguienteIdConsecutivoGlobal(): number {
    const frascosSinObservacionesGlobales = this.todasLasPasterizaciones.filter(item =>
      !item.observaciones_pasterizacion?.trim() &&
      this.validarFormatoCodigoLHP(item.no_frasco_pasterizacion || '')
    );

    const idsUsadosGlobales = frascosSinObservacionesGlobales
      .map(item => this.extraerIdDeCodigoLHP(item.no_frasco_pasterizacion || ''))
      .filter(id => id !== null && id > 0) as number[];

    if (idsUsadosGlobales.length === 0) {
      return 1;
    }

    return Math.max(...idsUsadosGlobales) + 1;
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
      this.mostrarError('Por favor complete los campos requeridos');
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
    const siguienteId = this.obtenerSiguienteIdConsecutivoGlobal();

    return {
      id: null,
      no_frasco_pasterizacion: this.generarCodigoLHP(siguienteId),
      id_frasco_pasterizacion: siguienteId,
      volumen_frasco_pasterizacion: '',
      observaciones_pasterizacion: '',
      id_control_reenvase: this.idControlReenvase!,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarPasterizacionATabla(pasteurizacion: PasterizacionData): void {
    this.dataPasterizacion.push(pasteurizacion);
    this.dataPasterizacion = [...this.dataPasterizacion];

    this.todasLasPasterizaciones.push(pasteurizacion);
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
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.pasterizacionService.postPasterizacion(datosParaBackend).subscribe({
      next: (response: PasterizacionBackendResponse) => {
        this.manejarExitoCreacion(dataRow, response, rowElement);
      },
      error: (error) => {
        console.error('Error al crear pasteurización:', error);
        this.manejarErrorCreacion(error);
      }
    });
  }

  private procesarActualizacionPasterizacion(dataRow: PasterizacionData, rowElement: HTMLTableRowElement): void {
    const datosParaBackend = this.prepararDatosParaBackend(dataRow);

    this.pasterizacionService.putPasterizacion(dataRow.id!, datosParaBackend).subscribe({
      next: (response) => {
        this.manejarExitoActualizacion(dataRow, response, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar pasteurización:', error);
        this.manejarErrorActualizacion(error);
      }
    });
  }

  private prepararDatosParaBackend(dataRow: PasterizacionData): PasterizacionBackendRequest {
    const tieneObservaciones = !!(dataRow.observaciones_pasterizacion?.trim());

    return {
      volumen: tieneObservaciones ? null : parseFloat(dataRow.volumen_frasco_pasterizacion) || null,
      controlReenvase: { id: this.idControlReenvase! },
      observaciones: dataRow.observaciones_pasterizacion?.trim() || null,
      numeroFrasco: tieneObservaciones ? null : dataRow.id_frasco_pasterizacion
    };
  }

  private manejarExitoCreacion(dataRow: PasterizacionData, response: PasterizacionBackendResponse, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.id;

    if (response.numeroFrasco) {
      dataRow.no_frasco_pasterizacion = this.generarCodigoLHP(response.numeroFrasco);
      dataRow.id_frasco_pasterizacion = response.numeroFrasco;
    }

    delete dataRow._uid;

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Pasteurización creada correctamente');
  }

  private manejarExitoActualizacion(dataRow: PasterizacionData, response: any, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedPasterizaciones[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarExito('Pasteurización actualizada correctamente');
  }

  private manejarErrorCreacion(error: any): void {
    this.mostrarError('Error al crear la pasteurización');
  }

  private manejarErrorActualizacion(error: any): void {
    this.mostrarError('Error al actualizar la pasteurización');
  }

  private cancelarCreacionNueva(index: number): void {
    const registroEliminado = this.dataPasterizacion[index];
    this.eliminarFilaTemporal(index);

    const indexGlobal = this.todasLasPasterizaciones.findIndex(item =>
      item._uid === registroEliminado._uid
    );
    if (indexGlobal !== -1) {
      this.todasLasPasterizaciones.splice(indexGlobal, 1);
    }

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
    const tieneObservaciones = !!(dataRow.observaciones_pasterizacion?.trim());

    if (tieneObservaciones) {
      return true;
    }

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
