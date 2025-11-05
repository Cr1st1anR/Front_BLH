import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ControlReenvaseService } from '../../services/control-reenvase.service';
import type { ControlReenvaseData, ResponsableOption, DonanteOption } from '../../interfaces/control-reenvase.interface';

@Component({
  selector: 'control-reenvase-table',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    AutoCompleteModule
  ],
  templateUrl: './control-reenvase-table.component.html',
  styleUrl: './control-reenvase-table.component.scss',
  providers: [MessageService]
})
export class ControlReenvaseTableComponent implements OnInit {

  @ViewChild('tableControlReenvase') table!: Table;
  @Output() rowClick = new EventEmitter<ControlReenvaseData>();

  loading: boolean = false;
  editingRow: ControlReenvaseData | null = null;
  hasNewRowInEditing: boolean = false;
  clonedData: { [s: string]: ControlReenvaseData } = {};
  tempIdCounter: number = -1;

  dataControlReenvaseOriginal: ControlReenvaseData[] = [];
  dataControlReenvaseFiltered: ControlReenvaseData[] = [];
  filtroFecha: { year: number; month: number } | null = null;

  opcionesResponsables: ResponsableOption[] = [];
  opcionesDonantes: DonanteOption[] = [];
  donantesSugeridos: DonanteOption[] = [];

