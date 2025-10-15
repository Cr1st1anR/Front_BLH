import { CommonModule } from '@angular/common';
import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TableLecheExtraidaService } from './services/table-leche-extraida.service';

@Component({
  selector: 'table-leche-extraida',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    RadioButtonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule
  ],
  templateUrl: './table-leche-extraida.component.html',
  styleUrl: './table-leche-extraida.component.scss',
  providers: [MessageService]
})
export class TableLecheExtraidaComponent implements OnInit {

  @ViewChild('tableLecheExtraida') table!: Table;
  @Output() rowClick = new EventEmitter<any>();

  // Estados del componente
  loading: boolean = false;
  hasNewRowInEditing: boolean = false;
  editingRow: any = null;
  clonedLecheExtraida: { [s: string]: any } = {};

  // Datos y configuración de la tabla
  dataLecheExtraida: any[] = [];
  readonly headersLecheExtraida: any[] = [
    {
      header: 'FECHA DE REGISTRO',
      field: 'fecha_registro',
      width: '200px',
      tipo: 'date',
    },
    {
      header: 'APELLIDOS Y NOMBRE',
      field: 'apellidos_nombre',
      width: '250px',
      tipo: 'text',
    },
    {
      header: 'EDAD',
      field: 'edad',
      width: '120px',
      tipo: 'edad',
    },
    {
      header: 'IDENTIFICACIÓN',
      field: 'identificacion',
      width: '180px',
      tipo: 'number',
    },
    {
      header: 'MUNICIPIO',
      field: 'municipio',
      width: '180px',
      tipo: 'text',
    },
    {
      header: 'TELÉFONO',
      field: 'telefono',
      width: '160px',
      tipo: 'number',
    },
    {
      header: 'EPS',
      field: 'eps',
      width: '160px',
      tipo: 'text',
    },
    {
      header: 'PROCEDENCIA',
      field: 'procedencia',
      width: '150px',
      tipo: 'number',
    },
    {
      header: 'CONSEJERIA',
      field: 'consejeria',
      width: '320px',
      tipo: 'consejeria',
    },
    {
      header: 'ACCIONES',
      field: 'acciones',
      width: '120px',
      tipo: 'acciones',
    },
  ];

  // Utilidades
  private tempIdCounter: number = -1;

