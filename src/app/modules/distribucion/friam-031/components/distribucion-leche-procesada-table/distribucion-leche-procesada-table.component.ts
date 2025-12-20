import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule, Table } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DistribucionLecheProcesadaService } from '../../services/distribucion-leche-procesada.service';
import type {
  DistribucionLecheProcesadaData,
  LoadingState,
  TableColumn,
  FiltroFecha,
  FrascoOption,
  TipoEdadOption,
  TipoMensaje
} from '../../interfaces/distribucion-leche-procesada.interface';

@Component({
  selector: 'distribucion-leche-procesada-table',
  standalone: true,
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
    CheckboxModule,
    TooltipModule,
    HttpClientModule
  ],
  templateUrl: './distribucion-leche-procesada-table.component.html',
  styleUrl: './distribucion-leche-procesada-table.component.scss',
  providers: [MessageService]
})
export class DistribucionLecheProcesadaTableComponent implements OnInit {

  @ViewChild('tableDistribucion') table!: Table;

  readonly loading: LoadingState = {
    main: false,
    empleados: false,
    frascos: false,
    saving: false,
    fechas: false
  };

  editingRow: DistribucionLecheProcesadaData | null = null;
  clonedData: Record<string, DistribucionLecheProcesadaData> = {};
  hasNewRowInEditing = false;

  dataOriginal: DistribucionLecheProcesadaData[] = [];
  dataFiltered: DistribucionLecheProcesadaData[] = [];
  filtroFecha: FiltroFecha | null = null;

