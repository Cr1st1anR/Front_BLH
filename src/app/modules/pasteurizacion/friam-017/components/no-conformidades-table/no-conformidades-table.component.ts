import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { NoConformidadesService } from '../../services/no-conformidades.service';
import type {
  NoConformidadesData,
  LoteOption,
  FiltroFecha,
  TipoMensaje,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion,
  LoadingState,
  TableColumn,
  FiltrosBusqueda
} from '../../interfaces/no-conformidades.interface';

@Component({
  selector: 'no-conformidades-table',
  imports: [
    TableModule, CommonModule, ProgressSpinnerModule, ToastModule,
    FormsModule, ButtonModule, InputTextModule, DatePickerModule,
    SelectModule, TooltipModule, HttpClientModule
  ],
  templateUrl: './no-conformidades-table.component.html',
  styleUrl: './no-conformidades-table.component.scss',
  providers: [MessageService]
})
export class NoConformidadesTableComponent implements OnInit {

  @ViewChild('tableNoConformidades') table!: Table;

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    lote: ''
  };

  readonly loading: LoadingState = {
    main: false,
    lotes: false
  };

  editingRow: NoConformidadesData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, NoConformidadesData> = {};
  tempIdCounter = -1;

  dataOriginal: NoConformidadesData[] = [];
  dataFiltered: NoConformidadesData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesLotes: LoteOption[] = [];

  headersNoConformidades: TableColumn[] = [
    { header: 'FECHA', field: 'fecha', width: '160px', tipo: 'date' },
    { header: 'LOTE', field: 'lote', width: '120px', tipo: 'select' },
    {
      header: 'NÚMERO DE MUESTRAS REPROBADAS',
      field: 'grupo_reprobadas',
      width: '400px',
      tipo: 'group',
      subColumns: [
        { header: 'ENVASE', field: 'envase', width: '80px', tipo: 'number' },
        { header: 'SUCIEDAD', field: 'suciedad', width: '80px', tipo: 'number' },
        { header: 'COLOR', field: 'color', width: '80px', tipo: 'number' },
        { header: 'FLAVOR', field: 'flavor', width: '80px', tipo: 'number' },
        { header: 'ACIDEZ', field: 'acidez', width: '80px', tipo: 'number' }
      ]
    },
    { header: 'NÚMERO\nDE MUESTRAS\nTESTADAS', field: 'numero_muestras_testadas', width: '120px', tipo: 'number' },
    { header: 'NÚMERO\nDE MUESTRAS\nREPROBADAS', field: 'numero_muestras_reprobadas', width: '120px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  get dataNoConformidades(): NoConformidadesData[] {
    return this.dataFiltered;
  }

  get loadingLotes(): boolean {
    return this.loading.lotes;
  }

  constructor(
    private readonly noConformidadesService: NoConformidadesService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ============= INICIALIZACIÓN =============

  private async inicializarComponente(): Promise<void> {
    try {
      await Promise.all([
        this.cargarLotes(),
        this.cargarDatosNoConformidades()
      ]);
    } catch (error) {
      console.error('Error al inicializar componente:', error);
      this.mostrarMensaje('error', 'Error de inicialización', 'Error al cargar datos iniciales');
    }
  }

  // ============= CARGA DE DATOS =============

  private cargarLotes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.lotes = true;

      this.noConformidadesService.getLotes().subscribe({
        next: (lotes) => {
          this.opcionesLotes = lotes;
          this.loading.lotes = false;
          resolve();
        },
        error: (error) => {
          this.loading.lotes = false;
          console.error('Error al cargar lotes:', error);
          this.cargarLotesFallback();
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los lotes');
          reject(error);
        }
      });
    });
  }

  private cargarDatosNoConformidades(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.main = true;

      this.noConformidadesService.getAllNoConformidades().subscribe({
        next: (registros) => {
          this.dataOriginal = this.transformarDatosBackend(registros);
          this.dataFiltered = [...this.dataOriginal];
          this.mostrarMensajeExitosoCarga();
          this.loading.main = false;
          resolve();
        },
        error: (error) => {
          this.loading.main = false;
          console.error('Error al cargar datos del backend:', error);
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los datos del backend');
          reject(error);
        }
      });
    });
  }

  // ============= FALLBACKS =============

  private cargarLotesFallback(): void {
    this.opcionesLotes = [
      { label: 'Lote 1', value: '1', numero_lote: 1 },
      { label: 'Lote 2', value: '2', numero_lote: 2 },
      { label: 'Lote 3', value: '3', numero_lote: 3 },
      { label: 'Lote 4', value: '4', numero_lote: 4 },
      { label: 'Lote 5', value: '5', numero_lote: 5 }
    ];
  }

  // ============= TRANSFORMACIÓN DE DATOS =============

  private transformarDatosBackend(registros: any[]): NoConformidadesData[] {
    return registros.map((registro: any) => {
      return {
        id: registro.id,
        fecha: this.parsearFechaDesdeBackend(registro.fecha),
        lote: registro.lote?.numeroLote?.toString() || '',
        lote_id: registro.lote?.id || null,
        envase: registro.envase || 0,
        suciedad: registro.suciedad || 0,
        color: registro.color || 0,
        flavor: registro.flavor || 0,
        acidez: registro.acidez || 0,
        numero_muestras_testadas: registro.numero_muestras_testadas || 0,
        numero_muestras_reprobadas: registro.numero_muestras_reprobadas || 0
      };
    });
  }

  // ============= UTILIDADES =============

  private parsearFechaSegura(fechaString: string | Date | null): Date | null {
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

  private parsearFechaDesdeBackend(fechaString: string): Date {
    if (!fechaString) return new Date();

    if (fechaString.includes('T')) {
      fechaString = fechaString.split('T')[0];
    }

    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  private formatearFechaParaAPI(fecha: Date): string {
    if (!fecha || !(fecha instanceof Date)) return '';

    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============= EVENTOS DE UI =============

  onLoteSeleccionado(event: any, rowData: NoConformidadesData): void {
    const loteValue = this.extraerValorEvento(event);
    if (!loteValue) return;

    rowData.lote = loteValue;

    const loteSeleccionado = this.opcionesLotes.find(l => l.value === loteValue);
    if (loteSeleccionado?.numero_lote) {
      rowData.lote_id = loteSeleccionado.numero_lote;
    }
  }

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  // ============= CRUD OPERATIONS =============

  crearNuevoRegistro(): void {
    if (this.hasNewRowInEditing) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar el registro actual antes de crear uno nuevo');
      return;
    }

    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe completar la edición actual antes de crear un nuevo registro');
      return;
    }

    const nuevoRegistro = this.crearRegistroVacio();
    this.agregarRegistroATabla(nuevoRegistro);
    this.iniciarEdicionRegistro(nuevoRegistro);
  }

  private crearRegistroVacio(): NoConformidadesData {
    return {
      id: null,
      fecha: new Date(),
      lote: '',
      lote_id: null,
      envase: 0,
      suciedad: 0,
      color: 0,
      flavor: 0,
      acidez: 0,
      numero_muestras_testadas: 0,
      numero_muestras_reprobadas: 0,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarRegistroATabla(registro: NoConformidadesData): void {
    this.dataOriginal.push(registro);
    this.dataFiltered.push(registro);
    this.dataFiltered = [...this.dataFiltered];
  }

  private iniciarEdicionRegistro(registro: NoConformidadesData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = registro;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  onRowEditInit(dataRow: NoConformidadesData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
  }

  onRowEditSave(dataRow: NoConformidadesData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Calcular automáticamente el número de muestras reprobadas
    this.calcularMuestrasReprobadas(dataRow);

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: NoConformidadesData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  calcularMuestrasReprobadas(dataRow: NoConformidadesData): void {
    const totalReprobadas = (dataRow.envase || 0) +
      (dataRow.suciedad || 0) +
      (dataRow.color || 0) +
      (dataRow.flavor || 0) +
      (dataRow.acidez || 0);
    dataRow.numero_muestras_reprobadas = totalReprobadas;
  }

  private guardarNuevoRegistro(dataRow: NoConformidadesData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaCreacion(dataRow);
    if (!datosBackend) return;

    this.noConformidadesService.postNoConformidades(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response, dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar el registro');
      }
    });
  }

  private actualizarRegistroExistente(dataRow: NoConformidadesData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaActualizacion(dataRow);
    if (!datosBackend) return;

    this.noConformidadesService.putNoConformidades(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el registro');
      }
    });
  }

  private prepararDatosParaCreacion(dataRow: NoConformidadesData): DatosBackendParaCreacion | null {
    if (!this.validarDatosBasicos(dataRow)) return null;

    const loteId = dataRow.lote_id;
    if (!loteId) return null;

    return {
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      lote: { id: loteId },
      envase: dataRow.envase || 0,
      suciedad: dataRow.suciedad || 0,
      color: dataRow.color || 0,
      flavor: dataRow.flavor || 0,
      acidez: dataRow.acidez || 0,
      numero_muestras_testadas: dataRow.numero_muestras_testadas || 0,
      numero_muestras_reprobadas: dataRow.numero_muestras_reprobadas || 0
    };
  }

  private prepararDatosParaActualizacion(dataRow: NoConformidadesData): DatosBackendParaActualizacion | null {
    if (!dataRow.id || !this.validarDatosBasicos(dataRow)) return null;

    const loteId = dataRow.lote_id;
    if (!loteId) return null;

    return {
      id: dataRow.id,
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      lote: {
        id: loteId,
        numeroLote: parseInt(dataRow.lote as string) || loteId
      },
      envase: dataRow.envase || 0,
      suciedad: dataRow.suciedad || 0,
      color: dataRow.color || 0,
      flavor: dataRow.flavor || 0,
      acidez: dataRow.acidez || 0,
      numero_muestras_testadas: dataRow.numero_muestras_testadas || 0,
      numero_muestras_reprobadas: dataRow.numero_muestras_reprobadas || 0
    };
  }

  // ============= VALIDACIONES =============

  private validarCamposRequeridos(dataRow: NoConformidadesData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.lote?.toString().trim()
    );
  }

  private validarDatosBasicos(dataRow: NoConformidadesData): boolean {
    if (!this.validarCamposRequeridos(dataRow)) {
      return false;
    }

    // Validar que los números sean válidos
    const numeros = [
      dataRow.envase, dataRow.suciedad, dataRow.color,
      dataRow.flavor, dataRow.acidez, dataRow.numero_muestras_testadas
    ];

    for (const num of numeros) {
      if (num < 0 || !Number.isInteger(num)) {
        this.mostrarMensaje('error', 'Error', 'Los valores deben ser números enteros mayores o iguales a 0');
        return false;
      }
    }

    return true;
  }

  // ============= ESTADOS DE EDICIÓN =============

  private guardarEstadoOriginal(dataRow: NoConformidadesData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: NoConformidadesData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataFiltered[index] = this.clonedData[rowId];
    delete this.clonedData[rowId];
  }

  private eliminarRegistroTemporal(dataRow: NoConformidadesData): void {
    const predicate = (item: NoConformidadesData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const originalIndex = this.dataOriginal.findIndex(predicate);
    if (originalIndex !== -1) this.dataOriginal.splice(originalIndex, 1);

    const filteredIndex = this.dataFiltered.findIndex(predicate);
    if (filteredIndex !== -1) {
      this.dataFiltered.splice(filteredIndex, 1);
      this.dataFiltered = [...this.dataFiltered];
    }
  }

  private procesarRespuestaCreacion(response: any, dataRow: NoConformidadesData, rowElement: HTMLTableRowElement): void {
    if (response.data?.id) {
      dataRow.id = response.data.id;
    }

    dataRow.isNew = false;
    delete dataRow._uid;

    const originalIndex = this.dataOriginal.findIndex(item =>
      item === dataRow || (item._uid && item._uid === dataRow._uid)
    );

    if (originalIndex !== -1) {
      this.dataOriginal[originalIndex] = { ...dataRow };
    }

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Registro guardado exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: NoConformidadesData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  // ============= UTILIDADES DE ESTADO =============

  isEditing(rowData: NoConformidadesData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: NoConformidadesData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private getRowId(dataRow: NoConformidadesData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= FILTROS =============

  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha | null): void {
    this.filtrarPorFecha(filtro);
  }

  aplicarFiltrosBusqueda(filtros: FiltrosBusqueda): void {
    this.filtrosBusqueda = filtros;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    datosFiltrados = this.aplicarFiltrosBusquedaTexto(datosFiltrados);

    this.dataFiltered = datosFiltrados;
  }

  private aplicarFiltrosBusquedaTexto(datos: NoConformidadesData[]): NoConformidadesData[] {
    return datos.filter(item => {
      const loteStr = typeof item.lote === 'number' ? item.lote.toString() : item.lote || '';
      const cumpleLote = !this.filtrosBusqueda.lote ||
        loteStr.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      return cumpleLote;
    });
  }

  private filtrarPorMesYAno(datos: NoConformidadesData[], filtro: FiltroFecha): NoConformidadesData[] {
    return datos.filter(item => {
      if (!item.fecha) return false;

      const fechaParseada = this.parsearFechaSegura(item.fecha);
      if (!fechaParseada || isNaN(fechaParseada.getTime())) return false;

      const mesItem = fechaParseada.getMonth() + 1;
      const añoItem = fechaParseada.getFullYear();

      return mesItem === filtro.month && añoItem === filtro.year;
    });
  }

  private mostrarNotificacionFiltro(): void {
    const cantidad = this.dataFiltered.length;
    const totalOriginal = this.dataOriginal.length;

    if (this.filtroFecha) {
      const nombreMes = this.mesesDelAno[this.filtroFecha.month - 1];
      const mensaje = cantidad > 0
        ? `${cantidad} de ${totalOriginal} registro${cantidad > 1 ? 's' : ''} encontrado${cantidad > 1 ? 's' : ''} para ${nombreMes} ${this.filtroFecha.year}`
        : `No se encontraron registros para ${nombreMes} ${this.filtroFecha.year}`;

      this.mostrarMensaje(cantidad > 0 ? 'info' : 'warn', cantidad > 0 ? 'Filtro aplicado' : 'Sin resultados', mensaje);
    } else {
      this.mostrarMensaje('info', 'Filtro removido', `Mostrando todos los registros (${totalOriginal})`);
    }
  }

  // ============= MENSAJES =============

  private mostrarMensajeExitosoCarga(): void {
    const cantidad = this.dataOriginal.length;
    const mensaje = cantidad > 0
      ? `${cantidad} registro${cantidad > 1 ? 's' : ''} de no conformidades cargado${cantidad > 1 ? 's' : ''}`
      : 'No se encontraron registros de no conformidades en la base de datos';

    this.mostrarMensaje(cantidad > 0 ? 'success' : 'info', cantidad > 0 ? 'Éxito' : 'Sin registros', mensaje);
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      key: 'tr',
      life
    });
  }
}
