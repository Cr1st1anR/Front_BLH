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
import { IngresoLechePasteurizadaService } from '../../services/ingreso-leche-pasteurizada.service';
import type {
  IngresoLechePasteurizadaData,
  IngresoLechePasteurizadaBackendRequest,
  IngresoLechePasteurizadaBackendResponse,
  FrascoPasteurizadoBackend,
  ApiResponseIngresoLeche,
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
    { label: 'Madura', value: 'M' },
    { label: 'Transición', value: 'T' },
    { label: 'Calostro', value: 'C' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  headersIngresoLeche: TableColumn[] = [
    { header: 'FECHA\nDISPENSACIÓN', field: 'fecha_dispensacion', width: '150px', tipo: 'readonly' },
    { header: 'N° FRASCO', field: 'n_frasco', width: '150px', tipo: 'select' },
    { header: 'N°\nDONANTE', field: 'n_donante', width: '120px', tipo: 'readonly' },
    { header: 'VOLUMEN\n(ML)', field: 'volumen', width: '120px', tipo: 'readonly' },
    { header: 'ACIDEZ\n(°D)', field: 'acidez_dornic', width: '100px', tipo: 'readonly' },
    { header: 'CALORIAS', field: 'calorias', width: '120px', tipo: 'readonly' },
    { header: 'TIPO LECHE', field: 'tipo_leche', width: '150px', tipo: 'select' },
    { header: 'LOTE', field: 'lote', width: '100px', tipo: 'readonly' },
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '150px', tipo: 'readonly_date' },
    { header: 'FECHA/HORA\nDESHIELE', field: 'fecha_hora_deshiele', width: '170px', tipo: 'readonly_date' },
    { header: 'DOSIFICACIONES', field: 'dosificaciones', width: '150px', tipo: 'eye' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  get dataIngresoLeche(): IngresoLechePasteurizadaData[] {
    return this.dataFiltered;
  }

  constructor(
    private readonly messageService: MessageService,
    private readonly ingresoLecheService: IngresoLechePasteurizadaService
  ) { }

  ngOnInit(): void {
    this.cargarFrascos();
  }

  // ============= CARGAR FRASCOS DESDE API =============
  private cargarFrascos(): void {
    this.loading.frascos = true;

    this.ingresoLecheService.getFrascosPasteurizados().subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.opcionesFrascos = this.transformarFrascosDesdeAPI(response.data);
        }
        this.loading.frascos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar frascos:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los frascos disponibles');
        this.loading.frascos = false;
      }
    });
  }

  private transformarFrascosDesdeAPI(frascos: FrascoPasteurizadoBackend[]): FrascoOption[] {
    return frascos.map((frasco: FrascoPasteurizadoBackend) => {
      const fechaControl = frasco.controlReenvase?.fecha ? new Date(frasco.controlReenvase.fecha) : null;
      const añoPasteurizacion = fechaControl?.getFullYear() || new Date().getFullYear();
      const añoCorto = añoPasteurizacion.toString().slice(-2);

      const fechaDispensacion = frasco.entradasSalidasPasteurizada?.fechaSalida ||
                                 frasco.controlReenvase?.fecha ||
                                 new Date().toISOString().split('T')[0];

      const idMadreDonante = frasco.controlReenvase?.madreDonante?.id || 0;

      return {
        label: `LHP ${añoCorto} ${frasco.numeroFrasco}`,
        value: `LHP ${añoCorto} ${frasco.numeroFrasco}`,
        id_frasco: frasco.id,
        id_madre_donante: idMadreDonante,
        n_donante: idMadreDonante.toString(),
        volumen: frasco.volumen?.toString() || '0',
        acidez_dornic: frasco.controlReenvase?.seleccionClasificacion?.acidezDornic?.resultado?.toString() || '0',
        calorias: frasco.controlReenvase?.seleccionClasificacion?.crematocrito?.kcal?.toString() || '0',
        lote: frasco.controlReenvase?.lote?.numeroLote?.toString() || '',
        año: añoPasteurizacion,
        fecha_dispensacion: fechaDispensacion
      };
    });
  }

  // ============= CARGAR DATOS DESDE API =============
  cargarDatosPorMesYAnio(mes: number, anio: number): void {
    this.loading.main = true;

    // Guardar el filtro actual
    this.filtroFecha = { month: mes, year: anio };

    this.ingresoLecheService.getIngresosPorMesYAnio(mes, anio).subscribe({
      next: (response: ApiResponseIngresoLeche) => {
        if (response?.data && Array.isArray(response.data)) {
          this.dataOriginal = this.transformarDatosDesdeAPI(response.data);
          this.dataFiltered = [...this.dataOriginal];
        } else {
          this.dataOriginal = [];
          this.dataFiltered = [];
        }
        this.loading.main = false;

        // Mostrar notificación después de cargar los datos
        this.mostrarNotificacionFiltro();
      },
      error: (error: any) => {
        console.error('Error al cargar ingresos:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los registros');
        this.dataOriginal = [];
        this.dataFiltered = [];
        this.loading.main = false;
      }
    });
  }

  private transformarDatosDesdeAPI(datos: IngresoLechePasteurizadaBackendResponse[]): IngresoLechePasteurizadaData[] {
    return datos.map((item: IngresoLechePasteurizadaBackendResponse) => {
      const fechaDispensacion = item.fechaDispensacion ? new Date(item.fechaDispensacion) : null;
      const fechaVencimiento = fechaDispensacion ? this.calcularFechaVencimiento(fechaDispensacion) : null;

      const fechaControl = item.frascoPasteurizado?.controlReenvase?.fecha ?
        new Date(item.frascoPasteurizado.controlReenvase.fecha) : null;
      const añoPasteurizacion = fechaControl?.getFullYear() || new Date().getFullYear();
      const añoCorto = añoPasteurizacion.toString().slice(-2);

      const tipoLecheLabel = this.opcionesTipoLeche.find(t => t.value === item.tipo)?.label || item.tipo;

      return {
        id: item.id,
        fecha_dispensacion: fechaDispensacion,
        n_frasco: `LHP ${añoCorto} ${item.frascoPasteurizado.numeroFrasco}`,
        id_frasco: item.frascoPasteurizado.id,
        id_madre_donante: item.madreDonante.id,
        n_donante: item.madreDonante.id.toString(),
        volumen: item.frascoPasteurizado.volumen.toString(),
        acidez_dornic: item.frascoPasteurizado.controlReenvase.seleccionClasificacion.acidezDornic.resultado.toString(),
        calorias: item.frascoPasteurizado.controlReenvase.seleccionClasificacion.crematocrito.kcal.toString(),
        tipo_leche: tipoLecheLabel,
        lote: item.frascoPasteurizado.controlReenvase.lote.numeroLote.toString(),
        fecha_vencimiento: fechaVencimiento,
        fecha_hora_deshiele: fechaDispensacion,
        isNew: false
      };
    });
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
      rowData.fecha_dispensacion = null;
      rowData.fecha_vencimiento = null;
      rowData.fecha_hora_deshiele = null;
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

      // Establecer fecha de dispensación desde el frasco
      const fechaDispensacion = new Date(frasco.fecha_dispensacion);
      rowData.fecha_dispensacion = fechaDispensacion;
      rowData.fecha_vencimiento = this.calcularFechaVencimiento(fechaDispensacion);
      rowData.fecha_hora_deshiele = new Date(fechaDispensacion);
    }
  }

  onTipoLecheSeleccionado(event: any, rowData: IngresoLechePasteurizadaData): void {
    const tipoLeche = this.extraerValorEvento(event);
    if (!tipoLeche) return;

    rowData.tipo_leche = tipoLeche;
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
    return {
      id: null,
      fecha_dispensacion: null,
      n_frasco: '',
      id_frasco: null,
      id_madre_donante: null,
      n_donante: '',
      volumen: '',
      acidez_dornic: '',
      calorias: '',
      tipo_leche: '',
      lote: '',
      fecha_vencimiento: null,
      fecha_hora_deshiele: null,
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

    const requestData = this.transformarABackendRequest(dataRow);

    this.ingresoLecheService.postIngresoLechePasteurizada(requestData).subscribe({
      next: (response: any) => {
        if (response?.data?.id) {
          dataRow.id = response.data.id;
        }
        this.procesarRespuestaCreacion(dataRow, rowElement);
      },
      error: (error: any) => {
        console.error('Error al crear registro:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudo crear el registro');
        this.loading.saving = false;
      }
    });
  }

  private actualizarRegistroExistente(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    if (!dataRow.id) {
      this.mostrarMensaje('error', 'Error', 'No se puede actualizar un registro sin ID');
      return;
    }

    this.loading.saving = true;

    const requestData = this.transformarABackendRequest(dataRow);

    this.ingresoLecheService.putIngresoLechePasteurizada(dataRow.id, requestData).subscribe({
      next: (response: any) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error: any) => {
        console.error('Error al actualizar registro:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudo actualizar el registro');
        this.loading.saving = false;
      }
    });
  }

  private transformarABackendRequest(dataRow: IngresoLechePasteurizadaData): IngresoLechePasteurizadaBackendRequest {
    // Convertir la fecha a formato YYYY-MM-DD
    let fechaDispensacion = '';
    if (dataRow.fecha_dispensacion instanceof Date) {
      fechaDispensacion = dataRow.fecha_dispensacion.toISOString().split('T')[0];
    } else if (typeof dataRow.fecha_dispensacion === 'string') {
      fechaDispensacion = dataRow.fecha_dispensacion.split('T')[0];
    }

    // Obtener el código de tipo de leche (M, T, C)
    const tipoLecheOption = this.opcionesTipoLeche.find(t => t.label === dataRow.tipo_leche);
    const tipoLeche = tipoLecheOption?.value || dataRow.tipo_leche;

    return {
      fechaDispensacion: fechaDispensacion,
      tipo: tipoLeche,
      frascoPasteurizado: { id: dataRow.id_frasco! },
      madreDonante: { id: dataRow.id_madre_donante! }
    };
  }

  // Agregar este método para recargar los datos después de guardar:
  private recargarDatos(): void {
    if (this.filtroFecha) {
      this.cargarDatosPorMesYAnio(this.filtroFecha.month, this.filtroFecha.year);
    }
  }

  // Modificar procesarRespuestaCreacion para recargar datos:
  private procesarRespuestaCreacion(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    delete dataRow._uid;

    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro creado exitosamente');

    // Recargar los datos para reflejar cambios del backend
    this.recargarDatos();
  }

  // Modificar procesarRespuestaActualizacion para recargar datos:
  private procesarRespuestaActualizacion(dataRow: IngresoLechePasteurizadaData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');

    // Recargar los datos para reflejar cambios del backend
    this.recargarDatos();
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
    // NO llamar a mostrarNotificacionFiltro() aquí porque ya se llama en cargarDatosPorMesYAnio
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

  private validarCamposRequeridos(dataRow: IngresoLechePasteurizadaData): boolean {
    return !!(
      dataRow.n_frasco?.trim() &&
      dataRow.tipo_leche?.trim() &&
      dataRow.id_frasco &&
      dataRow.id_madre_donante &&
      dataRow.fecha_dispensacion
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
      const originalIndex = this.dataOriginal.findIndex(item =>
        item.id === this.clonedData[rowId].id || item._uid === this.clonedData[rowId]._uid
      );
      if (originalIndex !== -1) {
        this.dataOriginal[originalIndex] = this.clonedData[rowId];
      }
      delete this.clonedData[rowId];
    }
  }

  private eliminarRegistroTemporal(dataRow: IngresoLechePasteurizadaData): void {
    const predicate = (item: IngresoLechePasteurizadaData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const indexFiltered = this.dataFiltered.findIndex(predicate);
    if (indexFiltered !== -1) {
      this.dataFiltered.splice(indexFiltered, 1);
      this.dataFiltered = [...this.dataFiltered];
    }

    const indexOriginal = this.dataOriginal.findIndex(predicate);
    if (indexOriginal !== -1) {
      this.dataOriginal.splice(indexOriginal, 1);
    }
  }
}
