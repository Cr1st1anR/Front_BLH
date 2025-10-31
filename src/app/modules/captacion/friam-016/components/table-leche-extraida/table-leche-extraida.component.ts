import { CommonModule } from '@angular/common';
import { Component, ViewChild, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { TableLecheExtraidaService } from './services/table-leche-extraida.service';
import type { LecheExtraidaTable } from '../interfaces/leche-extraida-table.interface';
import type { LecheExtraidaCreate } from '../interfaces/leche-extraida-create.interface';
import { LecheSalaExtraccion } from '../interfaces/leche-sala-extraccion.interface';

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
export class TableLecheExtraidaComponent implements OnInit, OnDestroy {
  @ViewChild('tableLecheExtraida') table!: Table;
  @Output() rowClick = new EventEmitter<LecheExtraidaTable>();
  @Input() filtroFecha: { year: number; month: number } | null = null;

  loading = false;
  hasNewRowInEditing = false;
  editingRow: LecheExtraidaTable | null = null;
  dataLecheExtraida: LecheExtraidaTable[] = [];
  dataLecheExtraidaFiltered: LecheExtraidaTable[] = [];

  private readonly clonedLecheExtraida: Record<string, LecheExtraidaTable> = {};
  private tempIdCounter = -1;
  private readonly subscriptions = new Subscription();

  readonly headersLecheExtraida = [
    { header: 'FECHA DE REGISTRO', field: 'fecha_registro', width: '200px', tipo: 'date' },
    { header: 'NOMBRE Y APELLIDO', field: 'apellidos_nombre', width: '250px', tipo: 'text' },
    { header: 'EDAD', field: 'edad', width: '120px', tipo: 'edad' },
    { header: 'IDENTIFICACIÓN', field: 'identificacion', width: '180px', tipo: 'number' },
    { header: 'MUNICIPIO', field: 'municipio', width: '180px', tipo: 'text' },
    { header: 'TELÉFONO', field: 'telefono', width: '160px', tipo: 'number' },
    { header: 'EPS', field: 'eps', width: '160px', tipo: 'text' },
    { header: 'PROCEDENCIA', field: 'procedencia', width: '150px', tipo: 'text' },
    { header: 'CONSEJERIA', field: 'consejeria', width: '320px', tipo: 'consejeria' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'acciones' },
  ];

  constructor(
    private tableLecheExtraidaService: TableLecheExtraidaService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Inicializa el componente cargando datos y configurando suscripciones
   */
  private initializeComponent(): void {
    this.loadDataLecheExtraida();
    this.setupDataUpdateSubscription();
  }

  /**
   * Configura la suscripción para actualizaciones automáticas de datos
   */
  private setupDataUpdateSubscription(): void {
    const updateSub = this.tableLecheExtraidaService.dataUpdated$.subscribe(updated => {
      if (updated) {
        this.loadDataLecheExtraida();
        this.tableLecheExtraidaService.resetUpdateStatus();
      }
    });
    this.subscriptions.add(updateSub);
  }

  /**
   * Aplica filtro por fecha y muestra notificación
   */
  filtrarPorFecha(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  /**
   * Aplica filtro inicial con notificación
   */
  aplicarFiltroInicialConNotificacion(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  /**
   * Carga todos los datos de leche extraída desde el servicio
   */
  loadDataLecheExtraida(): void {
    this.loading = true;

    const loadSub = this.tableLecheExtraidaService.getAllLecheSalaExtraccion().subscribe({
      next: (data) => {
        this.dataLecheExtraida = data;
        this.dataLecheExtraidaFiltered = [...this.dataLecheExtraida];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        this.showErrorMessage('Error al cargar los datos');
        console.error('Error al cargar datos:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(loadSub);
  }

  /**
   * Aplica filtro por fecha y muestra la notificación correspondiente
   */
  private aplicarFiltroConNotificacion(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  /**
   * Crea un nuevo registro en la tabla
   */
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

  /**
   * Inicia la edición de una fila
   */
  onRowEditInit(dataRow: LecheExtraidaTable): void {
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
   * Guarda los cambios de la fila editada
   */
  onRowEditSave(dataRow: LecheExtraidaTable, index: number, event: MouseEvent): void {
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
   * Cancela la edición de una fila
   */
  onRowEditCancel(dataRow: LecheExtraidaTable, index: number): void {
    if (dataRow.isNew) {
      this.removeNewRowFromData(dataRow);
    } else {
      this.restoreOriginalData(dataRow, index);
    }
    this.resetEditingState();
  }

  /**
   * Maneja el click en una fila de la tabla
   */
  onRowClick(rowData: LecheExtraidaTable): void {
    if (this.isAnyRowEditing()) return;
    this.rowClick.emit(rowData);
  }

  /**
   * Verifica si una fila específica está siendo editada
   */
  isEditing(rowData: LecheExtraidaTable): boolean {
    return this.editingRow !== null &&
      ((this.editingRow.id_extraccion === rowData.id_extraccion) ||
        (!!this.editingRow.isNew && !!rowData.isNew));
  }

  /**
   * Verifica si hay alguna fila en estado de edición
   */
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  /**
   * Verifica si el botón de editar debe estar deshabilitado
   */
  isEditButtonDisabled(rowData: LecheExtraidaTable): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  /**
   * Obtiene el valor actual de consejería
   */
  getConsejeriaValue(rowData: LecheExtraidaTable): number | null {
    return rowData?.consejeria ?? null;
  }

  /**
   * Maneja el cambio en el valor de consejería
   */
  onConsejeriaChange(rowIndex: number, value: number): void {
    this.updateConsejeriaValue(rowIndex, value);
  }

  /**
   * Remueve una nueva fila de los datos cuando se cancela
   */
  private removeNewRowFromData(dataRow: LecheExtraidaTable): void {
    const originalIndex = this.dataLecheExtraida.findIndex(item => item._uid === dataRow._uid);
    if (originalIndex !== -1) {
      this.dataLecheExtraida.splice(originalIndex, 1);
    }
    this.aplicarFiltros();
  }

  /**
   * Aplica todos los filtros activos a los datos
   */
  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataLecheExtraida];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataLecheExtraidaFiltered = datosFiltrados;
  }

  /**
   * Filtra los datos por mes y año específicos
   */
  private filtrarPorMesYAno(datos: LecheExtraidaTable[], filtro: { year: number; month: number }): LecheExtraidaTable[] {
    return datos.filter(item => {
      if (!item.fecha_registro) return false;

      const fechaParts = item.fecha_registro.split('/');
      if (fechaParts.length !== 3) return false;

      const [dia, mes, ano] = fechaParts.map((part: string) => parseInt(part));
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;

      return mes === filtro.month && ano === filtro.year;
    });
  }

  /**
   * Muestra una notificación basada en los resultados del filtro
   */
  private mostrarNotificacionFiltro(): void {
    const hasResults = this.dataLecheExtraidaFiltered.length > 0;
    const mensaje = hasResults
      ? 'Datos cargados para la fecha seleccionada'
      : 'No hay datos para la fecha seleccionada';

    this.showMessage(hasResults ? 'success' : 'info', mensaje);
  }

  /**
   * Crea un nuevo registro con valores por defecto
   */
  private createNewRecord(): LecheExtraidaTable {
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
      consejeria: null,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  /**
   * Clona los datos de una fila para permitir cancelar cambios
   */
  private cloneRowForEditing(dataRow: LecheExtraidaTable): void {
    const rowId = this.getRowId(dataRow);
    this.clonedLecheExtraida[rowId] = {
      ...dataRow,
      consejeria: dataRow.consejeria ?? null,
      fecha_registro_aux: this.parsearFechaParaCalendario(dataRow.fecha_registro),
      fecha_nacimiento_aux: dataRow.fecha_nacimiento_aux || null
    };
  }

  /**
   * Inicializa los campos auxiliares necesarios para la edición
   */
  private initializeAuxiliaryFields(dataRow: LecheExtraidaTable): void {
    if (!dataRow.fecha_registro_aux) {
      dataRow.fecha_registro_aux = this.parsearFechaParaCalendario(dataRow.fecha_registro);
    }

    if (!dataRow.fecha_nacimiento_aux) {
      if (dataRow.fecha_nacimiento_original) {
        dataRow.fecha_nacimiento_aux = this.tableLecheExtraidaService.parseDateFromApi(dataRow.fecha_nacimiento_original);
      } else if (dataRow.edad) {
        const fechaActual = new Date();
        const añoNacimiento = fechaActual.getFullYear() - parseInt(dataRow.edad.toString());
        dataRow.fecha_nacimiento_aux = new Date(añoNacimiento, 6, 1, 12, 0, 0, 0);
      }
    }
  }

  /**
   * Actualiza el valor de consejería en ambos arrays de datos
   */
  private updateConsejeriaValue(rowIndex: number, value: number): void {
    const filteredRow = this.dataLecheExtraidaFiltered[rowIndex];
    const originalIndex = this.dataLecheExtraida.findIndex(item =>
      this.getRowId(item) === this.getRowId(filteredRow)
    );

    if (originalIndex === -1) return;

    this.dataLecheExtraida[originalIndex].consejeria = value;
    filteredRow.consejeria = value;
  }

  /**
   * Calcula la edad basada en la fecha de nacimiento
   */
  private ageCalculate(birthDate: Date): number {
    if (!birthDate) return 0;

    const fechaNacimiento = new Date(birthDate);
    const fechaActual = new Date();

    fechaNacimiento.setHours(12, 0, 0, 0);
    fechaActual.setHours(12, 0, 0, 0);

    let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Procesa las fechas auxiliares y actualiza los campos correspondientes
   */
  private procesarFechas(dataRow: LecheExtraidaTable): void {
    if (dataRow.fecha_registro_aux) {
      dataRow.fecha_registro = this.formatearFechaParaMostrar(dataRow.fecha_registro_aux);
    }

    if (dataRow.fecha_nacimiento_aux) {
      dataRow.edad = this.ageCalculate(dataRow.fecha_nacimiento_aux).toString();
    }
  }

  /**
   * Formatea una fecha para mostrar en formato DD/MM/YYYY
   */
  private formatearFechaParaMostrar(fecha: Date): string {
    if (!fecha) return 'Sin fecha';

    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Parsea una fecha string o Date para usar en el calendario
   */
  private parsearFechaParaCalendario(fechaString: string | Date): Date | null {
    if (!fechaString || fechaString === 'Sin fecha') return null;
    if (fechaString instanceof Date) return fechaString;
    if (typeof fechaString !== 'string') return null;

    const parseFromFormat = (dateStr: string, separator: string): Date | null => {
      const parts = dateStr.split(separator).map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return null;

      const [first, second, third] = parts;
      if (separator === '/') {
        return new Date(third, second - 1, first, 12, 0, 0, 0);
      } else {
        return new Date(first, second - 1, third, 12, 0, 0, 0);
      }
    };

    return parseFromFormat(fechaString, '/') || parseFromFormat(fechaString, '-');
  }

  /**
   * Obtiene el ID único de una fila
   */
  private getRowId(dataRow: LecheExtraidaTable): string {
    return dataRow.id_extraccion?.toString() || dataRow._uid || 'unknown';
  }

  /**
   * Valida que todos los campos requeridos estén completos
   */
  private validateRequiredFields(dataRow: LecheExtraidaTable): boolean {
    const requiredTextFields = {
      'apellidos_nombre': 'Apellidos y Nombre',
      'edad': 'Edad',
      'identificacion': 'Identificación',
      'municipio': 'Municipio',
      'telefono': 'Teléfono',
      'eps': 'EPS',
      'procedencia': 'Procedencia'
    };

    for (const [field, label] of Object.entries(requiredTextFields)) {
      const value = dataRow[field as keyof LecheExtraidaTable];
      if (!value || value.toString().trim() === '') {
        this.showMessage('error', `El campo ${label} es obligatorio`);
        return false;
      }
    }

    if (dataRow.consejeria === null || dataRow.consejeria === undefined) {
      this.showMessage('error', 'Debe seleccionar una opción de consejería');
      return false;
    }

    if (!dataRow.isNew) {
      if (!dataRow.fecha_registro_aux) {
        this.showMessage('error', 'La fecha de registro es obligatoria');
        return false;
      }

      if (!dataRow.fecha_nacimiento_aux) {
        this.showMessage('error', 'La fecha de nacimiento es obligatoria para calcular la edad');
        return false;
      }
    }

    return true;
  }

  /**
   * Guarda un nuevo registro en el servidor
   */
  private guardarNuevoRegistro(dataRow: LecheExtraidaTable, rowElement: HTMLTableRowElement): void {
    const createData = this.prepararDatosParaGuardar(dataRow);
    this.loading = true;

    const createSub = this.tableLecheExtraidaService.createLecheSalaExtraccion(createData).subscribe({
      next: () => {
        this.resetEditingState();
        this.table.saveRowEdit(dataRow, rowElement);
        this.showMessage('success', 'Registro guardado correctamente');
        this.loading = false;
      },
      error: (error) => {
        this.showErrorMessage('Error al guardar el registro');
        console.error('Error al guardar:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(createSub);
  }

  /**
   * Actualiza un registro existente en el servidor
   */
  private actualizarRegistroExistente(dataRow: LecheExtraidaTable, rowElement: HTMLTableRowElement): void {
    const updateData = this.prepararDatosParaGuardar(dataRow);
    this.loading = true;

    const updateSub = this.tableLecheExtraidaService.updateLecheSalaExtraccion(dataRow.id_extraccion!, updateData).subscribe({
      next: () => {
        const rowId = this.getRowId(dataRow);
        delete this.clonedLecheExtraida[rowId];
        this.editingRow = null;
        this.hasNewRowInEditing = false;

        this.table.saveRowEdit(dataRow, rowElement);
        this.showMessage('success', 'Registro actualizado correctamente');
        this.loading = false;
      },
      error: (error) => {
        this.showErrorMessage('Error al actualizar el registro');
        console.error('Error al actualizar:', error);
        this.loading = false;
      }
    });

    this.subscriptions.add(updateSub);
  }

  /**
   * Prepara los datos del formulario para enviar al servidor
   */
  private prepararDatosParaGuardar(dataRow: LecheExtraidaTable): LecheExtraidaCreate {
    const nombreCompleto = dataRow.apellidos_nombre.trim();
    const partesNombre = nombreCompleto.split(' ');
    const nombre = partesNombre[0] || '';
    const apellido = partesNombre.slice(1).join(' ') || '';

    return {
      nombre,
      apellido,
      procedencia: dataRow.procedencia,
      consejeria: dataRow.consejeria!,
      municipio: dataRow.municipio,
      fechaRegistro: this.tableLecheExtraidaService.formatDateForApi(dataRow.fecha_registro_aux!),
      fechaNacimiento: this.tableLecheExtraidaService.formatDateForApi(dataRow.fecha_nacimiento_aux!),
      documento: dataRow.identificacion,
      telefono: dataRow.telefono,
      eps: dataRow.eps
    };
  }

  /**
   * Restaura los datos originales de una fila cancelada
   */
  private restoreOriginalData(dataRow: LecheExtraidaTable, index: number): void {
    const rowId = this.getRowId(dataRow);
    const originalData = this.clonedLecheExtraida[rowId];

    if (!originalData) return;

    const originalIndex = this.dataLecheExtraida.findIndex(item => this.getRowId(item) === rowId);
    if (originalIndex !== -1) {
      this.dataLecheExtraida[originalIndex] = {
        ...originalData,
        consejeria: originalData.consejeria ?? null
      };
    }

    this.aplicarFiltros();
    delete this.clonedLecheExtraida[rowId];
  }

  /**
   * Cancela la edición actual y restaura el estado original
   */
  private cancelCurrentEditing(): void {
    if (this.editingRow?.isNew) {
      this.removeNewRowFromData(this.editingRow);
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

  /**
   * Reinicia el estado de edición del componente
   */
  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  /**
   * Muestra un mensaje toast al usuario
   */
  private showMessage(severity: 'success' | 'error' | 'warn' | 'info', detail: string): void {
    const config = {
      success: { summary: 'Éxito', life: 2000 },
      error: { summary: 'Error', life: 3000 },
      warn: { summary: 'Advertencia', life: 3000 },
      info: { summary: 'Información', life: 2000 }
    };

    this.messageService.add({
      severity,
      summary: config[severity].summary,
      detail,
      key: 'tr',
      life: config[severity].life
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