  // ✅ NUEVO: Opciones para los selects
  opcionesFrascos: FrascoOption[] = [];
  opcionesTipoEdad: TipoEdadOption[] = [
    { label: 'Madura', value: 'Madura' },
    { label: 'Transición', value: 'Transición' },
    { label: 'Calostro', value: 'Calostro' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  headersDistribucion: TableColumn[] = [
    // COLUMNAS DE INFORMACIÓN RECEPTORES
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date', grupo: 'receptores', vertical: false },
    { header: 'VOL.\nDISTRIBUIDO', field: 'vol_distribuido', width: '110px', tipo: 'text', grupo: 'receptores', vertical: false },

    // COLUMNAS DE INFORMACIÓN LECHE PASTEURIZADA
    { header: 'Nº FRASCO LECHE\nPROCESADA', field: 'n_frasco_leche_procesada', width: '140px', tipo: 'select', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'CALORÍAS', field: 'calorias', width: '100px', tipo: 'readonly', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'ACIDEZ\nDORNIC', field: 'acidez_dornic', width: '100px', tipo: 'readonly', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'TIPO/EDAD', field: 'tipo_edad', width: '110px', tipo: 'select', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'EXCLUSIVA', field: 'exclusiva', width: '110px', tipo: 'checkbox', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'FREEZER', field: 'freezer', width: '100px', tipo: 'readonly', grupo: 'leche_pasteurizada', vertical: false },
    { header: 'GAVETA', field: 'gaveta', width: '100px', tipo: 'readonly', grupo: 'leche_pasteurizada', vertical: false }
  ];

  get dataDistribucion(): DistribucionLecheProcesadaData[] {
    return this.dataFiltered;
  }

  get headersReceptores(): TableColumn[] {
    return this.headersDistribucion.filter(h => h.grupo === 'receptores');
  }

  get headersLechePasteurizada(): TableColumn[] {
    return this.headersDistribucion.filter(h => h.grupo === 'leche_pasteurizada');
  }

  constructor(
    private readonly distribucionService: DistribucionLecheProcesadaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarFrascosMock();
    this.cargarDatosMock();
  }

  // ============= CARGAR FRASCOS MOCK =============
  private cargarFrascosMock(): void {
    const mockFrascos: FrascoOption[] = [
      { label: 'LHP 25 1', value: 'LHP 25 1', id_frasco: 1, numeroFrasco: 1, año: 2025 },
      { label: 'LHP 25 2', value: 'LHP 25 2', id_frasco: 2, numeroFrasco: 2, año: 2025 },
      { label: 'LHP 25 3', value: 'LHP 25 3', id_frasco: 3, numeroFrasco: 3, año: 2025 },
      { label: 'LHP 25 4', value: 'LHP 25 4', id_frasco: 4, numeroFrasco: 4, año: 2025 },
      { label: 'LHP 25 5', value: 'LHP 25 5', id_frasco: 5, numeroFrasco: 5, año: 2025 },
      { label: 'LHP 25 10', value: 'LHP 25 10', id_frasco: 10, numeroFrasco: 10, año: 2025 },
      { label: 'LHP 25 15', value: 'LHP 25 15', id_frasco: 15, numeroFrasco: 15, año: 2025 },
      { label: 'LHP 25 20', value: 'LHP 25 20', id_frasco: 20, numeroFrasco: 20, año: 2025 }
    ];

    this.opcionesFrascos = mockFrascos;
  }

  // ============= DATOS MOCK =============
  private cargarDatosMock(): void {
    const mockData: DistribucionLecheProcesadaData[] = [
      {
        id: 1,
        fecha: new Date(2025, 11, 5),
        vol_distribuido: '150',
        n_frasco_leche_procesada: 'LHP 25 1',
        id_frasco_leche_procesada: 1,
        calorias: '680',
        acidez_dornic: '3.5',
        tipo_edad: 'Madura',
        exclusiva: 1,
        freezer: '3',
        gaveta: '12'
      },
      {
        id: 2,
        fecha: new Date(2025, 11, 6),
        vol_distribuido: '200',
        n_frasco_leche_procesada: 'LHP 25 2',
        id_frasco_leche_procesada: 2,
        calorias: '720',
        acidez_dornic: '3.8',
        tipo_edad: 'Transición',
        exclusiva: 0,
        freezer: '2',
        gaveta: '8'
      }
    ];

    this.dataOriginal = mockData;
    this.aplicarFiltros();
  }

  // ============= EVENTOS DE SELECCIÓN =============
  onFrascoSeleccionado(event: any, rowData: DistribucionLecheProcesadaData): void {
    const frascoSeleccionado = this.extraerValorEvento(event);
    if (!frascoSeleccionado) return;

    rowData.n_frasco_leche_procesada = frascoSeleccionado;

    const frasco = this.opcionesFrascos.find(f => f.value === frascoSeleccionado);
    if (frasco?.id_frasco) {
      rowData.id_frasco_leche_procesada = frasco.id_frasco;

      // Aquí puedes cargar datos adicionales del frasco si es necesario
      // como calorías, acidez, freezer, gaveta, etc.
      this.cargarDatosFrasco(rowData, frasco.id_frasco);
    }
  }

  onTipoEdadSeleccionado(event: any, rowData: DistribucionLecheProcesadaData): void {
    const tipoEdad = this.extraerValorEvento(event);
    if (!tipoEdad) return;

    rowData.tipo_edad = tipoEdad;
  }

  onExclusivaChange(event: any, rowData: DistribucionLecheProcesadaData): void {
    const isChecked = event?.checked ?? false;
    rowData.exclusiva = isChecked ? 1 : 0;
  }

  private cargarDatosFrasco(rowData: DistribucionLecheProcesadaData, idFrasco: number): void {
    // ✅ MOCK: Simular carga de datos del frasco
    // En producción, aquí harías una llamada al servicio
    const datosMockFrasco: Record<number, any> = {
      1: { calorias: '680', acidez_dornic: '3.5', freezer: '3', gaveta: '12' },
      2: { calorias: '720', acidez_dornic: '3.8', freezer: '2', gaveta: '8' },
      3: { calorias: '700', acidez_dornic: '3.6', freezer: '1', gaveta: '5' },
      4: { calorias: '690', acidez_dornic: '3.4', freezer: '2', gaveta: '10' },
      5: { calorias: '710', acidez_dornic: '3.7', freezer: '3', gaveta: '15' }
    };

    const datos = datosMockFrasco[idFrasco];
    if (datos) {
      rowData.calorias = datos.calorias;
      rowData.acidez_dornic = datos.acidez_dornic;
      rowData.freezer = datos.freezer;
      rowData.gaveta = datos.gaveta;
    }
  }

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  // ============= CREAR NUEVO REGISTRO =============
  crearNuevoRegistro(): void {
    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de crear un nuevo registro.');
      return;
    }

    const nuevoRegistro = this.createNewRecord();
    this.dataFiltered = [nuevoRegistro, ...this.dataFiltered];
    this.hasNewRowInEditing = true;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  private createNewRecord(): DistribucionLecheProcesadaData {
    const fechaActual = new Date();

    return {
      id: null,
      fecha: fechaActual,
      vol_distribuido: '',
      n_frasco_leche_procesada: '',
      id_frasco_leche_procesada: null,
      calorias: '',
      acidez_dornic: '',
      tipo_edad: '',
      exclusiva: 0,
      freezer: '',
      gaveta: ''
    };
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: DistribucionLecheProcesadaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: DistribucionLecheProcesadaData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.id === null) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: DistribucionLecheProcesadaData, index: number): void {
    if (dataRow.id === null) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: DistribucionLecheProcesadaData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    setTimeout(() => {
      dataRow.id = Date.now();
      this.procesarRespuestaCreacion(dataRow, rowElement);
    }, 500);
  }

  private actualizarRegistroExistente(dataRow: DistribucionLecheProcesadaData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    setTimeout(() => {
      this.procesarRespuestaActualizacion(dataRow, rowElement);
    }, 500);
  }

  private removeNewRowFromData(dataRow: DistribucionLecheProcesadaData): void {
    const index = this.dataFiltered.indexOf(dataRow);
    if (index > -1) {
      this.dataFiltered.splice(index, 1);
    }
  }

  private validarCamposRequeridos(dataRow: DistribucionLecheProcesadaData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.vol_distribuido?.trim() &&
      dataRow.n_frasco_leche_procesada?.trim() &&
      dataRow.tipo_edad?.trim()
    );
  }

