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
import { ControlTemperaturaService } from '../../services/control-temperatura.service';
import type {
  ControlTemperaturaData,
  ResponsableOption,
  FiltroFecha,
  FiltrosBusqueda,
  TipoMensaje,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion,
  LoadingState,
  TableColumn,
  TipoDialog,
  LoteOption,
  ControlTemperaturaBackendResponse
} from '../../interfaces/control-temperatura.interface';

@Component({
  selector: 'control-temperatura-table',
  imports: [
    TableModule, CommonModule, ProgressSpinnerModule, ToastModule,
    FormsModule, ButtonModule, InputTextModule, DatePickerModule,
    SelectModule, TooltipModule, HttpClientModule
  ],
  templateUrl: './control-temperatura-table.component.html',
  styleUrl: './control-temperatura-table.component.scss',
  providers: [MessageService]
})
export class ControlTemperaturaTableComponent implements OnInit {

  @ViewChild('tableControlTemperatura') table!: Table;
  @Output() eyeClicked = new EventEmitter<{ tipo: TipoDialog; data: ControlTemperaturaData }>();

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    lote: '',
    ciclo: ''
  };


  readonly loading: LoadingState = {
    main: false,
    empleados: false,
    lotes: false
  };

  editingRow: ControlTemperaturaData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, ControlTemperaturaData> = {};
  tempIdCounter = -1;

  dataOriginal: ControlTemperaturaData[] = [];
  dataFiltered: ControlTemperaturaData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesResponsables: ResponsableOption[] = [];
  opcionesLotes: LoteOption[] = [];

  headersControlTemperatura: TableColumn[] = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'LOTE', field: 'lote', width: '120px', tipo: 'text' },
    { header: 'CICLO', field: 'ciclo', width: '100px', tipo: 'text' },
    { header: 'HORA\nINICIO', field: 'horaInicio', width: '120px', tipo: 'time' },
    { header: 'CALENTAMIENTO - VARIACIÓN DE\nTEMPERATURA (ºC) (BAÑO MARIA)', field: 'calentamiento', width: '200px', tipo: 'button' },
    { header: 'ENFRIAMIENTO - VARIACION DE\nTEMPERATURA (ºC) (ENFRIADOR)', field: 'enfriamiento', width: '200px', tipo: 'button' },
    { header: 'HORA\nFINALIZACIÓN', field: 'horaFinalizacion', width: '120px', tipo: 'time' },
    { header: 'OBSERVACIONES', field: 'observaciones', width: '200px', tipo: 'text' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'select' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  get dataControlTemperatura(): ControlTemperaturaData[] {
    return this.dataFiltered;
  }

  constructor(
    private readonly controlTemperaturaService: ControlTemperaturaService,
    private readonly messageService: MessageService
  ) {

  }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ============= INICIALIZACIÓN =============

  private async inicializarComponente(): Promise<void> {
    try {
      await Promise.all([
        this.cargarEmpleados(),
        this.cargarLotes(),
        this.cargarDatosControlTemperatura()
      ]);
    } catch (error) {
      console.error('Error al inicializar componente:', error);
      this.mostrarMensaje('error', 'Error de inicialización', 'Error al cargar datos iniciales');
    }
  }

  // ============= CARGA DE DATOS =============

  private cargarEmpleados(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.empleados = true;

      this.controlTemperaturaService.getEmpleados().subscribe({
        next: (empleados) => {
          this.opcionesResponsables = empleados;
          this.loading.empleados = false;
          resolve();
        },
        error: (error) => {
          this.loading.empleados = false;
          console.error('Error al cargar empleados:', error);
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los empleados');
          reject(error);
        }
      });
    });
  }

  private cargarLotes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.lotes = true;

      this.controlTemperaturaService.getLotes().subscribe({
        next: (lotes) => {
          this.opcionesLotes = lotes;
          this.loading.lotes = false;
          resolve();
        },
        error: (error) => {
          this.loading.lotes = false;
          console.error('Error al cargar lotes:', error);
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los lotes');
          reject(error);
        }
      });
    });
  }

  private cargarDatosControlTemperatura(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.main = true;

      this.controlTemperaturaService.getAllControlTemperatura().subscribe({
        next: (registros: ControlTemperaturaBackendResponse[]) => {
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

  private transformarDatosBackend(registros: ControlTemperaturaBackendResponse[]): ControlTemperaturaData[] {
  return registros.map((registro: ControlTemperaturaBackendResponse) => {
    const data: ControlTemperaturaData = {
      id: registro.id,
      fecha: this.parsearFechaDesdeBackend(registro.fecha),
      lote: `LT-${registro.lote.numeroLote.toString().padStart(3, '0')}`,
      ciclo: `C${registro.ciclo.numeroCiclo}`,
      horaInicio: registro.hora_inicio,
      horaFinalizacion: registro.hora_finalizacio,
      observaciones: registro.observaciones || '',
      responsable: registro.responsable.nombre,
      empleado_info: {
        id: registro.responsable.id,
        nombre: registro.responsable.nombre,
        cargo: registro.responsable.cargo,
        telefono: registro.responsable.telefono,
        correo: registro.responsable.correo
      },
      id_empleado: registro.responsable.id,
      horaInicio_aux: null,
      horaFinalizacion_aux: null,
      // Agregar información original para las actualizaciones
      loteOriginal: registro.lote,
      cicloOriginal: registro.ciclo
    };

    // Inicializar campos auxiliares de hora
    if (data.horaInicio) {
      data.horaInicio_aux = this.convertirHoraADate(data.horaInicio);
    }
    if (data.horaFinalizacion) {
      data.horaFinalizacion_aux = this.convertirHoraADate(data.horaFinalizacion);
    }

    return data;
  });
}

  // ============= UTILIDADES =============

  /**
 * Convierte una hora en formato string (HH:MM) a objeto Date
 */
  private convertirHoraADate(hora: string): Date | null {
    if (!hora) return null;

    const [horas, minutos] = hora.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return null;

    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  /**
   * Convierte un objeto Date a formato de hora (HH:MM)
   */
  private convertirDateAHora(fecha: Date | null): string {
    if (!fecha) return '';

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  /**
   * Procesa las horas auxiliares y actualiza los campos correspondientes
   */
  private procesarHorasAuxiliares(rowData: ControlTemperaturaData): void {
    if (rowData.horaInicio_aux) {
      rowData.horaInicio = this.convertirDateAHora(rowData.horaInicio_aux);
    }

    if (rowData.horaFinalizacion_aux) {
      rowData.horaFinalizacion = this.convertirDateAHora(rowData.horaFinalizacion_aux);
    }
  }

  /**
   * Inicializa los campos auxiliares necesarios para la edición
   */
  private inicializarCamposAuxiliares(rowData: ControlTemperaturaData): void {
    if (rowData.horaInicio && !rowData.horaInicio_aux) {
      rowData.horaInicio_aux = this.convertirHoraADate(rowData.horaInicio);
    }

    if (rowData.horaFinalizacion && !rowData.horaFinalizacion_aux) {
      rowData.horaFinalizacion_aux = this.convertirHoraADate(rowData.horaFinalizacion);
    }
  }

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

  onLoteSeleccionado(event: any, rowData: ControlTemperaturaData): void {
    const loteSeleccionado = this.extraerValorEvento(event);
    if (!loteSeleccionado) return;

    // Buscar la información completa del lote
    const loteInfo = this.opcionesLotes.find(lote => lote.value === loteSeleccionado);
    if (loteInfo) {
      rowData.lote = loteInfo.value;
      rowData.ciclo = loteInfo.ciclo; // Asignar automáticamente el ciclo
    }
  }

  onResponsableSeleccionado(event: any, rowData: ControlTemperaturaData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.responsable = responsable;

    const empleadoSeleccionado = this.opcionesResponsables.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      (rowData as any).id_empleado = empleadoSeleccionado.id_empleado;
    }
  }

  onVerCalentamiento(rowData: ControlTemperaturaData, event: MouseEvent): void {
    this.onEyeClick('calentamiento', rowData, event);
  }

  onVerEnfriamiento(rowData: ControlTemperaturaData, event: MouseEvent): void {
    this.onEyeClick('enfriamiento', rowData, event);
  }


  private onEyeClick(tipo: TipoDialog, rowData: ControlTemperaturaData, event: MouseEvent): void {
    event.stopPropagation();

    // Validar que haya edición en curso
    if (this.isAnyRowEditing()) {
      return;
    }

    // Validar que el registro esté guardado
    if (!rowData.id) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar el registro antes de ver los detalles');
      return;
    }

    // Emitir el evento con el tipo y los datos
    this.eyeClicked.emit({ tipo, data: rowData });
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

  private crearRegistroVacio(): ControlTemperaturaData {
    return {
      id: null,
      fecha: new Date(),
      lote: '',
      ciclo: '',
      horaInicio: '',
      horaFinalizacion: '',
      observaciones: '',
      responsable: '',
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true,
      horaInicio_aux: null,
      horaFinalizacion_aux: null
    };
  }

  private agregarRegistroATabla(registro: ControlTemperaturaData): void {
    this.dataOriginal.push(registro);
    this.dataFiltered.push(registro);
    this.dataFiltered = [...this.dataFiltered];
  }

  private iniciarEdicionRegistro(registro: ControlTemperaturaData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = registro;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  onRowEditInit(dataRow: ControlTemperaturaData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.inicializarCamposAuxiliares(dataRow); // Inicializar campos auxiliares
    this.editingRow = dataRow;

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
  }

  onRowEditSave(dataRow: ControlTemperaturaData, index: number, event: MouseEvent): void {
    // Procesar las horas auxiliares antes de validar
    this.procesarHorasAuxiliares(dataRow);

    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (!this.validarHoras(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'La hora de finalización debe ser posterior a la hora de inicio');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: ControlTemperaturaData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: ControlTemperaturaData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaCreacion(dataRow);
    if (!datosBackend) return;

    this.controlTemperaturaService.postControlTemperatura(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response, dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar el registro');
      }
    });
  }

  private actualizarRegistroExistente(dataRow: ControlTemperaturaData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaActualizacion(dataRow);
    if (!datosBackend) return;

this.controlTemperaturaService.putControlTemperatura(dataRow.id!, datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el registro');
      }
    });
  }

  private prepararDatosParaCreacion(dataRow: ControlTemperaturaData): DatosBackendParaCreacion | null {
  if (!this.validarDatosBasicos(dataRow)) return null;

  // Buscar los IDs reales del lote y ciclo
  const loteInfo = this.opcionesLotes.find(lote => lote.value === dataRow.lote);
  if (!loteInfo) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del lote seleccionado');
    return null;
  }

  // Para obtener el ID del ciclo, necesitamos buscarlo por número de ciclo
  const cicloId = this.obtenerIdCicloPorNumero(loteInfo.numeroCiclo);
  if (!cicloId) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del ciclo');
    return null;
  }

  // Para obtener el ID del lote, necesitamos buscarlo por número de lote
  const loteId = this.obtenerIdLotePorNumero(loteInfo.numeroLote);
  if (!loteId) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del lote');
    return null;
  }

  const empleado = this.opcionesResponsables.find(emp => emp.value === dataRow.responsable);
  if (!empleado?.id_empleado) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del empleado seleccionado');
    return null;
  }

  return {
    fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
    loteId: { id: loteId },
    cicloId: { id: cicloId },
    hora_inicio: dataRow.horaInicio,
    hora_finalizacio: dataRow.horaFinalizacion,
    responsableId: { id: empleado.id_empleado },
    observaciones: dataRow.observaciones || ''
  };
}

  private prepararDatosParaActualizacion(dataRow: ControlTemperaturaData): DatosBackendParaActualizacion | null {
  if (!dataRow.id || !this.validarDatosBasicos(dataRow)) return null;

  // Buscar los IDs reales del lote y ciclo (mismo proceso que en creación)
  const loteInfo = this.opcionesLotes.find(lote => lote.value === dataRow.lote);
  if (!loteInfo) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del lote seleccionado');
    return null;
  }

  const cicloId = this.obtenerIdCicloPorNumero(loteInfo.numeroCiclo);
  if (!cicloId) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del ciclo');
    return null;
  }

  const loteId = this.obtenerIdLotePorNumero(loteInfo.numeroLote);
  if (!loteId) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del lote');
    return null;
  }

  const empleado = this.opcionesResponsables.find(emp => emp.value === dataRow.responsable);
  if (!empleado?.id_empleado) {
    this.mostrarMensaje('error', 'Error', 'No se encontró información del empleado seleccionado');
    return null;
  }

  return {
    fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
    loteId: { id: loteId },
    cicloId: { id: cicloId },
    hora_inicio: dataRow.horaInicio,
    hora_finalizacio: dataRow.horaFinalizacion,
    responsableId: { id: empleado.id_empleado },
    observaciones: dataRow.observaciones || ''
  };
}

