import { Component, OnInit, ViewChild, Input } from '@angular/core';
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
import { EntradasSalidasPasteurizadaService } from '../../services/entradas-salidas-pasteurizada.service';
import type {
  EntradasSalidasPasteurizadaData,
  LoadingState,
  TableColumn,
  ResponsableOption,
  FiltroFecha,
  FiltrosBusqueda,
  TipoMensaje
} from '../../interfaces/entradas-salidas-pasteurizada.interface';

@Component({
  selector: 'entradas-salidas-pasteurizada-table',
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
  templateUrl: './entradas-salidas-pasteurizada-table.component.html',
  styleUrl: './entradas-salidas-pasteurizada-table.component.scss',
  providers: [MessageService]
})
export class EntradasSalidasPasteurizadaTableComponent implements OnInit {

  @ViewChild('tableEntradasSalidas') table!: Table;

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    n_frasco_pasteurizado: '',
    donante: ''
  };

  readonly loading: LoadingState = {
    main: false,
    empleados: false
  };

  editingRow: EntradasSalidasPasteurizadaData | null = null;
  clonedData: Record<string, EntradasSalidasPasteurizadaData> = {};

  dataOriginal: EntradasSalidasPasteurizadaData[] = [];
  dataFiltered: EntradasSalidasPasteurizadaData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesResponsables: ResponsableOption[] = [];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  headersEntradasSalidas: TableColumn[] = [
    // COLUMNAS DE ENTRADA
    { header: 'FECHA DE\nPROCESAMIENTO', field: 'fecha_procesamiento', width: '140px', tipo: 'date', grupo: 'entrada', vertical: false },
    { header: 'CONGELADOR', field: 'congelador', width: '120px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'N°\nGAVETA', field: 'n_gaveta', width: '80px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'N° FRASCO\nPASTEURIZADO', field: 'n_frasco_pasteurizado', width: '100px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'VOLUMEN EN\nCC', field: 'volumen_cc', width: '100px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: '° DORNIC', field: 'dornic', width: '90px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'KCAL/L', field: 'kcal_l', width: '80px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'DÍAS\nPOSPARTO', field: 'dias_posparto', width: '90px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'DONANTE', field: 'donante', width: '100px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'EDAD\nGESTACIONAL', field: 'edad_gestacional', width: '100px', tipo: 'number', grupo: 'entrada', vertical: false },
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '140px', tipo: 'readonly_date', grupo: 'entrada', vertical: false },
    { header: 'RESPONSABLE', field: 'responsable_entrada', width: '200px', tipo: 'select', grupo: 'entrada', vertical: false },

    // COLUMNAS DE SALIDA
    { header: 'FECHA', field: 'fecha_salida', width: '140px', tipo: 'date', grupo: 'salida', vertical: false },
    { header: 'RESPONSABLE', field: 'responsable_salida', width: '200px', tipo: 'select', grupo: 'salida', vertical: false },

    // ACCIONES (ahora parte del grupo SALIDA)
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions', grupo: 'salida', vertical: false }
  ];

  get dataEntradasSalidas(): EntradasSalidasPasteurizadaData[] {
    return this.dataFiltered;
  }

  get headersEntrada(): TableColumn[] {
    return this.headersEntradasSalidas.filter(h => h.grupo === 'entrada');
  }

  get headersSalida(): TableColumn[] {
    return this.headersEntradasSalidas.filter(h => h.grupo === 'salida');
  }

  get headersAcciones(): TableColumn[] {
    return this.headersEntradasSalidas.filter(h => h.tipo === 'actions');
  }

  constructor(
    private readonly entradasSalidasService: EntradasSalidasPasteurizadaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
    this.cargarDatosMock();
  }

  // ============= INICIALIZACIÓN =============
  private async inicializarComponente(): Promise<void> {
    try {
      await this.cargarEmpleados();
    } catch (error) {
      console.error('Error al inicializar componente:', error);
      this.mostrarMensaje('error', 'Error', 'Error al cargar datos iniciales');
    }
  }

  private cargarEmpleados(): Promise<void> {
    return new Promise((resolve) => {
      this.loading.empleados = true;

      // Por ahora usamos datos mock para empleados
      this.opcionesResponsables = [
        { label: 'Dra. María González', value: 'Dra. María González', id_empleado: 1, cargo: 'Médico' },
        { label: 'Lic. Ana Martínez', value: 'Lic. Ana Martínez', id_empleado: 2, cargo: 'Auxiliar' },
        { label: 'Dr. Carlos López', value: 'Dr. Carlos López', id_empleado: 3, cargo: 'Médico' }
      ];

      this.loading.empleados = false;
      resolve();
    });
  }

  // ============= DATOS MOCK =============
  private cargarDatosMock(): void {
    const mockData: EntradasSalidasPasteurizadaData[] = [
      {
        id: 1,
        fecha_procesamiento: new Date(2025, 11, 5),
        congelador: 'C-1',
        n_gaveta: '12',
        n_frasco_pasteurizado: 'LHP 25\n1234',
        volumen_cc: '150',
        dornic: '3.5',
        kcal_l: '680',
        dias_posparto: '15D',
        donante: '1001',
        edad_gestacional: 38,
        fecha_vencimiento: new Date(2025, 11, 20),
        responsable_entrada: 'Dra. María González',
        fecha_salida: null,
        responsable_salida: '',
        id_empleado_entrada: 1,
        id_empleado_salida: null
      },
      {
        id: 2,
        fecha_procesamiento: new Date(2025, 11, 6),
        congelador: 'C-2',
        n_gaveta: '8',
        n_frasco_pasteurizado: 'LHP 25\n1235',
        volumen_cc: '200',
        dornic: '3.8',
        kcal_l: '720',
        dias_posparto: '1M 5D',
        donante: '1002',
        edad_gestacional: 40,
        fecha_vencimiento: new Date(2025, 11, 21),
        responsable_entrada: 'Lic. Ana Martínez',
        fecha_salida: new Date(2025, 11, 8),
        responsable_salida: 'Dr. Carlos López',
        id_empleado_entrada: 2,
        id_empleado_salida: 3
      }
    ];

    this.dataOriginal = mockData;
    this.aplicarFiltros();
  }

  // ============= EVENTOS DE UI =============
  onResponsableEntradaSeleccionado(event: any, rowData: EntradasSalidasPasteurizadaData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.responsable_entrada = responsable;

    const empleadoSeleccionado = this.opcionesResponsables.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      rowData.id_empleado_entrada = empleadoSeleccionado.id_empleado;
    }
  }

  onResponsableSalidaSeleccionado(event: any, rowData: EntradasSalidasPasteurizadaData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.responsable_salida = responsable;

    const empleadoSeleccionado = this.opcionesResponsables.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      rowData.id_empleado_salida = empleadoSeleccionado.id_empleado;
    }
  }

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: EntradasSalidasPasteurizadaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: EntradasSalidasPasteurizadaData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
    this.actualizarRegistroExistente(dataRow, rowElement);
  }

  onRowEditCancel(dataRow: EntradasSalidasPasteurizadaData, index: number): void {
    this.restaurarEstadoOriginal(dataRow, index);
    this.editingRow = null;
  }

  private actualizarRegistroExistente(dataRow: EntradasSalidasPasteurizadaData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    // Simulación de actualización
    setTimeout(() => {
      this.procesarRespuestaActualizacion(dataRow, rowElement);
    }, 500);
  }

  private validarCamposRequeridos(dataRow: EntradasSalidasPasteurizadaData): boolean {
    return !!(
      dataRow.fecha_procesamiento &&
      dataRow.responsable_entrada?.trim()
    );
  }

  private guardarEstadoOriginal(dataRow: EntradasSalidasPasteurizadaData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: EntradasSalidasPasteurizadaData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaActualizacion(dataRow: EntradasSalidasPasteurizadaData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
  }

  private getRowId(dataRow: EntradasSalidasPasteurizadaData): string {
    return dataRow.id?.toString() || 'unknown';
  }

  // ============= UTILIDADES PARA FORMATEO =============
  formatearCodigoFrasco(codigo: string): string {
    if (!codigo) {
      return '<span class="text-gray-400 italic text-xs">Sin datos</span>';
    }

    if (codigo.startsWith('LHP')) {
      return `<span class="text-blue-600 font-medium text-xs">${codigo.replace(/\n/g, '<br>')}</span>`;
    }

    return codigo.replace(/\n/g, '<br>');
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: EntradasSalidasPasteurizadaData): boolean {
    return this.editingRow !== null && this.editingRow.id === rowData.id;
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  isEditButtonDisabled(rowData: EntradasSalidasPasteurizadaData): boolean {
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
    return !this.loading.empleados;
  }

  aplicarFiltrosBusqueda(filtros: FiltrosBusqueda): void {
    this.filtrosBusqueda = filtros;
    this.aplicarFiltros();
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha | null): void {
    this.filtrarPorFecha(filtro);
  }

  private aplicarFiltros(): void {
    let datosFiltrados = [...this.dataOriginal];

    if (this.filtroFecha) {
      datosFiltrados = this.filtrarPorMesYAno(datosFiltrados, this.filtroFecha);
    }

    datosFiltrados = this.aplicarFiltrosBusquedaTexto(datosFiltrados);

    this.dataFiltered = datosFiltrados;
  }

  private aplicarFiltrosBusquedaTexto(datos: EntradasSalidasPasteurizadaData[]): EntradasSalidasPasteurizadaData[] {
    return datos.filter(item => {
      const cumpleFrasco = !this.filtrosBusqueda.n_frasco_pasteurizado ||
        item.n_frasco_pasteurizado?.toLowerCase().includes(this.filtrosBusqueda.n_frasco_pasteurizado.toLowerCase());

      const cumpleDonante = !this.filtrosBusqueda.donante ||
        item.donante?.toLowerCase().includes(this.filtrosBusqueda.donante.toLowerCase());

      return cumpleFrasco && cumpleDonante;
    });
  }

  private filtrarPorMesYAno(datos: EntradasSalidasPasteurizadaData[], filtro: FiltroFecha): EntradasSalidasPasteurizadaData[] {
    return datos.filter(item => {
      if (!item.fecha_procesamiento) return false;

      const fecha = item.fecha_procesamiento instanceof Date ? item.fecha_procesamiento : new Date(item.fecha_procesamiento);
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

      const hayFiltrosBusqueda = Object.values(this.filtrosBusqueda).some(filtro => filtro.trim() !== '');

      if (hayFiltrosBusqueda) {
        const mensaje = cantidad > 0
          ? `${cantidad} registro${cantidad > 1 ? 's' : ''} encontrado${cantidad > 1 ? 's' : ''}`
          : `No se encontraron registros con los filtros aplicados`;

        this.mostrarMensaje(cantidad > 0 ? 'info' : 'warn', 'Filtros aplicados', mensaje);
      }
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
