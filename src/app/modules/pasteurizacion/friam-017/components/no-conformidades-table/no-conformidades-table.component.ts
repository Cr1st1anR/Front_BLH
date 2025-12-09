import { Component, OnInit, ViewChild, Input } from '@angular/core';
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
  LoadingState,
  TableColumn,
  FiltrosBusqueda,
  NoConformidadesBackendResponse
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
    lotes: false,
    calculando: false
  };

  editingRow: NoConformidadesData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, NoConformidadesData> = {};
  tempIdCounter = -1;

  dataOriginal: NoConformidadesData[] = [];
  dataFiltered: NoConformidadesData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesLotes: LoteOption[] = [];

  // Guardar el lote seleccionado temporalmente para el POST
  private loteSeleccionadoTemp: LoteOption | null = null;

  headersNoConformidades: TableColumn[] = [
    { header: 'FECHA', field: 'fecha', width: '100px', tipo: 'date' },
    { header: 'LOTE', field: 'lote', width: '100px', tipo: 'select' },
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
    { header: 'NÚMERO<br>DE MUESTRAS<br>TESTADAS', field: 'muestrasTesteadas', width: '120px', tipo: 'number' },
    { header: 'NÚMERO<br>DE MUESTRAS<br>REPROBADAS', field: 'muestrasReprobadas', width: '120px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '100px', tipo: 'actions' }
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

  get loadingCalculando(): boolean {
    return this.loading.calculando;
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
      // Establecer filtro inicial al mes y año actual
      const fechaActual = new Date();
      this.filtroFecha = {
        month: fechaActual.getMonth() + 1,
        year: fechaActual.getFullYear()
      };

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

      this.noConformidadesService.getLotesDisponibles().subscribe({
        next: (lotes) => {
          this.opcionesLotes = lotes;
          this.loading.lotes = false;
          resolve();
        },
        error: (error) => {
          this.loading.lotes = false;
          console.error('Error al cargar lotes:', error);
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los lotes disponibles');
          reject(error);
        }
      });
    });
  }

  private cargarDatosNoConformidades(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.filtroFecha) {
        this.dataOriginal = [];
        this.dataFiltered = [];
        resolve();
        return;
      }

      this.loading.main = true;

      this.noConformidadesService.getNoConformidadesPorMesAnio(
        this.filtroFecha.month,
        this.filtroFecha.year
      ).subscribe({
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

  // ============= TRANSFORMACIÓN DE DATOS =============

  private transformarDatosBackend(registros: NoConformidadesBackendResponse[]): NoConformidadesData[] {
    return registros.map((registro) => ({
      id: registro.id,
      fecha: this.parsearFechaDesdeBackend(registro.fecha),
      lote: registro.lote?.numeroLote?.toString() || '',
      lote_id: registro.lote?.id || null,
      envase: registro.envase || 0,
      suciedad: registro.suciedad || 0,
      color: registro.color || 0,
      flavor: registro.flavor || 0,
      acidez: registro.acidez || 0,
      muestrasTesteadas: registro.muestrasTesteadas || 0,
      muestrasReprobadas: registro.muestrasReprobadas || 0
    }));
  }

  // ============= UTILIDADES DE FECHA =============

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

    // Buscar el lote seleccionado para obtener el loteId
    const loteSeleccionado = this.opcionesLotes.find(l => l.value === loteValue);
    if (loteSeleccionado) {
      rowData.lote_id = loteSeleccionado.loteId;
      this.loteSeleccionadoTemp = loteSeleccionado;

      // Si ya hay fecha seleccionada, calcular automáticamente los datos
      if (rowData.fecha && rowData.isNew) {
        this.calcularDatosAutomaticos(rowData, loteSeleccionado.numeroLote);
      }
    }
  }

  onFechaSeleccionada(event: any, rowData: NoConformidadesData): void {
    // Si ya hay lote seleccionado, calcular automáticamente los datos
    if (rowData.lote && rowData.lote_id && rowData.isNew && this.loteSeleccionadoTemp) {
      this.calcularDatosAutomaticos(rowData, this.loteSeleccionadoTemp.numeroLote);
    }
  }

  private calcularDatosAutomaticos(rowData: NoConformidadesData, numeroLote: number): void {
    if (!rowData.fecha) return;

    const fechaFormateada = this.formatearFechaParaAPI(rowData.fecha as Date);
    if (!fechaFormateada) return;

    this.loading.calculando = true;

    this.noConformidadesService.getDatosCalculadosPorLote(numeroLote, fechaFormateada).subscribe({
      next: (datos) => {
        rowData.envase = datos.envase;
        rowData.suciedad = datos.suciedad;
        rowData.color = datos.color;
        rowData.flavor = datos.flavor;
        rowData.acidez = datos.acidez;
        rowData.muestrasTesteadas = datos.muestrasTesteadas;
        rowData.muestrasReprobadas = datos.muestrasReprobadas;

        this.loading.calculando = false;
        this.mostrarMensaje('info', 'Datos calculados', 'Los valores se han calculado automáticamente');
      },
      error: (error) => {
        this.loading.calculando = false;
        console.error('Error al calcular datos:', error);
        this.mostrarMensaje('warn', 'Advertencia', 'No se pudieron calcular los datos automáticamente');
      }
    });
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
      muestrasTesteadas: 0,
      muestrasReprobadas: 0,
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
    this.loteSeleccionadoTemp = null;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Seleccione fecha y lote. Los demás campos se calcularán automáticamente.');
  }

  onRowEditInit(dataRow: NoConformidadesData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
    this.loteSeleccionadoTemp = null;

    // Si es edición de registro existente, buscar el lote en las opciones
    if (!dataRow.isNew && dataRow.lote) {
      this.loteSeleccionadoTemp = this.opcionesLotes.find(l => l.value === dataRow.lote?.toString()) || null;
    }
  }

  onRowEditSave(dataRow: NoConformidadesData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor seleccione fecha y lote');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      // Los registros existentes no se pueden editar según el flujo actual
      // Solo se crean nuevos registros
      this.mostrarMensaje('info', 'Información', 'Los registros existentes son de solo lectura');
      this.onRowEditCancel(dataRow, index);
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
    this.loteSeleccionadoTemp = null;
  }

  private guardarNuevoRegistro(dataRow: NoConformidadesData, rowElement: HTMLTableRowElement): void {
    if (!this.loteSeleccionadoTemp) {
      this.mostrarMensaje('error', 'Error', 'Debe seleccionar un lote válido');
      return;
    }

    const datosBackend = this.prepararDatosParaCreacion(dataRow);
    if (!datosBackend) return;

    this.loading.main = true;

    this.noConformidadesService.postNoConformidades(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response, dataRow, rowElement);
        this.loading.main = false;
      },
      error: (error) => {
        this.loading.main = false;
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar el registro');
      }
    });
  }

  private prepararDatosParaCreacion(dataRow: NoConformidadesData): DatosBackendParaCreacion | null {
    if (!this.validarCamposRequeridos(dataRow)) return null;

    const loteId = dataRow.lote_id;
    if (!loteId) {
      this.mostrarMensaje('error', 'Error', 'No se pudo obtener el ID del lote');
      return null;
    }

    return {
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      envase: dataRow.envase || 0,
      color: dataRow.color || 0,
      flavor: dataRow.flavor || 0,
      suciedad: dataRow.suciedad || 0,
      acidez: dataRow.acidez || 0,
      muestrasTesteadas: dataRow.muestrasTesteadas || 0,
      muestrasReprobadas: dataRow.muestrasReprobadas || 0,
      lote: loteId
    };
  }

  // ============= VALIDACIONES =============

  private validarCamposRequeridos(dataRow: NoConformidadesData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.lote?.toString().trim() &&
      dataRow.lote_id
    );
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
    this.mostrarMensaje('success', 'Éxito', 'Registro de no conformidad guardado exitosamente');
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.loteSeleccionadoTemp = null;
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
    this.cargarDatosNoConformidades();
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha | null): void {
    this.filtrarPorFecha(filtro);
  }

  aplicarFiltrosBusqueda(filtros: FiltrosBusqueda): void {
    this.filtrosBusqueda = filtros;
    this.aplicarFiltrosBusquedaTexto();
  }

  private aplicarFiltrosBusquedaTexto(): void {
    let datosFiltrados = [...this.dataOriginal];

    datosFiltrados = datosFiltrados.filter(item => {
      const loteStr = typeof item.lote === 'number' ? item.lote.toString() : item.lote || '';
      const cumpleLote = !this.filtrosBusqueda.lote ||
        loteStr.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      return cumpleLote;
    });

    this.dataFiltered = datosFiltrados;
  }

  // ============= MENSAJES =============

  private mostrarMensajeExitosoCarga(): void {
    const cantidad = this.dataOriginal.length;

    if (this.filtroFecha) {
      const nombreMes = this.mesesDelAno[this.filtroFecha.month - 1];
      const mensaje = cantidad > 0
        ? `${cantidad} registro${cantidad > 1 ? 's' : ''} encontrado${cantidad > 1 ? 's' : ''} para ${nombreMes} ${this.filtroFecha.year}`
        : `No se encontraron registros para ${nombreMes} ${this.filtroFecha.year}`;

      this.mostrarMensaje(cantidad > 0 ? 'success' : 'info', cantidad > 0 ? 'Éxito' : 'Sin registros', mensaje);
    }
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
