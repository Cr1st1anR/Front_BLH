import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { EntregaLecheCrudaService } from '../../services/entrega-leche-cruda.service';
import type { EntregaLecheCrudaData } from '../../interfaces/entrega-leche-cruda.interface';

@Component({
  selector: 'entrega-leche-cruda-table',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule
  ],
  templateUrl: './entrega-leche-cruda-table.component.html',
  styleUrl: './entrega-leche-cruda-table.component.scss',
  providers: [MessageService]
})
export class EntregaLecheCrudaTableComponent implements OnInit {

  @ViewChild('tableEntregaLeche') table!: Table;

  loading: boolean = false;
  editingRow: EntregaLecheCrudaData | null = null;
  hasNewRowInEditing: boolean = false;
  clonedData: { [s: string]: EntregaLecheCrudaData } = {};
  tempIdCounter: number = -1;

  readonly headersEntregaLecheCruda = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'NOMBRE DE LA MADRE', field: 'nombre_madre', width: '200px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA A.M', field: 'volumen_leche_materna_am', width: '180px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA P.M', field: 'volumen_leche_materna_pm', width: '180px', tipo: 'text' },
    { header: 'PERDIDAS', field: 'perdidas', width: '100px', tipo: 'number' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' },
  ];

  dataEntregaLecheCruda: EntregaLecheCrudaData[] = [];

  constructor(
    private readonly entregaLecheCrudaService: EntregaLecheCrudaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadDataEntregaLecheCruda();
  }

  /**
   * Carga los datos de entrega de leche cruda
   */
  private loadDataEntregaLecheCruda(): void {
    this.loading = true;

    try {
      this.dataEntregaLecheCruda = this.entregaLecheCrudaService.getEntregaLecheCrudaData();


      this.dataEntregaLecheCruda = this.formatData(this.dataEntregaLecheCruda);

      this.showSuccessMessageInitial();
      this.loading = false;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Formatea los datos para mostrar
   */
  private formatData(data: EntregaLecheCrudaData[]): EntregaLecheCrudaData[] {
    return data.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      fecha: item.fecha ? new Date(item.fecha) : null
    }));
  }

  /**
   * Crea un nuevo registro en la tabla
   */
  crearNuevoRegistro(): void {
    if (this.hasNewRowInEditing) {
      this.showWarningMessage('Debe guardar o cancelar el registro actual antes de crear uno nuevo');
      return;
    }

    if (this.isAnyRowEditing()) {
      this.showWarningMessage('Debe completar la edición actual antes de crear un nuevo registro');
      return;
    }

    const nuevoRegistro = this.createNewRecord();
    this.dataEntregaLecheCruda.push(nuevoRegistro);
    this.dataEntregaLecheCruda = [...this.dataEntregaLecheCruda];

    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  /**
   * Crea una nueva instancia de registro
   */
  private createNewRecord(): EntregaLecheCrudaData {
    return {
      id: null,
      fecha: null,
      nombre_madre: '',
      volumen_leche_materna_am: '',
      volumen_leche_materna_pm: '',
      perdidas: 0,
      responsable: '',
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  /**
   * Inicia la edición de una fila
   */
  onRowEditInit(dataRow: EntregaLecheCrudaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.showWarningMessage('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
    this.editingRow = dataRow;

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
  }

  /**
   * Guarda los cambios en el registro
   */
  onRowEditSave(dataRow: EntregaLecheCrudaData, index: number, event: MouseEvent): void {
    if (!this.validateRequiredFields(dataRow)) {
      this.showErrorMessage('Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  /**
   * Cancela la edición de una fila
   */
  onRowEditCancel(dataRow: EntregaLecheCrudaData, index: number): void {
    if (dataRow.isNew) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataEntregaLecheCruda[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
    this.editingRow = null;
  }

  /**
   * Remueve una nueva fila de los datos cuando se cancela
   */
  private removeNewRowFromData(dataRow: EntregaLecheCrudaData): void {
    const originalIndex = this.dataEntregaLecheCruda.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (originalIndex !== -1) {
      this.dataEntregaLecheCruda.splice(originalIndex, 1);
      this.dataEntregaLecheCruda = [...this.dataEntregaLecheCruda];
    }
  }

  /**
   * Guarda un nuevo registro
   */
  private guardarNuevoRegistro(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {

    console.log('Guardando nuevo registro:', dataRow);

    dataRow.isNew = false;
    dataRow.id = Math.max(...this.dataEntregaLecheCruda.map(item => item.id || 0)) + 1;
    delete dataRow._uid;

    this.resetEditingState();
    this.table.saveRowEdit(dataRow, rowElement);
    this.showSuccessMessage('Registro creado exitosamente');
  }

  /**
   * Actualiza un registro existente
   */
  private actualizarRegistroExistente(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {

    console.log('Actualizando registro:', dataRow);

    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.showSuccessMessage('Registro actualizado exitosamente');
  }

  /**
   * Obtiene el ID único de una fila
   */
  private getRowId(dataRow: EntregaLecheCrudaData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  /**
   * Valida que todos los campos requeridos estén completos
   */
  private validateRequiredFields(dataRow: EntregaLecheCrudaData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.nombre_madre?.trim() &&
      dataRow.volumen_leche_materna_am?.trim() &&
      dataRow.volumen_leche_materna_pm?.trim() &&
      dataRow.responsable?.trim()
    );
  }

  /**
   * Resetea el estado de edición
   */
  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  /**
   * Verifica si una fila está siendo editada
   */
  isEditing(rowData: EntregaLecheCrudaData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  /**
   * Verifica si hay alguna fila en edición
   */
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  /**
   * Determina si el botón de editar debe estar deshabilitado
   */
  isEditButtonDisabled(rowData: EntregaLecheCrudaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }


  /**
   * Muestra mensaje de éxito para carga inicial de datos
   */
  private showSuccessMessageInitial(): void {
    const cantidad = this.dataEntregaLecheCruda.length;

    if (cantidad > 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `${cantidad} registro${cantidad > 1 ? 's' : ''} de entrega de leche cruda cargado${cantidad > 1 ? 's' : ''}`,
        key: 'tr',
        life: 2000,
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No se encontraron registros de entrega de leche cruda',
        key: 'tr',
        life: 2000,
      });
    }
  }

  /**
   * Muestra mensaje de éxito personalizado
   */
  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }

  /**
   * Muestra mensaje de error
   */
  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  /**
   * Muestra mensaje de advertencia
   */
  private showWarningMessage(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  /**
   * Muestra mensaje informativo
   */
  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }

  /**
   * Maneja errores de carga de datos
   */
  private handleError(error: any): void {
    console.error('Error al cargar datos:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de entrega de leche cruda',
      key: 'tr',
      life: 3000,
    });
    this.loading = false;
  }
}
