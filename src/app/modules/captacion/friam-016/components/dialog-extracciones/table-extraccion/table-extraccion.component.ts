import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
// ✅ CAMBIO: Usar tu servicio existente
import { DialogExtraccionesService } from '../services/dialog-extracciones.service';

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
export class TableExtraccionComponent implements OnInit, OnChanges {
  @Input() idExtraccion: number | null = null;
  @ViewChild('tableExtracciones') table!: Table;

  // Estados del componente
  loading: boolean = false;
  editingRow: any = null;
  hasNewRowInEditing: boolean = false;
  clonedExtracciones: { [s: string]: any } = {};

  // Datos
  dataExtracciones: any[] = [];

  // Headers de la tabla
  readonly headersExtracciones: any[] = [
    { header: 'FECHA', field: 'fecha', width: '150px', tipo: 'date' },
    { header: 'EXTRACCIÓN 1', field: 'extraccion_1', width: '200px', tipo: 'extraccion_1' },
    { header: 'EXTRACCIÓN 2', field: 'extraccion_2', width: '200px', tipo: 'extraccion_2' },
    { header: 'MOTIVO DE CONSULTA', field: 'motivo_consulta', width: '250px', tipo: 'text' },
    { header: 'OBSERVACIONES', field: 'observaciones', width: '250px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'acciones' }
  ];

  private isInitialLoad: boolean = true;

  constructor(
    // ✅ CAMBIO: Usar tu servicio existente
    private dialogExtraccionesService: DialogExtraccionesService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idExtraccion) {
      this.loadExtracciones();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idExtraccion']?.currentValue && !this.isInitialLoad) {
      this.loadExtracciones();
    } else if (changes['idExtraccion']?.currentValue && this.isInitialLoad) {
      this.loadExtracciones();
      this.isInitialLoad = false;
    }
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * Cargar extracciones
   */
  loadExtracciones(): void {
    if (!this.idExtraccion) return;

    this.loading = true;

    // ✅ CAMBIO: Usar tu servicio existente
    this.dialogExtraccionesService.getExtracciones(this.idExtraccion)
      .then((extracciones: any) => {
        this.dataExtracciones = extracciones;
        this.mostrarMensajeCarga(extracciones);
        this.loading = false;
      })
      .catch((error) => {
        this.manejarErrorCarga(error);
        this.loading = false;
      });
  }

  /**
   * Crear nueva extracción
   */
  crearNuevaExtraccion(): void {
    if (!this.validarCreacionExtraccion()) return;

    const fechaActual = new Date();
    const fechaString = fechaActual.toISOString().split('T')[0];

    this.loading = true;

    // ✅ CAMBIO: Usar tu servicio existente
    this.dialogExtraccionesService.crearExtraccion(this.idExtraccion!, fechaString)
      .then((nuevaExtraccion: any) => {
        this.dataExtracciones.push(nuevaExtraccion);
        this.dataExtracciones = [...this.dataExtracciones];
        this.hasNewRowInEditing = true;
        this.editingRow = nuevaExtraccion;

        setTimeout(() => this.table.initRowEdit(nuevaExtraccion), 100);
        this.mostrarInfo('Nueva extracción creada. Complete los campos requeridos.');
        this.loading = false;
      })
      .catch((error) => {
        this.mostrarError('Error al crear la nueva extracción');
        this.loading = false;
      });
  }

  /**
   * Iniciar edición de fila
   */
  onRowEditInit(rowData: any): void {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.editingRow = { ...rowData };
    this.clonedExtracciones[rowData.id_registro_extraccion] = { ...rowData };

    // Inicializar fecha auxiliar para el calendario
    if (rowData.fecha) {
      rowData.fecha_aux = new Date(rowData.fecha);
    }
  }

  /**
   * Guardar edición de fila
   */
  onRowEditSave(rowData: any, index: number, event: MouseEvent): void {
    // Procesar fecha
    if (rowData.fecha_aux) {
      rowData.fecha = this.formatearFechaParaAPI(rowData.fecha_aux);
      rowData.fecha_display = this.formatearFechaParaMostrar(rowData.fecha_aux);
    }

    if (!this.validateRequiredFields(rowData)) {
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (rowData.isNew) {
      this.guardarNuevaExtraccion(rowData, rowElement);
    } else {
      this.actualizarExtraccionExistente(rowData, rowElement);
    }
  }

  /**
   * Cancelar edición de fila
   */
  onRowEditCancel(rowData: any, index: number): void {
    if (rowData.isNew) {
      this.dataExtracciones.splice(index, 1);
      this.dataExtracciones = [...this.dataExtracciones];
      this.hasNewRowInEditing = false;
    } else {
      this.dataExtracciones[index] = this.clonedExtracciones[rowData.id_registro_extraccion];
      delete this.clonedExtracciones[rowData.id_registro_extraccion];
    }
    this.editingRow = null;
  }

  // ==================== MÉTODOS DE VALIDACIÓN ====================

  isEditing(rowData: any): boolean {
    return this.editingRow &&
      ((this.editingRow.id_registro_extraccion === rowData.id_registro_extraccion) ||
        (this.editingRow.isNew && rowData.isNew));
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Formatear hora en formato 24 horas (Colombia)
   */
  formatearHora24(hora: string): string {
    if (!hora) return '';

    // Si ya está en formato 24h (HH:MM), devolverla tal como está
    const regex24h = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (regex24h.test(hora)) {
      return hora;
    }

    return hora;
  }

  /**
   * Validar formato de hora
   */
  isValidTimeFormat(hora: string): boolean {
    if (!hora) return true; // Permitir vacío

    const regex24h = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex24h.test(hora);
  }

  /**
   * Formatear fecha para API (yyyy-mm-dd)
   */
  private formatearFechaParaAPI(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatear fecha para mostrar (dd/mm/yyyy)
   */
  private formatearFechaParaMostrar(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  /**
   * Validar campos obligatorios
   */
  private validateRequiredFields(rowData: any): boolean {
    // Validar que al menos una extracción tenga datos
    const extraccion1Completa = rowData.extraccion_1?.am && rowData.extraccion_1?.ml;
    const extraccion2Completa = rowData.extraccion_2?.pm && rowData.extraccion_2?.ml;

    if (!extraccion1Completa && !extraccion2Completa) {
      this.mostrarError('Debe completar al menos una extracción (AM o PM) con hora y mililitros');
      return false;
    }

    // Validar formato de horas
    if (rowData.extraccion_1?.am && !this.isValidTimeFormat(rowData.extraccion_1.am)) {
      this.mostrarError('La hora AM debe estar en formato 24h (HH:MM). Ejemplo: 08:30');
      return false;
    }

    if (rowData.extraccion_2?.pm && !this.isValidTimeFormat(rowData.extraccion_2.pm)) {
      this.mostrarError('La hora PM debe estar en formato 24h (HH:MM). Ejemplo: 14:45');
      return false;
    }

    // Validar que los mililitros sean números positivos
    if (rowData.extraccion_1?.ml && (isNaN(rowData.extraccion_1.ml) || rowData.extraccion_1.ml <= 0)) {
      this.mostrarError('Los mililitros de la extracción 1 deben ser un número positivo');
      return false;
    }

    if (rowData.extraccion_2?.ml && (isNaN(rowData.extraccion_2.ml) || rowData.extraccion_2.ml <= 0)) {
      this.mostrarError('Los mililitros de la extracción 2 deben ser un número positivo');
      return false;
    }

    return true;
  }

  /**
   * Validar creación de extracción
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
   * Guardar nueva extracción
   */
  private guardarNuevaExtraccion(rowData: any, rowElement: HTMLTableRowElement): void {
    // ✅ CAMBIO: Usar tu servicio existente
    this.dialogExtraccionesService.actualizarExtraccion(rowData.id_registro_extraccion, rowData)
      .then((response) => {
        console.log('Nueva extracción guardada:', response);
        this.resetearEstadoEdicion();
        this.table.saveRowEdit(rowData, rowElement);
        this.mostrarExito('Extracción guardada correctamente');
      })
      .catch((error) => {
        console.error('Error al guardar extracción:', error);
        this.mostrarError('Error al guardar la extracción');
      });
  }

  /**
   * Actualizar extracción existente
   */
  private actualizarExtraccionExistente(rowData: any, rowElement: HTMLTableRowElement): void {
    // ✅ CAMBIO: Usar tu servicio existente
    this.dialogExtraccionesService.actualizarExtraccion(rowData.id_registro_extraccion, rowData)
      .then((response) => {
        console.log('Extracción actualizada:', response);
        delete this.clonedExtracciones[rowData.id_registro_extraccion];
        this.editingRow = null;
        this.table.saveRowEdit(rowData, rowElement);
        this.mostrarExito('Extracción actualizada correctamente');
      })
      .catch((error) => {
        console.error('Error al actualizar extracción:', error);
        this.mostrarError('Error al actualizar la extracción');
      });
  }

  /**
   * Resetear estado de edición
   */
  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  /**
   * Mostrar mensaje de carga
   */
  private mostrarMensajeCarga(extracciones: any[]): void {
    if (extracciones.length > 0) {
      this.mostrarExito(`${extracciones.length} extracción${extracciones.length > 1 ? 'es' : ''} cargada${extracciones.length > 1 ? 's' : ''}`);
    } else {
      this.mostrarInfo('No hay extracciones registradas');
    }
  }

  /**
   * Manejar error de carga
   */
  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar extracciones:', error);
    this.mostrarError('Error al cargar las extracciones');
  }

  // ==================== MÉTODOS DE MENSAJES ====================

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje, key: 'tr-extraccion', life: 2000 });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje, key: 'tr-extraccion', life: 3000 });
  }

  private mostrarAdvertencia(mensaje: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: mensaje, key: 'tr-extraccion', life: 3000 });
  }

  private mostrarInfo(mensaje: string): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: mensaje, key: 'tr-extraccion', life: 2000 });
  }
}
