import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import type {
  IngresoLechePasteurizadaData,
  LoadingState,
  TableColumn,
  FiltroFecha,
  FiltrosBusqueda,
  FrascoOption,
  TipoLecheOption,
  TipoMensaje
} from '../../interfaces/ingreso-leche-pasteurizada.interface';

@Component({
  selector: 'ingreso-leche-pasteurizada-table',
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
    TooltipModule,
    HttpClientModule
  ],
  templateUrl: './ingreso-leche-pasteurizada-table.component.html',
  styleUrl: './ingreso-leche-pasteurizada-table.component.scss',
  providers: [MessageService]
})
export class IngresoLechePasteurizadaTableComponent implements OnInit {

  @ViewChild('tableIngresoLeche') table!: Table;

  @Output() dosificacionesClick = new EventEmitter<IngresoLechePasteurizadaData>();

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    n_frasco: '',
    n_donante: '',
    lote: ''
  };

  readonly loading: LoadingState = {
    main: false,
    frascos: false,
    saving: false
  };

  editingRow: IngresoLechePasteurizadaData | null = null;
  clonedData: Record<string, IngresoLechePasteurizadaData> = {};
  hasNewRowInEditing = false;
  tempIdCounter = -1;

  dataOriginal: IngresoLechePasteurizadaData[] = [];
  dataFiltered: IngresoLechePasteurizadaData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesFrascos: FrascoOption[] = [];
  opcionesTipoLeche: TipoLecheOption[] = [
    { label: 'Madura', value: 'Madura' },
    { label: 'Transición', value: 'Transición' },
    { label: 'Calostro', value: 'Calostro' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  headersIngresoLeche: TableColumn[] = [
    { header: 'FECHA\nDISPENSACIÓN', field: 'fecha_dispensacion', width: '150px', tipo: 'date' },
    { header: 'N° FRASCO', field: 'n_frasco', width: '150px', tipo: 'select' },
    { header: 'N°\nDONANTE', field: 'n_donante', width: '120px', tipo: 'readonly' },
    { header: 'VOLUMEN\n(ML)', field: 'volumen', width: '120px', tipo: 'readonly' },
    { header: 'ACIDEZ\n(°D)', field: 'acidez_dornic', width: '100px', tipo: 'readonly' },
    { header: 'CALORIAS', field: 'calorias', width: '120px', tipo: 'readonly' },
    { header: 'TIPO LECHE', field: 'tipo_leche', width: '150px', tipo: 'select' },
    { header: 'LOTE', field: 'lote', width: '100px', tipo: 'readonly' },
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '150px', tipo: 'readonly_date' },
    { header: 'FECHA/HORA\nDESHIELE', field: 'fecha_hora_deshiele', width: '170px', tipo: 'readonly_datetime' },
    { header: 'DOSIFICACIONES', field: 'dosificaciones', width: '150px', tipo: 'eye' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  get dataIngresoLeche(): IngresoLechePasteurizadaData[] {
    return this.dataFiltered;
  }

  constructor(
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
  this.cargarFrascosMock();
  this.cargarDatosMock();
}

  // ============= CARGAR FRASCOS MOCK =============
  private cargarDatosMock(): void {
  const fechaActual = new Date();
  const fechaVencimiento1 = this.calcularFechaVencimiento(fechaActual);

  const fecha2 = new Date();
  fecha2.setDate(fecha2.getDate() - 3);
  const fechaVencimiento2 = this.calcularFechaVencimiento(fecha2);

  const añoCorto = fechaActual.getFullYear().toString().slice(-2);

  this.dataOriginal = [
    {
      id: 1,
      fecha_dispensacion: fechaActual,
      n_frasco: `LHP ${añoCorto} 1`,
      id_frasco: 1,
      n_donante: '001',
      volumen: '150',
      acidez_dornic: '3.5',
      calorias: '680',
      tipo_leche: 'Madura',
      lote: '101',
      fecha_vencimiento: fechaVencimiento1,
      fecha_hora_deshiele: new Date(fechaActual),
      isNew: false
    },
    {
      id: 2,
      fecha_dispensacion: fecha2,
      n_frasco: `LHP ${añoCorto} 2`,
      id_frasco: 2,
      n_donante: '002',
      volumen: '200',
      acidez_dornic: '3.8',
      calorias: '720',
      tipo_leche: 'Transición',
      lote: '102',
      fecha_vencimiento: fechaVencimiento2,
      fecha_hora_deshiele: new Date(fecha2),
      isNew: false
    }
  ];

  this.dataFiltered = [...this.dataOriginal];
}

private cargarFrascosMock(): void {
  const añoActual = new Date().getFullYear();
  const añoCorto = añoActual.toString().slice(-2);

  const mockFrascos: FrascoOption[] = [
    {
      label: `LHP ${añoCorto} 1`,
      value: `LHP ${añoCorto} 1`,
      id_frasco: 1,
      n_donante: '001',
      volumen: '150',
      acidez_dornic: '3.5',
      calorias: '680',
      lote: '101',
      año: añoActual
    },
    {
      label: `LHP ${añoCorto} 2`,
      value: `LHP ${añoCorto} 2`,
      id_frasco: 2,
      n_donante: '002',
      volumen: '200',
      acidez_dornic: '3.8',
      calorias: '720',
      lote: '102',
      año: añoActual
    },
    {
      label: `LHP ${añoCorto} 3`,
      value: `LHP ${añoCorto} 3`,
      id_frasco: 3,
      n_donante: '003',
      volumen: '175',
      acidez_dornic: '3.6',
      calorias: '700',
      lote: '103',
      año: añoActual
    },
    {
      label: `LHP ${añoCorto} 4`,
      value: `LHP ${añoCorto} 4`,
      id_frasco: 4,
      n_donante: '004',
      volumen: '180',
      acidez_dornic: '3.4',
      calorias: '690',
      lote: '104',
      año: añoActual
    },
    {
      label: `LHP ${añoCorto} 5`,
      value: `LHP ${añoCorto} 5`,
      id_frasco: 5,
      n_donante: '005',
      volumen: '190',
      acidez_dornic: '3.7',
      calorias: '710',
      lote: '105',
      año: añoActual
    }
  ];

  this.opcionesFrascos = mockFrascos;
}

  // ============= EVENTOS DE SELECCIÓN =============
  onFrascoSeleccionado(event: any, rowData: IngresoLechePasteurizadaData): void {
  const frascoSeleccionado = this.extraerValorEvento(event);
  if (!frascoSeleccionado) return;

  // Validar que el frasco no esté ya registrado
  const frascoYaRegistrado = this.dataOriginal.some(item =>
    item.n_frasco === frascoSeleccionado &&
    item.id !== rowData.id &&
    !item.isNew
  );

  if (frascoYaRegistrado) {
    this.mostrarMensaje(
      'error',
      'Frasco No Disponible',
      `El frasco ${frascoSeleccionado} ya ha sido utilizado en otro registro`
    );
    rowData.n_frasco = '';
    rowData.id_frasco = null;
    rowData.n_donante = '';
    rowData.volumen = '';
    rowData.acidez_dornic = '';
    rowData.calorias = '';
    rowData.lote = '';
    return;
  }

  rowData.n_frasco = frascoSeleccionado;

  const frasco = this.opcionesFrascos.find(f => f.value === frascoSeleccionado);
  if (frasco) {
    rowData.id_frasco = frasco.id_frasco;
    rowData.n_donante = frasco.n_donante;
    rowData.volumen = frasco.volumen;
    rowData.acidez_dornic = frasco.acidez_dornic;
    rowData.calorias = frasco.calorias;
    rowData.lote = frasco.lote;
  }
}

  onTipoLecheSeleccionado(event: any, rowData: IngresoLechePasteurizadaData): void {
    const tipoLeche = this.extraerValorEvento(event);
    if (!tipoLeche) return;

    rowData.tipo_leche = tipoLeche;
  }

  onFechaDispensacionChanged(rowData: IngresoLechePasteurizadaData): void {
    if (rowData.fecha_dispensacion) {
      // Calcular fecha de vencimiento (6 meses)
      rowData.fecha_vencimiento = this.calcularFechaVencimiento(rowData.fecha_dispensacion as Date);

      // Establecer fecha/hora deshiele igual a fecha dispensación
      rowData.fecha_hora_deshiele = new Date(rowData.fecha_dispensacion);
    } else {
      rowData.fecha_vencimiento = null;
      rowData.fecha_hora_deshiele = null;
    }
  }

  onDosificacionesClick(rowData: IngresoLechePasteurizadaData, event: Event): void {
  event.stopPropagation();

  if (this.isAnyRowEditing()) {
    return;
  }

  this.dosificacionesClick.emit(rowData);
}

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  private calcularFechaVencimiento(fechaBase: Date): Date | null {
    if (!fechaBase || !(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) {
      return null;
    }

    const fechaVencimiento = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
    fechaVencimiento.setHours(12, 0, 0, 0);

    return fechaVencimiento;
  }

  // ============= CREAR NUEVO REGISTRO =============
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

  private crearRegistroVacio(): IngresoLechePasteurizadaData {
    const fechaActual = new Date();
    const fechaVencimiento = this.calcularFechaVencimiento(fechaActual);

    return {
      id: null,
      fecha_dispensacion: fechaActual,
      n_frasco: '',
      id_frasco: null,
      n_donante: '',
      volumen: '',
      acidez_dornic: '',
      calorias: '',
      tipo_leche: '',
      lote: '',
      fecha_vencimiento: fechaVencimiento,
      fecha_hora_deshiele: new Date(fechaActual),
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarRegistroATabla(registro: IngresoLechePasteurizadaData): void {
    this.dataOriginal.push(registro);
    this.dataFiltered.push(registro);
    this.dataFiltered = [...this.dataFiltered];
  }

  private iniciarEdicionRegistro(registro: IngresoLechePasteurizadaData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = registro;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: IngresoLechePasteurizadaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: IngresoLechePasteurizadaData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: IngresoLechePasteurizadaData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    this.loading.saving = true;

    // Simulación de guardado (mock)
    setTimeout(() => {
      dataRow.id = Date.now();
      this.procesarRespuestaCreacion(dataRow, rowElement);
    }, 500);
  }

  private actualizarRegistroExistente(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    this.loading.saving = true;

    // Simulación de actualización (mock)
    setTimeout(() => {
      this.procesarRespuestaActualizacion(dataRow, rowElement);
    }, 500);
  }

  private eliminarRegistroTemporal(dataRow: IngresoLechePasteurizadaData): void {
    const predicate = (item: IngresoLechePasteurizadaData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const originalIndex = this.dataOriginal.findIndex(predicate);
    if (originalIndex !== -1) this.dataOriginal.splice(originalIndex, 1);

    const filteredIndex = this.dataFiltered.findIndex(predicate);
    if (filteredIndex !== -1) {
      this.dataFiltered.splice(filteredIndex, 1);
      this.dataFiltered = [...this.dataFiltered];
    }
  }

  private validarCamposRequeridos(dataRow: IngresoLechePasteurizadaData): boolean {
    return !!(
      dataRow.fecha_dispensacion &&
      dataRow.n_frasco?.trim() &&
      dataRow.tipo_leche?.trim() &&
      dataRow.n_donante?.trim() &&
      dataRow.volumen?.trim() &&
      dataRow.lote?.trim()
    );
  }

  private guardarEstadoOriginal(dataRow: IngresoLechePasteurizadaData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: IngresoLechePasteurizadaData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaCreacion(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    delete dataRow._uid;

    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro creado exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
  }

  private getRowId(dataRow: IngresoLechePasteurizadaData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: IngresoLechePasteurizadaData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: IngresoLechePasteurizadaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ============= FILTROS =============
  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  isTableInitialized(): boolean {
    return true;
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

  private aplicarFiltrosBusquedaTexto(datos: IngresoLechePasteurizadaData[]): IngresoLechePasteurizadaData[] {
    return datos.filter(item => {
      const cumpleFrasco = !this.filtrosBusqueda.n_frasco ||
        item.n_frasco?.toLowerCase().includes(this.filtrosBusqueda.n_frasco.toLowerCase());

      const cumpleDonante = !this.filtrosBusqueda.n_donante ||
        item.n_donante?.toLowerCase().includes(this.filtrosBusqueda.n_donante.toLowerCase());

      const cumpleLote = !this.filtrosBusqueda.lote ||
        item.lote?.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      return cumpleFrasco && cumpleDonante && cumpleLote;
    });
  }

  private filtrarPorMesYAno(datos: IngresoLechePasteurizadaData[], filtro: FiltroFecha): IngresoLechePasteurizadaData[] {
    return datos.filter(item => {
      if (!item.fecha_dispensacion) return false;

      const fecha = item.fecha_dispensacion instanceof Date ? item.fecha_dispensacion : new Date(item.fecha_dispensacion);
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