  private guardarEstadoOriginal(dataRow: DistribucionLecheProcesadaData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: DistribucionLecheProcesadaData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaCreacion(dataRow: DistribucionLecheProcesadaData, rowElement: HTMLTableRowElement): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro creado exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: DistribucionLecheProcesadaData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
  }

  private getRowId(dataRow: DistribucionLecheProcesadaData): string {
    return dataRow.id?.toString() || 'new';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: DistribucionLecheProcesadaData): boolean {
    return this.editingRow !== null && this.editingRow.id === rowData.id;
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: DistribucionLecheProcesadaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ============= FILTROS =============
  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;

    if (filtro) {
      this.aplicarFiltros();
      this.mostrarNotificacionFiltro();
    } else {
      this.dataOriginal = [];
      this.aplicarFiltros();
    }
  }

  isTableInitialized(): boolean {
    return true;
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha | null): void {
    this.filtrarPorFecha(filtro);
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    this.dataFiltered = datosFiltrados;
  }

  private filtrarPorMesYAno(datos: DistribucionLecheProcesadaData[], filtro: FiltroFecha): DistribucionLecheProcesadaData[] {
    return datos.filter(item => {
      if (!item.fecha) return false;

      const fecha = item.fecha instanceof Date ? item.fecha : new Date(item.fecha);
      if (isNaN(fecha.getTime())) return false;

      const mesItem = fecha.getMonth() + 1;
      const añoItem = fecha.getFullYear();

      return mesItem === filtro.month && añoItem === filtro.year;
    });
  }

  private mostrarNotificacionFiltro(): void {
    const cantidad = this.dataFiltered.length;

    if (this.filtroFecha) {
      const nombreMes = this.mesesDelAno[this.filtroFecha.month - 1];
      const mensaje = cantidad > 0
        ? `Se encontraron ${cantidad} registro${cantidad > 1 ? 's' : ''} para ${nombreMes} ${this.filtroFecha.year}`
        : `No se encontraron registros para ${nombreMes} ${this.filtroFecha.year}`;

      this.mostrarMensaje(cantidad > 0 ? 'info' : 'warn', 'Filtro aplicado', mensaje);
    }
  }

  // ============= MÉTODOS PÚBLICOS PARA EL COMPONENTE PADRE =============

  /**
   * Carga datos externos en la tabla (cuando se selecciona una fecha existente)
   */
  cargarDatosExternos(datos: DistribucionLecheProcesadaData[]): void {
    this.dataOriginal = datos;
    this.aplicarFiltros();
  }

  /**
   * Limpia todos los datos de la tabla
   */
  limpiarDatos(): void {
    this.dataOriginal = [];
    this.dataFiltered = [];
    this.editingRow = null;
    this.clonedData = {};
    this.hasNewRowInEditing = false;
  }

  /**
   * Valida si un registro está completo
   */
  validarRegistroCompleto(registro: DistribucionLecheProcesadaData): boolean {
    return !!(
      registro.fecha &&
      registro.vol_distribuido?.trim() &&
      registro.n_frasco_leche_procesada?.trim() &&
      registro.tipo_edad?.trim() &&
      (registro.exclusiva === 0 || registro.exclusiva === 1) &&
      registro.calorias?.trim() &&
      registro.acidez_dornic?.trim() &&
      registro.freezer?.trim() &&
      registro.gaveta?.trim()
    );
  }

  // ============= MENSAJES =============
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
