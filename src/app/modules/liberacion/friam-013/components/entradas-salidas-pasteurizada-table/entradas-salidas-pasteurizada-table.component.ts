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
  TipoMensaje,
  BackendApiResponse,
  PutEntradasSalidasRequest
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

  private readonly DIAS_POR_MES = 30;

  @ViewChild('tableEntradasSalidas') table!: Table;

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    n_frasco_pasteurizado: '',
    donante: '',
    n_gaveta: ''
  };

  readonly loading: LoadingState = {
    main: false,
    empleados: false,
    search: false
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
    { header: 'FECHA DE\nPROCESAMIENTO', field: 'fecha_procesamiento', width: '140px', tipo: 'readonly_date', grupo: 'entrada', vertical: false },
    { header: 'CONGELADOR', field: 'congelador', width: '120px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'N°\nGAVETA', field: 'n_gaveta', width: '80px', tipo: 'text', grupo: 'entrada', vertical: false },
    { header: 'N° FRASCO\nPASTEURIZADO', field: 'n_frasco_pasteurizado', width: '100px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'VOLUMEN EN\nCC', field: 'volumen_cc', width: '100px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: '° DORNIC', field: 'dornic', width: '90px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'KCAL/L', field: 'kcal_l', width: '80px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'DÍAS\nPOSPARTO', field: 'dias_posparto', width: '90px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'DONANTE', field: 'donante', width: '100px', tipo: 'readonly_text', grupo: 'entrada', vertical: false },
    { header: 'EDAD\nGESTACIONAL', field: 'edad_gestacional', width: '100px', tipo: 'readonly_number', grupo: 'entrada', vertical: false },
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '140px', tipo: 'readonly_date', grupo: 'entrada', vertical: false },
    { header: 'RESPONSABLE', field: 'responsable_entrada', width: '200px', tipo: 'select', grupo: 'entrada', vertical: false },

    // COLUMNAS DE SALIDA
    { header: 'FECHA', field: 'fecha_salida', width: '155px', tipo: 'date', grupo: 'salida', vertical: false },
    { header: 'RESPONSABLE', field: 'responsable_salida', width: '200px', tipo: 'select', grupo: 'salida', vertical: false }
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

  constructor(
    private readonly entradasSalidasService: EntradasSalidasPasteurizadaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
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
    return new Promise((resolve, reject) => {
      this.loading.empleados = true;

      this.entradasSalidasService.getEmpleados().subscribe({
        next: (response) => {
          this.opcionesResponsables = response.data.map(empleado => ({
            label: empleado.nombre,
            value: empleado.nombre,
            id_empleado: empleado.id,
            cargo: empleado.cargo,
            telefono: empleado.telefono,
            correo: empleado.correo || ''
          }));

          this.loading.empleados = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar empleados:', error);
          this.loading.empleados = false;
          reject(error);
        }
      });
    });
  }

  // ============= BÚSQUEDA POR LOTE (API REAL) =============
  buscarPorLote(lote: number): void {
    if (!lote || lote <= 0) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor ingrese un lote válido');
      return;
    }

    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de buscar');
      return;
    }

    this.loading.search = true;

    this.entradasSalidasService.getEntradasSalidasPorLote(lote).subscribe({
      next: (response) => {
        if (response.status === 204 || !response.data || response.data.length === 0) {
          this.mostrarMensaje('info', 'Sin resultados', `No se encontraron registros para el lote ${lote}`);
          this.dataOriginal = [];
          this.dataFiltered = [];
        } else {
          this.dataOriginal = this.mapearDatosBackendAFrontend(response.data);
          this.aplicarFiltros();
          this.mostrarMensaje('success', 'Búsqueda exitosa', `Se encontraron ${this.dataOriginal.length} registro${this.dataOriginal.length > 1 ? 's' : ''} para el lote ${lote}`);
        }

        this.loading.search = false;
        this.filtroFecha = null;
      },
      error: (error) => {
        console.error('Error al buscar por lote:', error);
        this.mostrarMensaje('error', 'Error', 'Error al buscar datos del lote');
        this.loading.search = false;
      }
    });
  }

  limpiarBusquedaLote(): void {
    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de limpiar');
      return;
    }

    this.dataOriginal = [];
    this.aplicarFiltros();
    this.mostrarMensaje('info', 'Información', 'Búsqueda por lote limpiada');
  }

  // ============= MAPEO DE DATOS BACKEND A FRONTEND =============
  private mapearDatosBackendAFrontend(backendData: BackendApiResponse[]): EntradasSalidasPasteurizadaData[] {
    return backendData.map(item => {
      const fechaParto = item.frascoPasteurizado.controlReenvase.frascoCrudo.madreDonante.gestacion.fechaParto;
      const fechaExtraccion = this.obtenerFechaExtraccion(item);
      const fechaProcesamiento = this.parsearFecha(item.frascoPasteurizado.controlReenvase.frascoCrudo.fechaSalida);
      const anioFrasco = fechaProcesamiento ? fechaProcesamiento.getFullYear().toString().slice(-2) : '00';

      return {
        id: item.id,
        fecha_procesamiento: fechaProcesamiento,
        congelador: '3',
        n_gaveta: item.gaveta?.toString() || '',
        n_frasco_pasteurizado: `LHP ${anioFrasco}\n${item.frascoPasteurizado.id}`,
        volumen_cc: item.frascoPasteurizado.volumen?.toString() || '',
        dornic: item.frascoPasteurizado.controlReenvase.seleccionClasificacion?.acidezDornic?.resultado?.toString() || '',
        kcal_l: item.frascoPasteurizado.controlReenvase.seleccionClasificacion?.crematocrito?.kcal?.toString() || '',
        fecha_parto: this.parsearFecha(fechaParto),
        dias_posparto: this.calcularDiasPosparto(fechaParto, fechaExtraccion),
        donante: item.frascoPasteurizado.controlReenvase.frascoCrudo.madreDonante.id?.toString() || '',
        edad_gestacional: item.frascoPasteurizado.controlReenvase.frascoCrudo.madreDonante.gestacion?.semanas || 0,
        fecha_vencimiento: this.calcularFechaVencimiento(fechaProcesamiento),
        responsable_entrada: item.responsableEntrada?.nombre || '',
        fecha_salida: item.fechaSalida ? this.parsearFecha(item.fechaSalida) : null,
        responsable_salida: item.responsableSalida?.nombre || '',
        id_empleado_entrada: item.responsableEntrada?.id || null,
        id_empleado_salida: item.responsableSalida?.id || null,
        lote: item.frascoPasteurizado.controlReenvase.lote?.numeroLote || null
      };
    });
  }

  /**
   * Obtiene la fecha de extracción desde frascoRecolectado o extraccion
   */
  private obtenerFechaExtraccion(item: BackendApiResponse): string {
    const frascoCrudo = item.frascoPasteurizado.controlReenvase.frascoCrudo;

    if (frascoCrudo.frascoRecolectado?.fechaDeExtraccion) {
      return frascoCrudo.frascoRecolectado.fechaDeExtraccion;
    }

    if (frascoCrudo.extraccion?.fechaDeExtraccion) {
      return frascoCrudo.extraccion.fechaDeExtraccion;
    }

    return '';
  }

  /**
   * Parsea una fecha desde formato YYYY-MM-DD a Date
   */
  private parsearFecha(fechaString: string | null | undefined): Date | null {
    if (!fechaString) return null;

    try {
      const [year, month, day] = fechaString.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Error al parsear fecha:', fechaString, error);
      return null;
    }
  }

  // ============= CÁLCULO DE DÍAS POSPARTO =============
  private calcularDiasPosparto(fechaParto: string, fechaExtraccion: string): string {
    if (!fechaParto || !fechaExtraccion) return '';

    const parto = new Date(fechaParto);
    const extraccion = new Date(fechaExtraccion);
    const diffTime = Math.abs(extraccion.getTime() - parto.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return this.formatearDiasPosparto(diffDays);
  }

  private formatearDiasPosparto(dias: number): string {
    if (dias < this.DIAS_POR_MES) {
      return `${dias}D`;
    }

    const meses = Math.floor(dias / this.DIAS_POR_MES);
    const diasRestantes = dias % this.DIAS_POR_MES;

    return diasRestantes > 0
      ? `${meses}M ${diasRestantes}D`
      : `${meses}M`;
  }

  // ============= CÁLCULO DE FECHA DE VENCIMIENTO =============
  private calcularFechaVencimiento(fechaProcesamiento: Date | null): Date | null {
    if (!fechaProcesamiento) return null;

    const fecha = fechaProcesamiento instanceof Date ? fechaProcesamiento : new Date(fechaProcesamiento);
    if (isNaN(fecha.getTime())) return null;

    const fechaVencimiento = new Date(fecha);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);

    return fechaVencimiento;
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
    if (!dataRow.id) {
      this.mostrarMensaje('error', 'Error', 'No se puede actualizar un registro sin ID');
      return;
    }

    this.loading.main = true;

    const requestData = this.mapearDatosParaBackend(dataRow);

    this.entradasSalidasService.putEntradasSalidasPasteurizada(dataRow.id, requestData).subscribe({
      next: (response) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
        this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar registro:', error);
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el registro');
        this.loading.main = false;
        this.restaurarEstadoOriginal(dataRow, this.dataFiltered.indexOf(dataRow));
      }
    });
  }

  /**
   * Mapea los datos del frontend al formato requerido por el backend
   */
  private mapearDatosParaBackend(rowData: EntradasSalidasPasteurizadaData): PutEntradasSalidasRequest {
    return {
      gaveta: parseInt(rowData.n_gaveta) || 0,
      fechaSalida: this.convertirFechaParaBackend(rowData.fecha_salida),
      responsableEntrada: rowData.id_empleado_entrada || 0,
      responsableSalida: rowData.id_empleado_salida || 0
    };
  }

  /**
   * Convierte fechas de diferentes formatos a YYYY-MM-DD
   */
  private convertirFechaParaBackend(fecha: string | Date | null): string {
    if (!fecha) return '';

    try {
      const dateObj = fecha instanceof Date ? fecha : new Date(fecha);

      if (isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al convertir fecha:', error);
      return '';
    }
  }

  private validarCamposRequeridos(dataRow: EntradasSalidasPasteurizadaData): boolean {
    const gavetaValida = !!(dataRow.n_gaveta?.trim() && !isNaN(parseInt(dataRow.n_gaveta)));
    const responsableEntradaValido = !!(dataRow.responsable_entrada?.trim() && dataRow.id_empleado_entrada);
    const responsableSalidaValido = !!(dataRow.responsable_salida?.trim() && dataRow.id_empleado_salida);
    const fechaSalidaValida = !!dataRow.fecha_salida;

    if (!gavetaValida) {
      this.mostrarMensaje('error', 'Error', 'La gaveta debe ser un número válido');
      return false;
    }

    if (!responsableEntradaValido) {
      this.mostrarMensaje('error', 'Error', 'Debe seleccionar un responsable de entrada');
      return false;
    }

    if (!fechaSalidaValida) {
      this.mostrarMensaje('error', 'Error', 'Debe seleccionar una fecha de salida');
      return false;
    }

    if (!responsableSalidaValido) {
      this.mostrarMensaje('error', 'Error', 'Debe seleccionar un responsable de salida');
      return false;
    }

    return true;
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

      const cumpleGaveta = !this.filtrosBusqueda.n_gaveta ||
        item.n_gaveta?.toLowerCase().includes(this.filtrosBusqueda.n_gaveta.toLowerCase());

      return cumpleFrasco && cumpleDonante && cumpleGaveta;
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