private obtenerIdLotePorNumero(numeroLote: number): number | null {
  // Para registros existentes, usar la información original
  if (this.editingRow && !this.editingRow.isNew && this.editingRow.loteOriginal) {
    return this.editingRow.loteOriginal.id;
  }

  // Para nuevos registros, buscar en las opciones disponibles o usar lógica de mapeo
  // Por ahora, usar un mapeo basado en el número de lote conocido
  const mapeoLotes: { [key: number]: number } = {
    1: 6  // lote 1 tiene id 6 según tu ejemplo
  };

  return mapeoLotes[numeroLote] || null;
}

private obtenerIdCicloPorNumero(numeroCiclo: number): number | null {
  // Para registros existentes, usar la información original
  if (this.editingRow && !this.editingRow.isNew && this.editingRow.cicloOriginal) {
    return this.editingRow.cicloOriginal.id;
  }

  // Para nuevos registros, buscar en las opciones disponibles o usar lógica de mapeo
  const mapeoCiclos: { [key: number]: number } = {
    1: 6  // ciclo 1 tiene id 6 según tu ejemplo
  };

  return mapeoCiclos[numeroCiclo] || null;
}

  // ============= VALIDACIONES =============

  private validarCamposRequeridos(dataRow: ControlTemperaturaData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.lote?.trim() &&
      dataRow.ciclo?.trim() &&
      dataRow.horaInicio?.trim() &&
      dataRow.horaFinalizacion?.trim() &&
      dataRow.responsable?.trim()
    );
  }

  private validarHoras(dataRow: ControlTemperaturaData): boolean {
    if (!dataRow.horaInicio || !dataRow.horaFinalizacion) return false;

    const [horaIni, minIni] = dataRow.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = dataRow.horaFinalizacion.split(':').map(Number);

    const minutosInicio = horaIni * 60 + minIni;
    const minutosFin = horaFin * 60 + minFin;

    return minutosFin > minutosInicio;
  }

  private validarDatosBasicos(dataRow: ControlTemperaturaData): boolean {
    return this.validarCamposRequeridos(dataRow);
  }

  // ============= ESTADOS DE EDICIÓN =============

  private guardarEstadoOriginal(dataRow: ControlTemperaturaData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: ControlTemperaturaData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataFiltered[index] = this.clonedData[rowId];
    delete this.clonedData[rowId];
  }

  private eliminarRegistroTemporal(dataRow: ControlTemperaturaData): void {
    const predicate = (item: ControlTemperaturaData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const originalIndex = this.dataOriginal.findIndex(predicate);
    if (originalIndex !== -1) this.dataOriginal.splice(originalIndex, 1);

    const filteredIndex = this.dataFiltered.findIndex(predicate);
    if (filteredIndex !== -1) {
      this.dataFiltered.splice(filteredIndex, 1);
      this.dataFiltered = [...this.dataFiltered];
    }
  }

  private procesarRespuestaCreacion(response: any, dataRow: ControlTemperaturaData, rowElement: HTMLTableRowElement): void {
    if (response.data?.id) dataRow.id = response.data.id;

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

  private procesarRespuestaActualizacion(dataRow: ControlTemperaturaData, rowElement: HTMLTableRowElement): void {
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

  isCampoEditable(campo: string, rowData: ControlTemperaturaData): boolean {
    // El ciclo nunca es editable
    if (campo === 'ciclo') return false;

    // El lote solo es editable en registros nuevos
    if (campo === 'lote') {
      return rowData.isNew === true;
    }

    return true;
  }

  isEditing(rowData: ControlTemperaturaData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: ControlTemperaturaData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private getRowId(dataRow: ControlTemperaturaData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= FILTROS =============

  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
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

  private aplicarFiltrosBusquedaTexto(datos: ControlTemperaturaData[]): ControlTemperaturaData[] {
    return datos.filter(item => {
      const cumpleLote = !this.filtrosBusqueda.lote ||
        item.lote?.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      const cumpleCiclo = !this.filtrosBusqueda.ciclo ||
        item.ciclo?.toLowerCase().includes(this.filtrosBusqueda.ciclo.toLowerCase());

      return cumpleLote && cumpleCiclo;
    });
  }

  private filtrarPorMesYAno(datos: ControlTemperaturaData[], filtro: FiltroFecha): ControlTemperaturaData[] {
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
      ? `${cantidad} registro${cantidad > 1 ? 's' : ''} de control de temperatura cargado${cantidad > 1 ? 's' : ''}`
      : 'No se encontraron registros de control de temperatura en la base de datos';

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