  constructor(
    private tableLecheExtraidaService: TableLecheExtraidaService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadDataLecheExtraida();
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * Cargar datos de la tabla
   */
  loadDataLecheExtraida(): void {
    this.loading = true;

    // Simular delay de carga
    setTimeout(() => {
      try {
        this.dataLecheExtraida = this.tableLecheExtraidaService.getTableLecheExtraidaData();
        this.showSuccessMessage(`${this.dataLecheExtraida.length} registros cargados correctamente`);
      } catch (error) {
        this.showErrorMessage('Error al cargar los datos');
        console.error('Error al cargar datos:', error);
      } finally {
        this.loading = false;
      }
    }, 800);
  }

  /**
   * Crear nuevo registro
   */
  crearNuevoRegistroLecheExtraida(): void {
    if (this.hasNewRowInEditing) {
      this.showWarningMessage('Debe guardar o cancelar el registro actual antes de crear uno nuevo');
      return;
    }

    const nuevoRegistro = this.createNewRecord();
    this.dataLecheExtraida.push(nuevoRegistro);
    this.dataLecheExtraida = [...this.dataLecheExtraida];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  /**
   * Iniciar edición de fila
   */
  onRowEditInit(dataRow: any): void {
    if (this.isAnyRowEditing()) {
      this.showWarningMessage('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    this.cloneRowForEditing(dataRow);
    this.editingRow = dataRow;
    this.initializeAuxiliaryFields(dataRow);

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = true;
    }
  }

  /**
   * Guardar edición de fila
   */
  onRowEditSave(dataRow: any, index: number, event: MouseEvent): void {
    this.procesarFechas(dataRow);

    if (!this.validateRequiredFields(dataRow)) {
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
   * Cancelar edición de fila
   */
  onRowEditCancel(dataRow: any, index: number): void {
    if (dataRow.isNew) {
      this.dataLecheExtraida.splice(index, 1);
      this.dataLecheExtraida = [...this.dataLecheExtraida];
    } else {
      this.restoreOriginalData(dataRow, index);
    }

    this.resetEditingState();
  }

  /**
   * Click en fila
   */
  onRowClick(rowData: any): void {
    if (this.isAnyRowEditing()) return;
    console.log('Fila seleccionada:', rowData);
    this.rowClick.emit(rowData);
  }

  // ==================== MÉTODOS DE VALIDACIÓN Y ESTADO ====================

  isEditing(rowData: any): boolean {
    return this.editingRow !== null &&
      ((this.editingRow.id_extraccion === rowData.id_extraccion) ||
        (this.editingRow.isNew && rowData.isNew));
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ==================== MÉTODOS DE CONSEJERÍA ====================

  getConsejeriaValue(rowData: any, type: 'individual' | 'grupal'): number | null {
    return rowData?.consejeria?.[type] ?? null;
  }

  onConsejeriaIndividualChange(rowIndex: number, value: number): void {
    this.updateConsejeriaValue(rowIndex, 'individual', value);
  }

  onConsejeriaGrupalChange(rowIndex: number, value: number): void {
    this.updateConsejeriaValue(rowIndex, 'grupal', value);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Crear nuevo registro con valores por defecto
   */
  private createNewRecord(): any {
    const fechaActualColombia = new Date();

    return {
      id_extraccion: null,
      fecha_registro: this.formatearFechaParaMostrar(fechaActualColombia),
      fecha_registro_aux: fechaActualColombia,
      apellidos_nombre: '',
      edad: '',
      fecha_nacimiento_aux: null,
      identificacion: '',
      municipio: '',
      telefono: '',
      eps: '',
      procedencia: '',
      consejeria: {
        individual: null,
        grupal: null
      },
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  /**
   * Clonar fila para edición
   */
  private cloneRowForEditing(dataRow: any): void {
    const rowId = this.getRowId(dataRow);
    this.clonedLecheExtraida[rowId] = {
      ...dataRow,
      consejeria: {
        individual: dataRow.consejeria?.individual ?? null,
        grupal: dataRow.consejeria?.grupal ?? null
      },
      fecha_registro_aux: this.parsearFechaParaCalendario(dataRow.fecha_registro),
      fecha_nacimiento_aux: dataRow.fecha_nacimiento_aux || null
    };
  }

  /**
   * Inicializar campos auxiliares
   */
  private initializeAuxiliaryFields(dataRow: any): void {
    if (!dataRow.fecha_registro_aux) {
      dataRow.fecha_registro_aux = this.parsearFechaParaCalendario(dataRow.fecha_registro);
    }
  }

  /**
   * Actualizar valor de consejería
   */
  private updateConsejeriaValue(rowIndex: number, type: 'individual' | 'grupal', value: number): void {
    if (!this.dataLecheExtraida[rowIndex].consejeria) {
      this.dataLecheExtraida[rowIndex].consejeria = {
        individual: null,
        grupal: null
      };
    }
    this.dataLecheExtraida[rowIndex].consejeria[type] = value;
  }

  /**
   * Calcular edad basada en fecha de nacimiento (zona horaria Colombia UTC-5)
   */
  private ageCalculate(birthDate: Date): number {
    const fechaNacimiento = new Date(birthDate);
    const fechaActual = new Date();

    // Ajuste para zona horaria de Colombia (UTC-5)
    const offsetColombia = -5 * 60;
    const offsetLocal = fechaActual.getTimezoneOffset();
    const diffMinutos = offsetLocal - offsetColombia;
    const fechaActualColombia = new Date(fechaActual.getTime() + (diffMinutos * 60000));

    let edad = fechaActualColombia.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActualColombia.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && fechaActualColombia.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Procesar fechas antes de guardar
   */
  private procesarFechas(dataRow: any): void {
    // Procesar fecha de registro
    if (dataRow.fecha_registro_aux) {
      dataRow.fecha_registro = this.formatearFechaParaMostrar(dataRow.fecha_registro_aux);
    }

    // Procesar fecha de nacimiento y calcular edad
    if (dataRow.fecha_nacimiento_aux) {
      dataRow.edad = this.ageCalculate(dataRow.fecha_nacimiento_aux);
    }
  }

  /**
   * Formatear fecha para mostrar (dd/mm/yyyy)
   */
  private formatearFechaParaMostrar(fecha: Date): string {
    if (!fecha) return 'Sin fecha';

    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Parsear fecha desde string para calendario
   */
  private parsearFechaParaCalendario(fechaString: string | Date): Date | null {
    if (!fechaString || fechaString === 'Sin fecha') return null;
    if (fechaString instanceof Date) return fechaString;
    if (typeof fechaString !== 'string') return null;

    if (fechaString.includes('/')) {
      const [day, month, year] = fechaString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0, 0);
    }

    if (fechaString.includes('-')) {
      const [year, month, day] = fechaString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0, 0);
    }

    return null;
  }

  /**
   * Obtener ID único de la fila
   */
  private getRowId(dataRow: any): string {
    return dataRow.id_extraccion?.toString() || dataRow._uid || 'unknown';
  }

  /**
   * Validar campos obligatorios
   */
  private validateRequiredFields(dataRow: any): boolean {
    const requiredFieldsMap = {
      'apellidos_nombre': 'Apellidos y Nombre',
      'edad': 'Edad',
      'identificacion': 'Identificación',
      'municipio': 'Municipio',
      'telefono': 'Teléfono',
      'eps': 'EPS',
      'procedencia': 'Procedencia'
    };

    // Validar campos de texto
    for (const [field, label] of Object.entries(requiredFieldsMap)) {
      const value = dataRow[field];
      if (!value || value.toString().trim() === '') {
        this.showErrorMessage(`El campo ${label} es obligatorio`);
        return false;
      }
    }

    // Validar consejería
    const individualSeleccionado = dataRow.consejeria?.individual !== null && dataRow.consejeria?.individual !== undefined;
    const grupalSeleccionado = dataRow.consejeria?.grupal !== null && dataRow.consejeria?.grupal !== undefined;

    if (!individualSeleccionado && !grupalSeleccionado) {
      this.showErrorMessage('Debe seleccionar al menos una opción de consejería (Individual o Grupal)');
      return false;
    }

    return true;
  }

  /**
   * Guardar nuevo registro (simulado)
   */
  private guardarNuevoRegistro(dataRow: any, rowElement: HTMLTableRowElement): void {
    setTimeout(() => {
      dataRow.id_extraccion = Date.now(); // Simular ID del backend
      dataRow.isNew = false;
      delete dataRow._uid;

      this.resetEditingState();
      this.table.saveRowEdit(dataRow, rowElement);
      this.showSuccessMessage('Registro guardado correctamente');
    }, 500);
  }

  /**
   * Actualizar registro existente (simulado)
   */
  private actualizarRegistroExistente(dataRow: any, rowElement: HTMLTableRowElement): void {
    setTimeout(() => {
      const rowId = this.getRowId(dataRow);
      delete this.clonedLecheExtraida[rowId];
      this.editingRow = null;
      this.hasNewRowInEditing = false;

      this.table.saveRowEdit(dataRow, rowElement);
      this.showSuccessMessage('Registro actualizado correctamente');
    }, 500);
  }

  /**
   * Restaurar datos originales
   */
  private restoreOriginalData(dataRow: any, index: number): void {
    const rowId = this.getRowId(dataRow);
    const originalData = this.clonedLecheExtraida[rowId];

    if (originalData) {
      this.dataLecheExtraida[index] = {
        ...originalData,
        consejeria: {
          individual: originalData.consejeria?.individual ?? null,
          grupal: originalData.consejeria?.grupal ?? null
        }
      };
      delete this.clonedLecheExtraida[rowId];
    }
  }

  /**
   * Cancelar edición actual
   */
  private cancelCurrentEditing(): void {
    if (this.editingRow?.isNew) {
      const index = this.dataLecheExtraida.findIndex(item => item._uid === this.editingRow!._uid);
      if (index !== -1) {
        this.dataLecheExtraida.splice(index, 1);
        this.dataLecheExtraida = [...this.dataLecheExtraida];
      }
    } else if (this.editingRow) {
      const rowId = this.getRowId(this.editingRow);
      const index = this.dataLecheExtraida.findIndex(item => this.getRowId(item) === rowId);

      if (index !== -1 && this.clonedLecheExtraida[rowId]) {
        this.restoreOriginalData(this.editingRow, index);
      }
    }

    this.resetEditingState();
  }

  /**
   * Resetear estado de edición
   */
  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  // ==================== MÉTODOS DE MENSAJES ====================

  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  private showWarningMessage(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      key: 'tr',
      life: 3000,
    });
  }

  private showInfoMessage(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: message,
      key: 'tr',
      life: 2000,
    });
  }
}
