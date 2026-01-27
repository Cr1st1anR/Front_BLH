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

  // ✅ Opciones para los selects
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
    this.cargarFrascosDesdeBackend();
  }

  // ✅ INTEGRADO: Cargar frascos desde el backend
  private cargarFrascosDesdeBackend(): void {
    this.loading.frascos = true;

    this.distribucionService.getAllFrascosPasteurizados().subscribe({
      next: (frascos) => {
        this.opcionesFrascos = frascos;
        this.loading.frascos = false;

        if (frascos.length === 0) {
          this.mostrarMensaje('info', 'Información',
            'No hay frascos pasteurizados disponibles en este momento');
        }
      },
      error: (error) => {
        this.loading.frascos = false;
        this.mostrarMensaje('error', 'Error',
          `Error al cargar frascos: ${error.message}`);
        console.error('Error al cargar frascos:', error);

        // Usar datos mock como fallback
        this.cargarFrascosMock();
      }
    });
  }

  // ✅ Método de respaldo con datos mock completos
  private cargarFrascosMock(): void {
    const mockFrascos: FrascoOption[] = [
      {
        label: 'LHP 25 1',
        value: 'LHP 25 1',
        id_frasco: 1,
        numeroFrasco: 1,
        año: 2025,
        calorias: 680,
        acidezDornic: 3.5,
        gaveta: 12
      },
      {
        label: 'LHP 25 2',
        value: 'LHP 25 2',
        id_frasco: 2,
        numeroFrasco: 2,
        año: 2025,
        calorias: 720,
        acidezDornic: 3.8,
        gaveta: 8
      },
      {
        label: 'LHP 25 3',
        value: 'LHP 25 3',
        id_frasco: 3,
        numeroFrasco: 3,
        año: 2025,
        calorias: 700,
        acidezDornic: 3.6,
        gaveta: 5
      },
      {
        label: 'LHP 25 4',
        value: 'LHP 25 4',
        id_frasco: 4,
        numeroFrasco: 4,
        año: 2025,
        calorias: 690,
        acidezDornic: 3.4,
        gaveta: 10
      },
      {
        label: 'LHP 25 5',
        value: 'LHP 25 5',
        id_frasco: 5,
        numeroFrasco: 5,
        año: 2025,
        calorias: 710,
        acidezDornic: 3.7,
        gaveta: 15
      }
    ];

    this.opcionesFrascos = mockFrascos;
    this.mostrarMensaje('warn', 'Advertencia', 'Se han cargado frascos de prueba');
  }

  // ✅ ACTUALIZADO: Asignar valores automáticamente al seleccionar frasco
  onFrascoSeleccionado(event: any, rowData: DistribucionLecheProcesadaData): void {
    const frascoSeleccionado = this.extraerValorEvento(event);
    if (!frascoSeleccionado) return;

    rowData.n_frasco_leche_procesada = frascoSeleccionado;

    const frasco = this.opcionesFrascos.find(f => f.value === frascoSeleccionado);
    if (frasco) {
      // ✅ Asignar ID del frasco
      rowData.id_frasco_leche_procesada = frasco.id_frasco;

      // ✅ NUEVO: Asignar valores automáticamente
      rowData.calorias = frasco.calorias?.toString() || '0';
      rowData.acidez_dornic = frasco.acidezDornic?.toString() || '0';
      rowData.gaveta = frasco.gaveta?.toString() || '0';
      rowData.freezer = '3'; // ✅ Siempre es 3

      // ✅ Mostrar notificación informativa
      this.mostrarMensaje('info', 'Datos cargados',
        `Se han cargado los datos del frasco ${frasco.label}`);
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

    this.dataFiltered = [...this.dataFiltered, nuevoRegistro];
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
      freezer: '3', // ✅ Siempre es 3
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

    // ✅ CORREGIDO: Mensaje más claro
    this.mostrarMensaje('info', 'Guardado temporal',
      'Registro guardado localmente. Presione el botón "Guardar" o "Actualizar" para confirmar los cambios en la base de datos.');
  }

  private procesarRespuestaActualizacion(dataRow: DistribucionLecheProcesadaData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    // ✅ CORREGIDO: Mensaje más claro
    this.mostrarMensaje('info', 'Guardado temporal',
      'Cambios guardados localmente. Presione el botón "Guardar" o "Actualizar" para confirmar los cambios en la base de datos.');
  }

  private getRowId(dataRow: DistribucionLecheProcesadaData): string {
    return dataRow.id?.toString() || 'new';
  }

  /**
   * ✅ Calcula el volumen total distribuido
   */
  get volumenTotalDistribuido(): number {
    if (!this.dataFiltered || this.dataFiltered.length === 0) return 0;

    return this.dataFiltered.reduce((total, registro) => {
      const volumen = parseFloat(registro.vol_distribuido || '0');
      return total + (isNaN(volumen) ? 0 : volumen);
    }, 0);
  }

  /**
   * ✅ Cuenta registros válidos (que tienen volumen)
   */
  get cantidadRegistrosConVolumen(): number {
    if (!this.dataFiltered || this.dataFiltered.length === 0) return 0;

    return this.dataFiltered.filter(registro => {
      const volumen = parseFloat(registro.vol_distribuido || '0');
      return !isNaN(volumen) && volumen > 0;
    }).length;
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
