import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { DialogExtraccionesService } from '../services/dialog-extracciones.service';
import type { ExtraccionTable } from '../../interfaces/extraccion-table.interface';
import { LecheSalaExtraccion } from '../../interfaces/leche-sala-extraccion.interface';
import { LecheExtraidaTable } from '../../interfaces/leche-extraida-table.interface';

@Component({
  selector: 'table-extraccion',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    FormsModule
  ],
  templateUrl: './table-extraccion.component.html',
  styleUrl: './table-extraccion.component.scss',
  providers: [MessageService]
})
export class TableExtraccionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idExtraccion: LecheExtraidaTable | null = null;

  @ViewChild('tableExtracciones') table!: Table;

  loading = false;
  editingRow: ExtraccionTable | null = null;
  hasNewRowInEditing = false;
  dataExtracciones: ExtraccionTable[] = [];

  private readonly clonedExtracciones: Record<string, ExtraccionTable> = {};
  private isInitialLoad = true;
  private readonly subscriptions = new Subscription();

  readonly headersExtracciones = [
    { header: 'FECHA', field: 'fecha', width: '160px', tipo: 'date' },
    { header: 'EXTRACCIÓN 1', field: 'extraccion_1', width: '240px', tipo: 'extraccion_1' },
    { header: 'EXTRACCIÓN 2', field: 'extraccion_2', width: '240px', tipo: 'extraccion_2' },
    { header: 'MOTIVO DE CONSULTA', field: 'motivo_consulta', width: '250px', tipo: 'text' },
    { header: 'OBSERVACIONES', field: 'observaciones', width: '350px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'acciones' }
  ];

  constructor(
    private readonly dialogExtraccionesService: DialogExtraccionesService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idExtraccion']?.currentValue) {
      this.loadExtracciones();
      this.isInitialLoad = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Inicializa el componente configurando las suscripciones necesarias
   */
  private initializeComponent(): void {
    this.setupDataUpdateSubscription();
  }

  /**
   * Configura la suscripción para actualizaciones automáticas de datos
   */
  private setupDataUpdateSubscription(): void {
    const updateSub = this.dialogExtraccionesService.dataUpdated$.subscribe(updated => {
      if (updated) {
        this.loadExtracciones();
        this.dialogExtraccionesService.resetUpdateStatus();
      }
    });
    this.subscriptions.add(updateSub);
  }

  /**
   * Carga las extracciones desde el servicio y las prepara para su edición
   */
  loadExtracciones(): void {
    if (!this.idExtraccion) return;

    this.loading = true;

    const loadSub = this.dialogExtraccionesService.getExtracciones(Number(this.idExtraccion.id_extraccion)).subscribe({
      next: (extracciones: ExtraccionTable[]) => {
        this.dataExtracciones = this.prepareExtraccionesForEditing(extracciones);
        this.mostrarMensajeCarga(extracciones);
        this.loading = false;
      },
      error: (error) => {
        this.manejarErrorCarga(error);
        this.loading = false;
      }
    });

    this.subscriptions.add(loadSub);
  }

  /**
   * Prepara los datos de extracciones agregando campos auxiliares para la edición
   */
  private prepareExtraccionesForEditing(extracciones: ExtraccionTable[]): ExtraccionTable[] {
    return extracciones.map((item: ExtraccionTable) => ({
      ...item,
      fecha_aux: item.fecha ? this.parsearFechaSegura(item.fecha) : null,
      extraccion_1: {
        ...item.extraccion_1,
        am_aux: item.extraccion_1?.am ? this.convertHoursToDate(item.extraccion_1.am) : null
      },
      extraccion_2: {
        ...item.extraccion_2,
        pm_aux: item.extraccion_2?.pm ? this.convertHoursToDate(item.extraccion_2.pm) : null
      },
      procedencia: this.idExtraccion?.procedencia,
      madrePotencial: this.idExtraccion?.madrePotencial ?? undefined
    }));
  }

  /**
   * Crea una nueva extracción en la tabla
   */
  crearNuevaExtraccion(): void {
    if (!this.validarCreacionExtraccion()) return;

    this.loading = true;

    this.dialogExtraccionesService.crearExtraccion(this.idExtraccion!, null)
      .then((nuevaExtraccion: ExtraccionTable) => {
        this.addNewExtraccionToTable(nuevaExtraccion);
        this.mostrarInfo('Nueva extracción creada. Seleccione la fecha y complete los campos requeridos.');
      })
      .catch(() => {
        this.mostrarError('Error al crear la nueva extracción');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  /**
   * Inicia la edición de una fila de extracción
   */
  onRowEditInit(rowData: ExtraccionTable): void {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.editingRow = { ...rowData };
    this.clonarExtraccionParaEdicion(rowData);
    this.inicializarCamposAuxiliares(rowData);
  }

  /**
   * Guarda los cambios de la fila editada
   */
  onRowEditSave(rowData: ExtraccionTable, index: number, event: MouseEvent): void {
    if (!rowData.fecha_aux) {
      this.mostrarError('Debe seleccionar una fecha para la extracción');
      return;
    }

    this.procesarFechas(rowData);
    this.procesarHoras(rowData);

    if (!this.validateRequiredFields(rowData)) return;

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (rowData.isNew) {
      this.guardarNuevaExtraccion(rowData, rowElement);
    } else {
      this.actualizarExtraccionExistente(rowData, rowElement);
    }
  }

  /**
   * Cancela la edición de una fila
   */
  onRowEditCancel(rowData: ExtraccionTable, index: number): void {
    if (rowData.isNew) {
      this.removeNewExtraccionFromTable(index);
    } else {
      this.restoreOriginalExtraccionData(rowData, index);
    }
    this.editingRow = null;
  }

  /**
   * Agrega una nueva extracción a la tabla y la pone en modo edición
   */
  private addNewExtraccionToTable(nuevaExtraccion: ExtraccionTable): void {
    this.prepararNuevaExtraccion(nuevaExtraccion);
    this.dataExtracciones.push(nuevaExtraccion);
    this.dataExtracciones = [...this.dataExtracciones];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevaExtraccion;

    setTimeout(() => this.table.initRowEdit(nuevaExtraccion), 100);
  }

  /**
   * Remueve una nueva extracción de la tabla cuando se cancela
   */
  private removeNewExtraccionFromTable(index: number): void {
    this.dataExtracciones.splice(index, 1);
    this.dataExtracciones = [...this.dataExtracciones];
    this.hasNewRowInEditing = false;
  }

  /**
   * Restaura los datos originales de una extracción cuando se cancela la edición
   */
  private restoreOriginalExtraccionData(rowData: ExtraccionTable, index: number): void {
    const clonedData = this.clonedExtracciones[rowData.id_registro_extraccion];
    if (clonedData) {
      this.dataExtracciones[index] = this.reconstructExtraccionFromClone(clonedData);
    }
    delete this.clonedExtracciones[rowData.id_registro_extraccion];
  }

  /**
   * Reconstruye una extracción desde los datos clonados
   */
  private reconstructExtraccionFromClone(clonedData: ExtraccionTable): ExtraccionTable {
    return {
      ...clonedData,
      fecha_aux: clonedData.fecha_aux ? new Date(clonedData.fecha_aux) : null,
      extraccion_1: {
        am: clonedData.extraccion_1?.am || null,
        ml: clonedData.extraccion_1?.ml || null,
        am_aux: clonedData.extraccion_1?.am_aux ? new Date(clonedData.extraccion_1.am_aux) : null
      },
      extraccion_2: {
        pm: clonedData.extraccion_2?.pm || null,
        ml: clonedData.extraccion_2?.ml || null,
        pm_aux: clonedData.extraccion_2?.pm_aux ? new Date(clonedData.extraccion_2.pm_aux) : null
      }
    };
  }

  /**
   * Verifica si una fila específica está siendo editada
   */
  isEditing(rowData: ExtraccionTable): boolean {
    if (!this.editingRow) return false;

    return (this.editingRow.id_registro_extraccion === rowData.id_registro_extraccion) ||
      (!!this.editingRow.isNew && !!rowData.isNew);
  }

  /**
   * Verifica si hay alguna fila en estado de edición
   */
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing === true;
  }

  /**
   * Verifica si el botón de editar debe estar deshabilitado
   */
  isEditButtonDisabled(rowData: ExtraccionTable): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  /**
   * Guarda una nueva extracción o extracción faltante
   */
  private guardarNuevaExtraccion(rowData: ExtraccionTable, rowElement: HTMLTableRowElement): void {
    if (!this.idExtraccion) {
      this.mostrarError('Error: ID de extracción no válido');
      return;
    }

    this.loading = true;
    const datosOriginales = this.clonedExtracciones[rowData.id_registro_extraccion];
    const esExtraccionFaltante = !rowData.isNew && !!datosOriginales;

    const guardarSub = this.dialogExtraccionesService.guardarExtracciones(
      rowData,
      Number(this.idExtraccion!.id_extraccion),
      datosOriginales
    ).subscribe({
      next: (response) => {
        const mensaje = this.generateSuccessMessage(response, esExtraccionFaltante);
        this.handleSuccessfulSave(rowData, rowElement, mensaje);
      },
      error: (error) => {
        this.handleSaveError(error, esExtraccionFaltante);
      }
    });

    this.subscriptions.add(guardarSub);
    this.table.cancelRowEdit(rowData);

  }

  /**
   * Crea una extracción faltante
   */
  private actualizarExtraccionExistente(rowData: ExtraccionTable, rowElement: HTMLTableRowElement): void {

    const datosOriginales = this.clonedExtracciones[rowData.id_registro_extraccion];

    if (datosOriginales && this.dialogExtraccionesService.isExtraccionFaltante(rowData, datosOriginales)) {
      this.guardarNuevaExtraccion(rowData, rowElement);
      return;
    }

    this.handlePendingUpdate(rowData, rowElement);

  }

  /**
   * Genera el mensaje de éxito basado en la respuesta y tipo de operación
   */
  private generateSuccessMessage(response: any, esExtraccionFaltante: boolean): string {
    if (esExtraccionFaltante) {
      return 'Extracción faltante agregada correctamente';
    }

    const numExtracciones = Array.isArray(response) ? response.length : 1;
    return numExtracciones === 1
      ? 'Extracción guardada correctamente'
      : `${numExtracciones} extracciones guardadas correctamente`;
  }

  /**
   * Maneja el guardado exitoso limpiando datos y actualizando el estado
   */
  private handleSuccessfulSave(rowData: ExtraccionTable, rowElement: HTMLTableRowElement, mensaje: string): void {
    if (rowData.isNew) {
      this.cleanupNewRowData();
    } else {
      delete this.clonedExtracciones[rowData.id_registro_extraccion];
    }

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(rowData, rowElement);
    this.mostrarExito(mensaje);
    this.loading = false;
  }

  /**
   * Maneja errores de guardado
   */
  private handleSaveError(error: any, esExtraccionFaltante: boolean): void {
    console.error('Error al guardar extracción:', error);
    const mensajeError = esExtraccionFaltante
      ? 'Error al agregar la extracción faltante'
      : 'Error al guardar la extracción';
    this.mostrarError(mensajeError);
    this.loading = false;
  }


  // TODO: Maneja actualizaciones (pendientes de implementar)
  private handlePendingUpdate(rowData: ExtraccionTable, rowElement: HTMLTableRowElement): void {
    this.dialogExtraccionesService.putExtracciones(rowData.id_registro_extraccion!, rowData).subscribe({
      next: () => {
        delete this.clonedExtracciones[rowData.id_registro_extraccion];
        this.resetearEstadoEdicion();
        this.table.cancelRowEdit(rowData);
        this.mostrarExito('Extracción actualizada correctamente');
        this.loading = false;
      },
      error: (error) => {
        this.mostrarError('Error al actualizar la extracción');
      }
    });
  }

  /**
   * Limpia los datos de filas nuevas temporales
   */
  private cleanupNewRowData(): void {
    const tempIndex = this.dataExtracciones.findIndex(item => item.isNew);
    if (tempIndex !== -1) {
      this.dataExtracciones.splice(tempIndex, 1);
    }
  }

  /**
   * Prepara una nueva extracción con valores por defecto
   */
  private prepararNuevaExtraccion(nuevaExtraccion: ExtraccionTable): void {
    nuevaExtraccion.fecha_aux = null;
    nuevaExtraccion.fecha_display = 'Sin fecha';
    nuevaExtraccion.extraccion_1 = { id: null, am: null, ml: null, am_aux: null };
    nuevaExtraccion.extraccion_2 = { id: null, pm: null, ml: null, pm_aux: null };
  }

  /**
   * Clona los datos de una extracción para permitir cancelar cambios
   */
  private clonarExtraccionParaEdicion(rowData: ExtraccionTable): void {
    this.clonedExtracciones[rowData.id_registro_extraccion] = {
      ...rowData,
      fecha_aux: rowData.fecha_aux ? new Date(rowData.fecha_aux) : null,
      extraccion_1: this.cloneExtraccionData(rowData.extraccion_1),
      extraccion_2: this.cloneExtraccionData(rowData.extraccion_2)
    };
  }

  /**
   * Clona los datos de una extracción individual (AM o PM)
   */
  private cloneExtraccionData(extraccionData?: any): any {
    if (!extraccionData) return { am: null, ml: null, am_aux: null, pm: null, pm_aux: null };

    return {
      am: extraccionData.am || null,
      ml: extraccionData.ml || null,
      am_aux: extraccionData.am_aux ? new Date(extraccionData.am_aux) : null,
      pm: extraccionData.pm || null,
      pm_aux: extraccionData.pm_aux ? new Date(extraccionData.pm_aux) : null
    };
  }

  /**
   * Inicializa los campos auxiliares necesarios para la edición
   */
  private inicializarCamposAuxiliares(rowData: ExtraccionTable): void {
    if (!rowData.fecha_aux && rowData.fecha) {
      rowData.fecha_aux = this.parsearFechaSegura(rowData.fecha);
    }

    if (rowData.extraccion_1?.am && !rowData.extraccion_1.am_aux) {
      rowData.extraccion_1.am_aux = this.convertHoursToDate(rowData.extraccion_1.am);
    }

    if (rowData.extraccion_2?.pm && !rowData.extraccion_2.pm_aux) {
      rowData.extraccion_2.pm_aux = this.convertHoursToDate(rowData.extraccion_2.pm);
    }
  }

  /**
   * Procesa las fechas auxiliares y actualiza los campos correspondientes
   */
  private procesarFechas(rowData: ExtraccionTable): void {
    if (rowData.fecha_aux) {
      rowData.fecha = this.formatearFechaParaAPI(rowData.fecha_aux);
      rowData.fecha_display = this.formatearFechaParaMostrar(rowData.fecha_aux);
    }
  }

  /**
   * Procesa las horas auxiliares y actualiza los campos correspondientes
   */
  private procesarHoras(rowData: ExtraccionTable): void {
    if (rowData.extraccion_1?.am_aux) {
      rowData.extraccion_1.am = this.convertDateToHours(rowData.extraccion_1.am_aux);
    }

    if (rowData.extraccion_2?.pm_aux) {
      rowData.extraccion_2.pm = this.convertDateToHours(rowData.extraccion_2.pm_aux);
    }
  }

  /**
   * Parsea una fecha de forma segura evitando problemas de zona horaria
   */
  private parsearFechaSegura(fechaString: string): Date | null {
    if (!fechaString) return null;

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

    return parseFromFormat(fechaString, '-') || parseFromFormat(fechaString, '/');
  }

  /**
   * Formatea una fecha para enviar a la API (YYYY-MM-DD)
   */
  private formatearFechaParaAPI(fecha: Date): string {
    if (!fecha) return '';

    return [
      fecha.getFullYear(),
      (fecha.getMonth() + 1).toString().padStart(2, '0'),
      fecha.getDate().toString().padStart(2, '0')
    ].join('-');
  }

  /**
   * Formatea una fecha para mostrar al usuario (DD/MM/YYYY)
   */
  private formatearFechaParaMostrar(fecha: Date): string {
    if (!fecha) return 'Sin fecha';

    return [
      fecha.getDate().toString().padStart(2, '0'),
      (fecha.getMonth() + 1).toString().padStart(2, '0'),
      fecha.getFullYear()
    ].join('/');
  }

  /**
   * Convierte una hora en formato string (HH:MM) a objeto Date
   */
  convertHoursToDate(hora: string): Date | null {
    if (!hora) return null;

    const [horas, minutos] = hora.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return null;

    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  /**
   * Convierte un objeto Date a formato de hora (HH:MM)
   */
  convertDateToHours(fecha: Date): string {
    if (!fecha) return '';

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  /**
   * Valida el formato de hora en formato 24h (HH:MM)
   */
  isValidTimeFormat(hora: string): boolean {
    if (!hora) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);
  }

  /**
   * Valida que todos los campos requeridos estén completos
   */
  private validateRequiredFields(rowData: ExtraccionTable): boolean {
    if (!rowData.fecha_aux) {
      this.mostrarError('Debe seleccionar una fecha para la extracción');
      return false;
    }

    if (!this.hasValidExtraccion(rowData)) {
      this.mostrarError('Debe completar al menos una extracción (AM o PM) con hora y mililitros');
      return false;
    }

    return this.validateExtraccionFields(rowData);
  }

  /**
   * Verifica si hay al menos una extracción completa (AM o PM)
   */
  private hasValidExtraccion(rowData: ExtraccionTable): boolean {
    const extraccion1Completa = rowData.extraccion_1?.am && rowData.extraccion_1?.ml;
    const extraccion2Completa = rowData.extraccion_2?.pm && rowData.extraccion_2?.ml;
    return !!(extraccion1Completa || extraccion2Completa);
  }

  /**
   * Valida los campos específicos de las extracciones
   */
  private validateExtraccionFields(rowData: ExtraccionTable): boolean {
    const validaciones = [
      {
        condition: rowData.extraccion_1?.am && !this.isValidTimeFormat(rowData.extraccion_1.am),
        message: 'La hora AM debe estar en formato 24h (HH:MM). Ejemplo: 08:30'
      },
      {
        condition: rowData.extraccion_2?.pm && !this.isValidTimeFormat(rowData.extraccion_2.pm),
        message: 'La hora PM debe estar en formato 24h (HH:MM). Ejemplo: 14:45'
      },
      {
        condition: rowData.extraccion_1?.ml && (isNaN(rowData.extraccion_1.ml) || rowData.extraccion_1.ml <= 0),
        message: 'Los mililitros de la extracción 1 deben ser un número positivo'
      },
      {
        condition: rowData.extraccion_2?.ml && (isNaN(rowData.extraccion_2.ml) || rowData.extraccion_2.ml <= 0),
        message: 'Los mililitros de la extracción 2 deben ser un número positivo'
      }
    ];

    for (const validacion of validaciones) {
      if (validacion.condition) {
        this.mostrarError(validacion.message);
        return false;
      }
    }

    return true;
  }

  /**
   * Valida las condiciones necesarias para crear una nueva extracción
   */
  private validarCreacionExtraccion(): boolean {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de crear una nueva extracción');
      return false;
    }

    if (!this.idExtraccion) {
      this.mostrarError('No se puede crear extracción sin ID válido');
      return false;
    }

    return true;
  }

  /**
   * Reinicia el estado de edición del componente
   */
  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  /**
   * Muestra mensaje de carga basado en los resultados obtenidos
   */
  private mostrarMensajeCarga(extracciones: ExtraccionTable[]): void {
    if (extracciones.length === 0) {
      this.mostrarInfo('No hay extracciones registradas para esta madre');
    } else {
      const plural = extracciones.length > 1;
      const mensaje = `${extracciones.length} extracción${plural ? 'es' : ''} cargada${plural ? 's' : ''}`;
      this.mostrarExito(mensaje);
    }
  }

  /**
   * Maneja errores durante la carga de extracciones
   */
  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar extracciones:', error);
    this.mostrarError('Error al cargar las extracciones');
  }

  /**
   * Muestra un mensaje toast al usuario
   */
  private mostrarMensaje(severity: 'success' | 'error' | 'warn' | 'info', detail: string): void {
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
      key: 'tr-extraccion',
      life: config[severity].life
    });
  }

  private mostrarExito(mensaje: string): void {
    this.mostrarMensaje('success', mensaje);
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensaje('error', mensaje);
  }

  private mostrarAdvertencia(mensaje: string): void {
    this.mostrarMensaje('warn', mensaje);
  }

  private mostrarInfo(mensaje: string): void {
    this.mostrarMensaje('info', mensaje);
  }
}
