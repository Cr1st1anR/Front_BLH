import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
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

  loading = false;
  editingRow: any = null;
  hasNewRowInEditing = false;
  dataExtracciones: any[] = [];

  private clonedExtracciones: { [s: string]: any } = {};
  private isInitialLoad = true;

  readonly headersExtracciones: any[] = [
    { header: 'FECHA', field: 'fecha', width: '160px', tipo: 'date' },
    { header: 'EXTRACCIÓN 1', field: 'extraccion_1', width: '240px', tipo: 'extraccion_1' },
    { header: 'EXTRACCIÓN 2', field: 'extraccion_2', width: '240px', tipo: 'extraccion_2' },
    { header: 'MOTIVO DE CONSULTA', field: 'motivo_consulta', width: '250px', tipo: 'text' },
    { header: 'OBSERVACIONES', field: 'observaciones', width: '350px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'acciones' }
  ];

  constructor(
    private dialogExtraccionesService: DialogExtraccionesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idExtraccion']?.currentValue) {
      this.loadExtracciones();
      this.isInitialLoad = false;
    }
  }

  loadExtracciones(): void {
    if (!this.idExtraccion) return;

    this.loading = true;

    this.dialogExtraccionesService.getExtracciones(this.idExtraccion)
      .then((extracciones: any) => {
        this.dataExtracciones = extracciones.map((item: any) => ({
          ...item,
          fecha_aux: item.fecha ? this.parsearFechaSegura(item.fecha) : null,
          extraccion_1: {
            ...item.extraccion_1,
            am_aux: item.extraccion_1?.am ? this.convertHoursToDate(item.extraccion_1.am) : null
          },
          extraccion_2: {
            ...item.extraccion_2,
            pm_aux: item.extraccion_2?.pm ? this.convertHoursToDate(item.extraccion_2.pm) : null
          }
        }));
        
        this.mostrarMensajeCarga(extracciones);
      })
      .catch((error) => {
        this.manejarErrorCarga(error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  crearNuevaExtraccion(): void {
    if (!this.validarCreacionExtraccion()) return;

    this.loading = true;

    this.dialogExtraccionesService.crearExtraccion(this.idExtraccion!, null)
      .then((nuevaExtraccion: any) => {
        this.prepararNuevaExtraccion(nuevaExtraccion);
        this.dataExtracciones.push(nuevaExtraccion);
        this.dataExtracciones = [...this.dataExtracciones];
        this.hasNewRowInEditing = true;
        this.editingRow = nuevaExtraccion;

        setTimeout(() => this.table.initRowEdit(nuevaExtraccion), 100);
        this.mostrarInfo('Nueva extracción creada. Seleccione la fecha y complete los campos requeridos.');
      })
      .catch(() => {
        this.mostrarError('Error al crear la nueva extracción');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onRowEditInit(rowData: any): void {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.editingRow = { ...rowData };
    this.clonarExtraccionParaEdicion(rowData);
    this.inicializarCamposAuxiliares(rowData);
  }

  onRowEditSave(rowData: any, index: number, event: MouseEvent): void {
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
   * Cancelar edición de fila
   */
  onRowEditCancel(rowData: any, index: number): void {
    if (rowData.isNew) {
      this.dataExtracciones.splice(index, 1);
      this.dataExtracciones = [...this.dataExtracciones];
      this.hasNewRowInEditing = false;
    } else {
      const clonedData = this.clonedExtracciones[rowData.id_registro_extraccion];
      if (clonedData) {
        this.dataExtracciones[index] = {
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
      delete this.clonedExtracciones[rowData.id_registro_extraccion];
    }
    this.editingRow = null;
  }


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


  private prepararNuevaExtraccion(nuevaExtraccion: any): void {
    nuevaExtraccion.fecha_aux = null;
    nuevaExtraccion.fecha_display = 'Sin fecha';
    nuevaExtraccion.extraccion_1 = { am: null, ml: null, am_aux: null };
    nuevaExtraccion.extraccion_2 = { pm: null, ml: null, pm_aux: null };
  }

  private clonarExtraccionParaEdicion(rowData: any): void {
    this.clonedExtracciones[rowData.id_registro_extraccion] = {
      ...rowData,
      fecha_aux: rowData.fecha_aux ? new Date(rowData.fecha_aux) : null,
      extraccion_1: {
        am: rowData.extraccion_1?.am || null,
        ml: rowData.extraccion_1?.ml || null,
        am_aux: rowData.extraccion_1?.am_aux ? new Date(rowData.extraccion_1.am_aux) : null
      },
      extraccion_2: {
        pm: rowData.extraccion_2?.pm || null,
        ml: rowData.extraccion_2?.ml || null,
        pm_aux: rowData.extraccion_2?.pm_aux ? new Date(rowData.extraccion_2.pm_aux) : null
      }
    };
  }

  private inicializarCamposAuxiliares(rowData: any): void {
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

  private procesarFechas(rowData: any): void {
    if (rowData.fecha_aux) {
      rowData.fecha = this.formatearFechaParaAPI(rowData.fecha_aux);
      rowData.fecha_display = this.formatearFechaParaMostrar(rowData.fecha_aux);
    }
  }

  private procesarHoras(rowData: any): void {
    if (rowData.extraccion_1?.am_aux) {
      rowData.extraccion_1.am = this.convertDateToHours(rowData.extraccion_1.am_aux);
    }
    if (rowData.extraccion_2?.pm_aux) {
      rowData.extraccion_2.pm = this.convertDateToHours(rowData.extraccion_2.pm_aux);
    }
  }

  private parsearFechaSegura(fechaString: string): Date | null {
    if (!fechaString) return null;

    if (fechaString.includes('-')) {
      const [year, month, day] = fechaString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    if (fechaString.includes('/')) {
      const [day, month, year] = fechaString.split('/').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    return null;
  }

  private formatearFechaParaAPI(fecha: Date): string {
    if (!fecha) return '';

    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatearFechaParaMostrar(fecha: Date): string {
    if (!fecha) return 'Sin fecha';

    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  convertHoursToDate(hora: string): Date | null {
    if (!hora) return null;

    const [horas, minutos] = hora.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return null;

    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  convertDateToHours(fecha: Date): string {
    if (!fecha) return '';

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  isValidTimeFormat(hora: string): boolean {
    if (!hora) return true;

    const regex24h = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex24h.test(hora);
  }

  private validateRequiredFields(rowData: any): boolean {
    if (!rowData.fecha_aux) {
      this.mostrarError('Debe seleccionar una fecha para la extracción');
      return false;
    }

    const extraccion1Completa = rowData.extraccion_1?.am && rowData.extraccion_1?.ml;
    const extraccion2Completa = rowData.extraccion_2?.pm && rowData.extraccion_2?.ml;

    if (!extraccion1Completa && !extraccion2Completa) {
      this.mostrarError('Debe completar al menos una extracción (AM o PM) con hora y mililitros');
      return false;
    }

    const validaciones = [
      { condition: rowData.extraccion_1?.am && !this.isValidTimeFormat(rowData.extraccion_1.am), 
        message: 'La hora AM debe estar en formato 24h (HH:MM). Ejemplo: 08:30' },
      { condition: rowData.extraccion_2?.pm && !this.isValidTimeFormat(rowData.extraccion_2.pm), 
        message: 'La hora PM debe estar en formato 24h (HH:MM). Ejemplo: 14:45' },
      { condition: rowData.extraccion_1?.ml && (isNaN(rowData.extraccion_1.ml) || rowData.extraccion_1.ml <= 0), 
        message: 'Los mililitros de la extracción 1 deben ser un número positivo' },
      { condition: rowData.extraccion_2?.ml && (isNaN(rowData.extraccion_2.ml) || rowData.extraccion_2.ml <= 0), 
        message: 'Los mililitros de la extracción 2 deben ser un número positivo' }
    ];

    for (const validacion of validaciones) {
      if (validacion.condition) {
        this.mostrarError(validacion.message);
        return false;
      }
    }

    return true;
  }

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

  private guardarNuevaExtraccion(rowData: any, rowElement: HTMLTableRowElement): void {
    this.dialogExtraccionesService.actualizarExtraccion(rowData.id_registro_extraccion, rowData)
      .then(() => {
        this.resetearEstadoEdicion();
        this.table.saveRowEdit(rowData, rowElement);
        this.mostrarExito('Extracción guardada correctamente');
      })
      .catch((error) => {
        console.error('Error al guardar extracción:', error);
        this.mostrarError('Error al guardar la extracción');
      });
  }

  private actualizarExtraccionExistente(rowData: any, rowElement: HTMLTableRowElement): void {
    this.dialogExtraccionesService.actualizarExtraccion(rowData.id_registro_extraccion, rowData)
      .then(() => {
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

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  private mostrarMensajeCarga(extracciones: any[]): void {
    const mensaje = extracciones.length > 0 
      ? `${extracciones.length} extracción${extracciones.length > 1 ? 'es' : ''} cargada${extracciones.length > 1 ? 's' : ''}`
      : 'No hay extracciones registradas';
    
    const tipo = extracciones.length > 0 ? 'success' : 'info';
    this.mostrarMensaje(tipo, mensaje);
  }

  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar extracciones:', error);
    this.mostrarError('Error al cargar las extracciones');
  }

  private mostrarMensaje(severity: 'success' | 'error' | 'warn' | 'info', detail: string): void {
    const summaryMap = { success: 'Éxito', error: 'Error', warn: 'Advertencia', info: 'Información' };
    const lifeMap = { success: 2000, error: 3000, warn: 3000, info: 2000 };

    this.messageService.add({
      severity,
      summary: summaryMap[severity],
      detail,
      key: 'tr-extraccion',
      life: lifeMap[severity]
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
