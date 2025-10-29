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

  dataEntregaLecheCrudaOriginal: EntregaLecheCrudaData[] = [];
  dataEntregaLecheCrudaFiltered: EntregaLecheCrudaData[] = [];
  filtroFecha: { year: number; month: number } | null = null;

  readonly headersEntregaLecheCruda = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'NOMBRE DE LA MADRE', field: 'nombre_madre', width: '200px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA A.M', field: 'volumen_leche_materna_am', width: '180px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA P.M', field: 'volumen_leche_materna_pm', width: '180px', tipo: 'text' },
    { header: 'PERDIDAS', field: 'perdidas', width: '100px', tipo: 'number' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' },
  ];

  get dataEntregaLecheCruda(): EntregaLecheCrudaData[] {
    return this.dataEntregaLecheCrudaFiltered;
  }

  set dataEntregaLecheCruda(value: EntregaLecheCrudaData[]) {
    this.dataEntregaLecheCrudaFiltered = value;
  }

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
      const rawData = this.entregaLecheCrudaService.getEntregaLecheCrudaData();
      this.dataEntregaLecheCrudaOriginal = this.formatData(rawData);

      this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaOriginal];

      this.showSuccessMessageInitial();
      this.loading = false;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Filtra los datos por mes y año específicos
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
   * Aplica filtro por fecha y muestra la notificación correspondiente
   */
  private aplicarFiltroConNotificacion(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  /**
   * Aplica todos los filtros activos a los datos
   */
  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataEntregaLecheCrudaOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataEntregaLecheCrudaFiltered = datosFiltrados;
  }

  /**
   * Filtra los datos por mes y año específicos
   */
  private filtrarPorMesYAno(datos: EntregaLecheCrudaData[], filtro: { year: number; month: number }): EntregaLecheCrudaData[] {
  return datos.filter(item => {
    if (!item.fecha) return false;

    const fechaParseada = this.parsearFechaSegura(item.fecha);
    if (!fechaParseada) return false;

    if (isNaN(fechaParseada.getTime())) return false;

    const mesItem = fechaParseada.getMonth() + 1;
    const añoItem = fechaParseada.getFullYear();

    return mesItem === filtro.month && añoItem === filtro.year;
  });
}

/**
 * Formatea una fecha para enviar a la API (YYYY-MM-DD)
 * Basado en el patrón de #friam-016
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
 * Basado en el patrón de #friam-016
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
   * Muestra una notificación basada en los resultados del filtro
   */
  private mostrarNotificacionFiltro(): void {
    const cantidad = this.dataEntregaLecheCrudaFiltered.length;
    const totalOriginal = this.dataEntregaLecheCrudaOriginal.length;

    if (this.filtroFecha) {
      const nombreMes = this.obtenerNombreMes(this.filtroFecha.month);
      const año = this.filtroFecha.year;

      if (cantidad > 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Filtro aplicado',
          detail: `${cantidad} de ${totalOriginal} registro${cantidad > 1 ? 's' : ''} encontrado${cantidad > 1 ? 's' : ''} para ${nombreMes} ${año}`,
          key: 'tr',
          life: 3000,
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin resultados',
          detail: `No se encontraron registros para ${nombreMes} ${año}`,
          key: 'tr',
          life: 3000,
        });
      }
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Filtro removido',
        detail: `Mostrando todos los registros (${totalOriginal})`,
        key: 'tr',
        life: 2000,
      });
    }
  }

  /**
   * Convierte número de mes a nombre
   */
  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }

  /**
   * Formatea los datos para mostrar
   */
  private formatData(data: EntregaLecheCrudaData[]): EntregaLecheCrudaData[] {
  return data.map((item, index) => ({
    ...item,
    id: item.id || index + 1,
    fecha: item.fecha ? this.parsearFechaSegura(item.fecha) : null
  }));
}

private parsearFechaSegura(fechaString: string | Date): Date | null {
  if (!fechaString) return null;

  if (fechaString instanceof Date) return fechaString;

  if (typeof fechaString === 'string') {
    if (fechaString.includes('-')) {
      const [year, month, day] = fechaString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    if (fechaString.includes('/')) {
      const [day, month, year] = fechaString.split('/').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
  }

  return null;
}

  /**
   * Crear nuevo registro con datos originales actualizados
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

    this.dataEntregaLecheCrudaOriginal.push(nuevoRegistro);
    this.dataEntregaLecheCrudaFiltered.push(nuevoRegistro);

    this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaFiltered];

    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  /**
   * Remover de ambos arrays
   */
  private removeNewRowFromData(dataRow: EntregaLecheCrudaData): void {
    const originalIndex = this.dataEntregaLecheCrudaOriginal.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (originalIndex !== -1) {
      this.dataEntregaLecheCrudaOriginal.splice(originalIndex, 1);
    }

    const filteredIndex = this.dataEntregaLecheCrudaFiltered.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (filteredIndex !== -1) {
      this.dataEntregaLecheCrudaFiltered.splice(filteredIndex, 1);
      this.dataEntregaLecheCrudaFiltered = [...this.dataEntregaLecheCrudaFiltered];
    }
  }

  /**
   * Guardar nuevo registro en datos originales también
   */
  private guardarNuevoRegistro(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {
  console.log('Guardando nuevo registro:', dataRow);

  if (dataRow.fecha instanceof Date) {
    const fechaParaAPI = this.formatearFechaParaAPI(dataRow.fecha);
    console.log('Fecha formateada para API:', fechaParaAPI);
  }

  dataRow.isNew = false;
  dataRow.id = Math.max(...this.dataEntregaLecheCrudaOriginal.map(item => item.id || 0)) + 1;
  delete dataRow._uid;

  const originalIndex = this.dataEntregaLecheCrudaOriginal.findIndex(item =>
    item === dataRow || (item._uid && item._uid === dataRow._uid)
  );

  if (originalIndex !== -1) {
    this.dataEntregaLecheCrudaOriginal[originalIndex] = { ...dataRow };
  }

  this.resetEditingState();
  this.table.saveRowEdit(dataRow, rowElement);
  this.showSuccessMessage('Registro creado exitosamente');
}

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

  onRowEditCancel(dataRow: EntregaLecheCrudaData, index: number): void {
    if (dataRow.isNew) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataEntregaLecheCrudaFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
    this.editingRow = null;
  }

  private actualizarRegistroExistente(dataRow: EntregaLecheCrudaData, rowElement: HTMLTableRowElement): void {
    console.log('Actualizando registro:', dataRow);

    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.showSuccessMessage('Registro actualizado exitosamente');
  }

  private getRowId(dataRow: EntregaLecheCrudaData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  private validateRequiredFields(dataRow: EntregaLecheCrudaData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.nombre_madre?.trim() &&
      dataRow.volumen_leche_materna_am?.trim() &&
      dataRow.volumen_leche_materna_pm?.trim() &&
      dataRow.responsable?.trim()
    );
  }

  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  isEditing(rowData: EntregaLecheCrudaData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: EntregaLecheCrudaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private showSuccessMessageInitial(): void {
    const cantidad = this.dataEntregaLecheCrudaOriginal.length;

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