  readonly headersControlReenvase = [
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'select' },
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'No. Donante', field: 'no_donante', width: '200px', tipo: 'autocomplete' },
    { header: 'No. FRASCO ANTERIOR', field: 'no_frasco_anterior', width: '100px', tipo: 'text' },
    { header: 'VOLUMEN', field: 'volumen_frasco_anterior', width: '150px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' },
  ];

  get dataControlReenvase(): ControlReenvaseData[] {
    return this.dataControlReenvaseFiltered;
  }

  set dataControlReenvase(value: ControlReenvaseData[]) {
    this.dataControlReenvaseFiltered = value;
  }

  constructor(
    private readonly controlReenvaseService: ControlReenvaseService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarOpciones();
    this.loadDataControlReenvase();
  }

  private inicializarOpciones(): void {
    this.opcionesResponsables = [
      { label: 'Juan López', value: 'Juan López' },
      { label: 'María Fernández', value: 'María Fernández' },
      { label: 'Pedro Sánchez', value: 'Pedro Sánchez' },
      { label: 'Ana García', value: 'Ana García' }
    ];

    this.opcionesDonantes = [
      { label: '123456 - María Pérez González', value: '123456', documento: '12345678' },
      { label: '789012 - Ana García Rodríguez', value: '789012', documento: '87654321' },
      { label: '345678 - Carmen Martínez López', value: '345678', documento: '11223344' },
      { label: '901234 - Lucía Hernández Silva', value: '901234', documento: '44556677' },
      { label: '567890 - Isabel Ruiz Castro', value: '567890', documento: '99887766' },
      { label: '234567 - Patricia Moreno Jiménez', value: '234567', documento: '55443322' },
      { label: '678901 - Sandra López Vargas', value: '678901', documento: '22334455' },
      { label: '012345 - Carolina Díaz Méndez', value: '012345', documento: '66778899' },
      { label: '456789 - Alejandra Torres Vega', value: '456789', documento: '33445566' },
      { label: '890123 - Mónica Ramírez Cruz', value: '890123', documento: '77889900' }
    ];
  }

  buscarDonantes(event: any): void {
    const query = event.query?.toLowerCase() || '';

    if (query.length >= 1) {
      this.donantesSugeridos = this.opcionesDonantes.filter(donante =>
        donante.label.toLowerCase().includes(query) ||
        donante.value.includes(query) ||
        donante.documento?.includes(query)
      );
    } else {
      this.donantesSugeridos = [];
    }
  }

  onDonanteSeleccionado(event: any, rowData: ControlReenvaseData): void {
    if (typeof event === 'object' && event.value) {
      rowData.no_donante = event.value;
    } else if (typeof event === 'string') {
      rowData.no_donante = event;
    }
  }

  onResponsableSeleccionado(event: any, rowData: ControlReenvaseData): void {
    if (event && event.value) {
      rowData.responsable = event.value;
    }
  }

  onRowClick(rowData: ControlReenvaseData): void {
    if (this.isAnyRowEditing()) {
      this.showWarningMessage('Debe guardar o cancelar la edición actual antes de ver las pasteurizaciones');
      return;
    }

    this.rowClick.emit(rowData);
  }

  private loadDataControlReenvase(): void {
    this.loading = true;

    try {
      const rawData = this.controlReenvaseService.getControlReenvaseData();
      this.dataControlReenvaseOriginal = this.formatData(rawData);
      this.dataControlReenvaseFiltered = [...this.dataControlReenvaseOriginal];

      this.showSuccessMessageInitial();
      this.loading = false;
    } catch (error) {
      this.handleError(error);
    }
  }

  filtrarPorFecha(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  aplicarFiltroInicialConNotificacion(filtro: { year: number; month: number } | null): void {
    this.aplicarFiltroConNotificacion(filtro);
  }

  private aplicarFiltroConNotificacion(filtro: { year: number; month: number } | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataControlReenvaseOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataControlReenvaseFiltered = datosFiltrados;
  }

  private filtrarPorMesYAno(datos: ControlReenvaseData[], filtro: { year: number; month: number }): ControlReenvaseData[] {
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

  private formatearFechaParaAPI(fecha: Date): string {
    if (!fecha) return '';

    return [
      fecha.getFullYear(),
      (fecha.getMonth() + 1).toString().padStart(2, '0'),
      fecha.getDate().toString().padStart(2, '0')
    ].join('-');
  }

  private mostrarNotificacionFiltro(): void {
    const cantidad = this.dataControlReenvaseFiltered.length;
    const totalOriginal = this.dataControlReenvaseOriginal.length;

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

  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }

  private formatData(data: ControlReenvaseData[]): ControlReenvaseData[] {
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

    this.dataControlReenvaseOriginal.push(nuevoRegistro);
    this.dataControlReenvaseFiltered.push(nuevoRegistro);
    this.dataControlReenvaseFiltered = [...this.dataControlReenvaseFiltered];

    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.showInfoMessage('Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  private removeNewRowFromData(dataRow: ControlReenvaseData): void {
    const originalIndex = this.dataControlReenvaseOriginal.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (originalIndex !== -1) {
      this.dataControlReenvaseOriginal.splice(originalIndex, 1);
    }

    const filteredIndex = this.dataControlReenvaseFiltered.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (filteredIndex !== -1) {
      this.dataControlReenvaseFiltered.splice(filteredIndex, 1);
      this.dataControlReenvaseFiltered = [...this.dataControlReenvaseFiltered];
    }
  }

  private guardarNuevoRegistro(dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    console.log('Guardando nuevo registro:', dataRow);

    if (dataRow.fecha instanceof Date) {
      const fechaParaAPI = this.formatearFechaParaAPI(dataRow.fecha);
      console.log('Fecha formateada para API:', fechaParaAPI);
    }

    dataRow.isNew = false;
    dataRow.id = Math.max(...this.dataControlReenvaseOriginal.map(item => item.id || 0)) + 1;
    delete dataRow._uid;

    const originalIndex = this.dataControlReenvaseOriginal.findIndex(item =>
      item === dataRow || (item._uid && item._uid === dataRow._uid)
    );

    if (originalIndex !== -1) {
      this.dataControlReenvaseOriginal[originalIndex] = { ...dataRow };
    }

    this.resetEditingState();
    this.table.saveRowEdit(dataRow, rowElement);
    this.showSuccessMessage('Registro creado exitosamente');
  }

  private createNewRecord(): ControlReenvaseData {
    return {
      id: null,
      fecha: null,
      responsable: '',
      no_donante: '',
      no_frasco_anterior: '',
      volumen_frasco_anterior: '',
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  onRowEditInit(dataRow: ControlReenvaseData): void {
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

  onRowEditSave(dataRow: ControlReenvaseData, index: number, event: MouseEvent): void {
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

  onRowEditCancel(dataRow: ControlReenvaseData, index: number): void {
    if (dataRow.isNew) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataControlReenvaseFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
    this.editingRow = null;
  }

  private actualizarRegistroExistente(dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    console.log('Actualizando registro:', dataRow);

    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;

    this.table.saveRowEdit(dataRow, rowElement);
    this.showSuccessMessage('Registro actualizado exitosamente');
  }

  private getRowId(dataRow: ControlReenvaseData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  private validateRequiredFields(dataRow: ControlReenvaseData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.responsable?.trim() &&
      dataRow.no_donante?.trim() &&
      dataRow.no_frasco_anterior?.trim() &&
      dataRow.volumen_frasco_anterior?.trim()
    );
  }

  private resetEditingState(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  isEditing(rowData: ControlReenvaseData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: ControlReenvaseData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private showSuccessMessageInitial(): void {
    const cantidad = this.dataControlReenvaseOriginal.length;

    if (cantidad > 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `${cantidad} registro${cantidad > 1 ? 's' : ''} de control de reenvase cargado${cantidad > 1 ? 's' : ''}`,
        key: 'tr',
        life: 2000,
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No se encontraron registros de control de reenvase',
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
      detail: 'No se pudieron cargar los datos de control de reenvase',
      key: 'tr',
      life: 3000,
    });
    this.loading = false;
  }
}
