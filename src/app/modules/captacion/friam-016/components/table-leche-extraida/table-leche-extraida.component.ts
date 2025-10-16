import { CommonModule } from '@angular/common';
import { Component, ViewChild, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
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
  @Input() filtroFecha: { year: number; month: number } | null = null;

  loading = false;
  hasNewRowInEditing = false;
  editingRow: any = null;
  dataLecheExtraida: any[] = [];
  dataLecheExtraidaFiltered: any[] = [];

  private clonedLecheExtraida: { [s: string]: any } = {};
  private tempIdCounter = -1;

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

  constructor(
    private tableLecheExtraidaService: TableLecheExtraidaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDataLecheExtraida();
  }

  filtrarPorFecha(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  aplicarFiltroInicialConNotificacion(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  loadDataLecheExtraida(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataLecheExtraida = this.tableLecheExtraidaService.getTableLecheExtraidaData();
        this.dataLecheExtraidaFiltered = [...this.dataLecheExtraida];
      } catch (error) {
        this.showErrorMessage('Error al cargar los datos');
        console.error('Error al cargar datos:', error);
      } finally {
        this.loading = false;
      }
    }, 800);
  }

  crearNuevoRegistroLecheExtraida(): void {
    if (this.hasNewRowInEditing) {
      this.showWarningMessage('Debe guardar o cancelar el registro actual antes de crear uno nuevo');
      return;
    }

    const nuevoRegistro = this.createNewRecord();
    this.dataLecheExtraida.push(nuevoRegistro);
    this.aplicarFiltros();
    
    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

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

  onRowEditCancel(dataRow: any, index: number): void {
    if (dataRow.isNew) {
      const originalIndex = this.dataLecheExtraida.findIndex(item => item._uid === dataRow._uid);
      if (originalIndex !== -1) {
        this.dataLecheExtraida.splice(originalIndex, 1);
      }
      this.aplicarFiltros();
    } else {
      this.restoreOriginalData(dataRow, index);
    }

    this.resetEditingState();
  }

  onRowClick(rowData: any): void {
    if (this.isAnyRowEditing()) return;
    this.rowClick.emit(rowData);
  }

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

  getConsejeriaValue(rowData: any, type: 'individual' | 'grupal'): number | null {
    return rowData?.consejeria?.[type] ?? null;
  }

  onConsejeriaIndividualChange(rowIndex: number, value: number): void {
    this.updateConsejeriaValue(rowIndex, 'individual', value);
  }

  onConsejeriaGrupalChange(rowIndex: number, value: number): void {
    this.updateConsejeriaValue(rowIndex, 'grupal', value);
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataLecheExtraida];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataLecheExtraidaFiltered = datosFiltrados;
  }

  private filtrarPorMesYAno(datos: any[], filtro: { year: number; month: number }): any[] {
    return datos.filter(item => {
      if (!item.fecha_registro) return false;

      const fechaParts = item.fecha_registro.split('/');
      if (fechaParts.length !== 3) return false;

      const [dia, mes, ano] = fechaParts.map((part: string) => parseInt(part));
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;

      return mes === filtro.month && ano === filtro.year;
    });
  }

  private mostrarNotificacionFiltro(): void {
    const mensaje = this.dataLecheExtraidaFiltered.length > 0
      ? 'Datos cargados para la fecha seleccionada'
      : 'No hay datos para la fecha seleccionada';
    
    const tipo = this.dataLecheExtraidaFiltered.length > 0 ? 'success' : 'info';
    this.showMessage(tipo, mensaje);
  }

  private createNewRecord(): any {
    const fechaActual = new Date();

    return {
      id_extraccion: null,
      fecha_registro: this.formatearFechaParaMostrar(fechaActual),
      fecha_registro_aux: fechaActual,
      apellidos_nombre: '',
      edad: '',
      fecha_nacimiento_aux: null,
      identificacion: '',
      municipio: '',
      telefono: '',
      eps: '',
      procedencia: '',
      consejeria: { individual: null, grupal: null },
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

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

  private initializeAuxiliaryFields(dataRow: any): void {
    if (!dataRow.fecha_registro_aux) {
      dataRow.fecha_registro_aux = this.parsearFechaParaCalendario(dataRow.fecha_registro);
    }
  }

  private updateConsejeriaValue(rowIndex: number, type: 'individual' | 'grupal', value: number): void {
    const filteredRow = this.dataLecheExtraidaFiltered[rowIndex];
    const originalIndex = this.dataLecheExtraida.findIndex(item => 
      this.getRowId(item) === this.getRowId(filteredRow)
    );

    if (originalIndex === -1) return;

    const ensureConsejeria = (row: any) => {
      if (!row.consejeria) {
        row.consejeria = { individual: null, grupal: null };
      }
    };

    ensureConsejeria(this.dataLecheExtraida[originalIndex]);
    ensureConsejeria(filteredRow);

    this.dataLecheExtraida[originalIndex].consejeria[type] = value;
    filteredRow.consejeria[type] = value;
  }

  private ageCalculate(birthDate: Date): number {
    const fechaNacimiento = new Date(birthDate);
    const fechaActual = new Date();
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

  private procesarFechas(dataRow: any): void {
    if (dataRow.fecha_registro_aux) {
      dataRow.fecha_registro = this.formatearFechaParaMostrar(dataRow.fecha_registro_aux);
    }

    if (dataRow.fecha_nacimiento_aux) {
      dataRow.edad = this.ageCalculate(dataRow.fecha_nacimiento_aux);
    }
  }

  private formatearFechaParaMostrar(fecha: Date): string {
    if (!fecha) return 'Sin fecha';

    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();

    return `${day}/${month}/${year}`;
  }

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

  private getRowId(dataRow: any): string {
    return dataRow.id_extraccion?.toString() || dataRow._uid || 'unknown';
  }

  private validateRequiredFields(dataRow: any): boolean {
    const requiredFields = {
      'apellidos_nombre': 'Apellidos y Nombre',
      'edad': 'Edad',
      'identificacion': 'Identificación',
      'municipio': 'Municipio',
      'telefono': 'Teléfono',
      'eps': 'EPS',
      'procedencia': 'Procedencia'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = dataRow[field];
      if (!value || value.toString().trim() === '') {
        this.showMessage('error', `El campo ${label} es obligatorio`);
        return false;
      }
    }

    const hasConsejeria = dataRow.consejeria?.individual !== null || dataRow.consejeria?.grupal !== null;
    if (!hasConsejeria) {
      this.showMessage('error', 'Debe seleccionar al menos una opción de consejería (Individual o Grupal)');
      return false;
    }

    return true;
  }

  private guardarNuevoRegistro(dataRow: any, rowElement: HTMLTableRowElement): void {
    setTimeout(() => {
      dataRow.id_extraccion = Date.now();
      dataRow.isNew = false;
      delete dataRow._uid;

      this.aplicarFiltros();
      this.resetEditingState();
      this.table.saveRowEdit(dataRow, rowElement);
      this.showMessage('success', 'Registro guardado correctamente');
    }, 500);
  }

  private actualizarRegistroExistente(dataRow: any, rowElement: HTMLTableRowElement): void {
    setTimeout(() => {
      const rowId = this.getRowId(dataRow);
      delete this.clonedLecheExtraida[rowId];
      this.editingRow = null;
      this.hasNewRowInEditing = false;

      this.aplicarFiltros();
      this.table.saveRowEdit(dataRow, rowElement);
      this.showMessage('success', 'Registro actualizado correctamente');
    }, 500);
  }

  private restoreOriginalData(dataRow: any, index: number): void {
    const rowId = this.getRowId(dataRow);
    const originalData = this.clonedLecheExtraida[rowId];

    if (!originalData) return;

    const originalIndex = this.dataLecheExtraida.findIndex(item => this.getRowId(item) === rowId);
    if (originalIndex !== -1) {
      this.dataLecheExtraida[originalIndex] = {
        ...originalData,
        consejeria: {
          individual: originalData.consejeria?.individual ?? null,
          grupal: originalData.consejeria?.grupal ?? null
        }
      };
    }
    
    this.aplicarFiltros();
    delete this.clonedLecheExtraida[rowId];
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow?.isNew) {
      const index = this.dataLecheExtraida.findIndex(item => item._uid === this.editingRow!._uid);
      if (index !== -1) {
        this.dataLecheExtraida.splice(index, 1);
        this.aplicarFiltros();
      }
    } else if (this.editingRow) {
      const rowId = this.getRowId(this.editingRow);
      const index = this.dataLecheExtraida.findIndex(item => this.getRowId(item) === rowId);

      if (index !== -1 && this.clonedLecheExtraida[rowId]) {
        this.dataLecheExtraida[index] = this.clonedLecheExtraida[rowId];
        this.aplicarFiltros();
        delete this.clonedLecheExtraida[rowId];
      }
    }

    this.resetEditingState();
  }

  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  private showMessage(severity: 'success' | 'error' | 'warn' | 'info', detail: string): void {
    const summaryMap = {
      success: 'Éxito',
      error: 'Error',
      warn: 'Advertencia',
      info: 'Información'
    };

    const lifeMap = {
      success: 2000,
      error: 3000,
      warn: 3000,
      info: 2000
    };

    this.messageService.add({
      severity,
      summary: summaryMap[severity],
      detail,
      key: 'tr',
      life: lifeMap[severity]
    });
  }

  private showSuccessMessage(message: string): void {
    this.showMessage('success', message);
  }

  private showErrorMessage(message: string): void {
    this.showMessage('error', message);
  }

  private showWarningMessage(message: string): void {
    this.showMessage('warn', message);
  }

  private showInfoMessage(message: string): void {
    this.showMessage('info', message);
  }
}