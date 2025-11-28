import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
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

// Corregir las rutas de importación
import { SeleccionClasificacionService } from '../../services/seleccion-clasificacion.service';
import type {
  SeleccionClasificacionData,
  LoadingState,
  TableColumn,
  ResponsableOption,
  FiltroFecha,
  FiltrosBusqueda,
  TipoDialog,
  TipoMensaje
} from '../../interfaces/seleccion-clasificacion.interface';

@Component({
  selector: 'seleccion-clasificacion-table',
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
  templateUrl: './seleccion-clasificacion-table.component.html',
  styleUrl: './seleccion-clasificacion-table.component.scss',
  providers: [MessageService, SeleccionClasificacionService] // Agregar el servicio en providers
})
export class SeleccionClasificacionTableComponent implements OnInit {

  @ViewChild('tableSeleccionClasificacion') table!: Table;
  @Output() eyeClicked = new EventEmitter<{ tipo: TipoDialog; data: SeleccionClasificacionData }>();

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    no_frasco_procesado: '',
    donante: '',
    frasco_leche_cruda: '',
    ciclo: '',
    lote: ''
  };

  readonly loading: LoadingState = {
    main: false,
    donantes: false,
    frascos: false,
    empleados: false
  };

  editingRow: SeleccionClasificacionData | null = null;
  clonedData: Record<string, SeleccionClasificacionData> = {};

  dataOriginal: SeleccionClasificacionData[] = [];
  dataFiltered: SeleccionClasificacionData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesProfesionales: ResponsableOption[] = [];
  opcionesAuxiliares: ResponsableOption[] = [];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  headersSeleccionClasificacion: TableColumn[] = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date', vertical: false },
    { header: 'GAVETA\nCRUDA', field: 'gaveta_cruda', width: '90px', tipo: 'text', vertical: true },
    { header: 'DIAS DE\nPRODUCCIÓN', field: 'dias_produccion', width: '90px', tipo: 'string', vertical: true },
    { header: 'N° FRASCO\nPROCESADO', field: 'no_frasco_procesado', width: '90px', tipo: 'text', vertical: true },
    { header: 'DONANTE', field: 'donante', width: '90px', tipo: 'text', vertical: true },
    { header: 'FRASCO LECHE\nCRUDA', field: 'frasco_leche_cruda', width: '90px', tipo: 'text', vertical: true },
    { header: 'EDAD\nGESTACIONAL', field: 'edad_gestacional', width: '90px', tipo: 'number', vertical: true },
    { header: 'VOLUMEN', field: 'volumen', width: '90px', tipo: 'text', vertical: true },
    { header: 'ANALISIS\nSENSORIAL', field: 'analisis_sensorial', width: '90px', tipo: 'eye', vertical: true },
    { header: 'ACIDEZ\nDORNIC (°D)', field: 'acidez_dornic', width: '90px', tipo: 'eye', vertical: true },
    { header: 'CREMATOCRITO\n(KCAL/L)', field: 'crematocrito', width: '90px', tipo: 'eye', vertical: true },
    { header: 'NOMBRE DEL\nPROFESIONAL', field: 'nombre_profesional', width: '200px', tipo: 'select', vertical: false },
    { header: 'NOMBRE DE\nAUXILIAR', field: 'nombre_auxiliar', width: '200px', tipo: 'select', vertical: false },
    { header: 'N. FRASCOS\nPASTEURIZADOS', field: 'n_frascos_pasteurizados', width: '150px', tipo: 'number', vertical: false },
    { header: 'VOLUMEN', field: 'volumen_pasteurizado', width: '120px', tipo: 'text', vertical: false },
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '150px', tipo: 'readonly_date', vertical: false },
    { header: 'OBSERVACIONES', field: 'observaciones', width: '200px', tipo: 'text', vertical: false },
    { header: 'CICLO', field: 'ciclo', width: '100px', tipo: 'text', vertical: false },
    { header: 'N LOTE DE LOS MEDIOS\nDE CULTIVO', field: 'n_lote_medios_cultivo', width: '220px', tipo: 'text', vertical: false },
    { header: 'FECHA DE VENCIMIENTO\nDE LOS CULTIVOS', field: 'fecha_vencimiento_cultivos', width: '220px', tipo: 'date', vertical: false },
    { header: 'LOTE', field: 'lote', width: '100px', tipo: 'text', vertical: false },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions', vertical: false }
  ];

  get dataSeleccionClasificacion(): SeleccionClasificacionData[] {
    return this.dataFiltered;
  }

  constructor(
    private readonly seleccionClasificacionService: SeleccionClasificacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  // ============= INICIALIZACIÓN =============
  private async inicializarComponente(): Promise<void> {
    try {
      await Promise.all([
        this.cargarEmpleados(),
        this.cargarDatosSeleccionClasificacion()
      ]);
    } catch (error) {
      console.error('Error al inicializar componente:', error);
      this.mostrarMensaje('error', 'Error', 'Error al cargar datos iniciales');
    }
  }

  private cargarEmpleados(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.empleados = true;

      this.seleccionClasificacionService.getEmpleados().subscribe({
        next: (response: any) => {
          const empleados = this.transformarEmpleadosDesdeAPI(response.data);
          this.procesarEmpleadosTransformados(empleados);
          this.loading.empleados = false;
          resolve();
        },
        error: (error: any) => {
          this.loading.empleados = false;
          console.error('Error al cargar empleados:', error);
          this.cargarEmpleadosFallback();
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los empleados');
          reject(error);
        }
      });
    });
  }

  private cargarEmpleadosFallback(): void {
    console.warn('Cargando empleados de fallback (mock)...');
    this.seleccionClasificacionService.getEmpleadosMock().subscribe({
      next: (empleados: any) => {
        this.procesarEmpleadosTransformados(empleados);
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los empleados');
      }
    });
  }

  private cargarDatosSeleccionClasificacion(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.main = true;

      // Si hay filtro de fecha, usarlo; sino, usar el mes y año actuales
      const fechaFiltro = this.filtroFecha || {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      };

      this.seleccionClasificacionService
        .getSeleccionClasificacionPorMesYAnio(fechaFiltro.month, fechaFiltro.year)
        .subscribe({
          next: (response: any) => {
            if (response.data && response.data.length > 0) {
              this.dataOriginal = this.transformarDatosDesdeAPI(response.data);
              this.dataFiltered = [...this.dataOriginal];
              this.mostrarMensajeExitosoCarga();
            } else {
              this.dataOriginal = [];
              this.dataFiltered = [];
            }
            this.loading.main = false;
            resolve();
          },
          error: (error: any) => {
            console.error('Error al cargar datos de selección y clasificación:', error);
            this.loading.main = false;

            // Fallback a datos mock en caso de error
            this.cargarDatosFallback();
            reject(error);
          }
        });
    });
  }

  private cargarDatosFallback(): void {
    console.warn('Cargando datos de fallback (mock)...');
    this.seleccionClasificacionService.getAllSeleccionClasificacionMock().subscribe({
      next: (registros: any) => {
        this.dataOriginal = this.transformarDatosBackend(registros);
        this.dataFiltered = [...this.dataOriginal];
        this.mostrarMensaje('warn', 'Advertencia', 'Cargando datos de prueba. Verifique la conexión con el servidor.');
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los datos');
      }
    });
  }

  // ============= TRANSFORMACIÓN DE DATOS DESDE API =============
  private transformarDatosDesdeAPI(registros: any[]): SeleccionClasificacionData[] {
  return registros.map((registro: any) => {
    // Determinar origen de los datos (extracción o frasco recolectado)
    const origen = this.determinarOrigenDatos(registro.controlReenvase);
    const fechaParseda = this.parsearFechaDesdeBackend(registro.fecha);

    return {
      id: registro.id,
      fecha: fechaParseda,
      gaveta_cruda: origen.gaveta?.toString() || '',
      dias_produccion: this.calcularDiasProduccion(
        registro.controlReenvase.madreDonante.gestacion.fechaParto,
        origen.fechaExtraccion
      ),
      // TODO: N° FRASCO PROCESADO - Pendiente de implementar por el backend
      no_frasco_procesado: '',
      donante: registro.controlReenvase.madreDonante.id?.toString() || '',
      frasco_leche_cruda: origen.frascoId?.toString() || '',
      edad_gestacional: registro.controlReenvase.madreDonante.gestacion.semanas || 0,
      volumen: origen.volumen?.toString() || '',
      nombre_profesional: registro.infoSeleccionClasificacion?.profesional?.nombre || '',
      nombre_auxiliar: registro.infoSeleccionClasificacion?.auxiliar?.nombre || '',
      n_frascos_pasteurizados: registro.infoSeleccionClasificacion?.numeroFrascosPasteurizados || 0,
      volumen_pasteurizado: registro.infoSeleccionClasificacion?.volumen?.toString() || '',
      // CALCULAR la fecha de vencimiento basada en la fecha parseada
      fecha_vencimiento: this.calcularFechaVencimiento(fechaParseda),
      observaciones: registro.infoSeleccionClasificacion?.observaciones || '',
      ciclo: registro.controlReenvase.lote.ciclo.numeroCiclo?.toString() || '',
      n_lote_medios_cultivo: registro.infoSeleccionClasificacion?.loteCultivos || '',
      fecha_vencimiento_cultivos: this.parsearFechaDesdeBackend(registro.infoSeleccionClasificacion?.fechaVencimientoCultivos) || null,
      lote: registro.controlReenvase.lote.numeroLote?.toString() || '',
      id_empleado_profesional: registro.infoSeleccionClasificacion?.profesional?.id || null,
      id_empleado_auxiliar: registro.infoSeleccionClasificacion?.auxiliar?.id || null
    };
  });
}

  private determinarOrigenDatos(controlReenvase: any): any {
    const entradasSalidas = controlReenvase.madreDonante.entradasSalidas[0];

    if (entradasSalidas?.extraccion) {
      return {
        gaveta: entradasSalidas.extraccion.gaveta,
        fechaExtraccion: entradasSalidas.extraccion.fechaExtraccion,
        volumen: entradasSalidas.extraccion.cantidad, // Para extracción se llama 'cantidad'
        frascoId: entradasSalidas.extraccion.id
      };
    } else if (entradasSalidas?.frascoRecolectado) {
      return {
        gaveta: entradasSalidas.frascoRecolectado.gaveta,
        fechaExtraccion: entradasSalidas.frascoRecolectado.fechaExtraccion,
        volumen: entradasSalidas.frascoRecolectado.volumen, // Para frasco recolectado se llama 'volumen'
        frascoId: entradasSalidas.frascoRecolectado.id
      };
    }

    return {
      gaveta: null,
      fechaExtraccion: null,
      volumen: null,
      frascoId: null
    };
  }

  private calcularDiasProduccion(fechaParto: string, fechaExtraccion: string): string {
    if (!fechaParto || !fechaExtraccion) return '';

    const parto = new Date(fechaParto);
    const extraccion = new Date(fechaExtraccion);

    const diferenciaMilisegundos = extraccion.getTime() - parto.getTime();
    const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 3600 * 24));

    if (diasTranscurridos < 0) return '';

    // Formato amigable
    if (diasTranscurridos === 0) return '0D';
    if (diasTranscurridos < 30) return `${diasTranscurridos}D`;

    const meses = Math.floor(diasTranscurridos / 30);
    const diasRestantes = diasTranscurridos % 30;

    if (diasRestantes === 0) return `${meses}M`;
    return `${meses}M ${diasRestantes}D`;
  }

  private transformarEmpleadosDesdeAPI(empleados: any[]): ResponsableOption[] {
    return empleados.map((empleado: any) => ({
      label: empleado.nombre,
      value: empleado.nombre,
      id_empleado: empleado.id,
      cargo: empleado.cargo,
      telefono: empleado.telefono,
      correo: empleado.correo
    }));
  }

  private procesarEmpleadosTransformados(empleados: ResponsableOption[]): void {
    this.opcionesProfesionales = empleados.filter(e =>
      e.cargo?.toLowerCase().includes('médico') ||
      e.cargo?.toLowerCase().includes('profesional')
    );
    this.opcionesAuxiliares = empleados.filter(e =>
      e.cargo?.toLowerCase().includes('auxiliar')
    );

    // Si no hay empleados clasificados, usar todos
    if (this.opcionesProfesionales.length === 0) {
      this.opcionesProfesionales = empleados;
    }
    if (this.opcionesAuxiliares.length === 0) {
      this.opcionesAuxiliares = empleados;
    }
  }

  // ============= TRANSFORMACIÓN DE DATOS HEREDADA (PARA DATOS MOCK) =============
  private transformarDatosBackend(registros: any[]): SeleccionClasificacionData[] {
    return registros.map((registro: any) => ({
      id: registro.id,
      fecha: this.parsearFechaDesdeBackend(registro.fecha),
      gaveta_cruda: registro.gaveta_cruda || registro.gavetaCruda,
      dias_produccion: registro.dias_produccion || registro.diasProduccion,
      no_frasco_procesado: registro.no_frasco_procesado || registro.noFrascoProcesado,
      donante: registro.donante,
      frasco_leche_cruda: registro.frasco_leche_cruda || registro.frascoLecheCruda,
      edad_gestacional: registro.edad_gestacional || registro.edadGestacional,
      volumen: registro.volumen,
      nombre_profesional: registro.nombre_profesional || registro.nombreProfesional,
      nombre_auxiliar: registro.nombre_auxiliar || registro.nombreAuxiliar,
      n_frascos_pasteurizados: registro.n_frascos_pasteurizados || registro.nFrascosPasteurizados,
      volumen_pasteurizado: registro.volumen_pasteurizado || registro.volumenPasteurizado,
      fecha_vencimiento: this.calcularFechaVencimiento(this.parsearFechaDesdeBackend(registro.fecha)),
      observaciones: registro.observaciones,
      ciclo: registro.ciclo,
      n_lote_medios_cultivo: registro.n_lote_medios_cultivo || registro.nLoteMediosCultivo,
      fecha_vencimiento_cultivos: this.parsearFechaDesdeBackend(registro.fecha_vencimiento_cultivos || registro.fechaVencimientoCultivos),
      lote: registro.lote,
      id_empleado_profesional: registro.id_empleado_profesional || registro.idEmpleadoProfesional,
      id_empleado_auxiliar: registro.id_empleado_auxiliar || registro.idEmpleadoAuxiliar
    }));
  }

  // ============= CÁLCULOS DE FECHAS =============

  /**
   * Calcula la fecha de vencimiento (15 días después de la fecha base)
   */
  private calcularFechaVencimiento(fechaBase: Date | null): Date | null {
  if (!fechaBase || !(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) {
    return null;
  }

  // Crear nueva fecha sin modificar la original, asegurándonos de mantener la zona horaria local
  const fechaVencimiento = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());

  // Agregar 15 días
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

  // Establecer hora fija para evitar problemas de zona horaria
  fechaVencimiento.setHours(12, 0, 0, 0);

  return fechaVencimiento;
}

  /**
   * Actualiza la fecha de vencimiento cuando cambia la fecha base
   */
  private actualizarFechaVencimiento(rowData: SeleccionClasificacionData): void {
    if (rowData.fecha) {
      rowData.fecha_vencimiento = this.calcularFechaVencimiento(rowData.fecha as Date);
    } else {
      rowData.fecha_vencimiento = null;
    }
  }

  /**
 * Parser de fechas desde el backend - Sin ajuste de zona horaria
 */
private parsearFechaDesdeBackend(fecha: string | Date | null): Date | null {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return fecha;
  }

  // Si es string, parsear manteniendo la zona horaria local
  if (typeof fecha === 'string') {
    // Si la fecha viene en formato ISO (YYYY-MM-DD), tratarla como fecha local
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const partes = fecha.split('-');
      const year = parseInt(partes[0], 10);
      const month = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
      const day = parseInt(partes[2], 10);

      // Crear fecha local sin ajuste de zona horaria
      return new Date(year, month, day, 12, 0, 0, 0);
    }

    // Para otros formatos, usar el parseado normal
    const fechaParseada = new Date(fecha);
    return isNaN(fechaParseada.getTime()) ? null : fechaParseada;
  }

  return null;
}

  // ============= EVENTOS DE UI =============

  onFechaChanged(rowData: SeleccionClasificacionData): void {
    // Recalcular automáticamente la fecha de vencimiento cuando cambia la fecha base
    this.actualizarFechaVencimiento(rowData);
  }

  onProfesionalSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.nombre_profesional = responsable;

    const empleadoSeleccionado = this.opcionesProfesionales.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      rowData.id_empleado_profesional = empleadoSeleccionado.id_empleado;
    }
  }

  onAuxiliarSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.nombre_auxiliar = responsable;

    const empleadoSeleccionado = this.opcionesAuxiliares.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      rowData.id_empleado_auxiliar = empleadoSeleccionado.id_empleado;
    }
  }

  onEyeClick(tipo: TipoDialog, rowData: SeleccionClasificacionData, event: Event): void {
    event.stopPropagation();

    if (this.isAnyRowEditing()) {
      return;
    }

    this.eyeClicked.emit({ tipo, data: rowData });
  }

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: SeleccionClasificacionData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: SeleccionClasificacionData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
    this.actualizarRegistroExistente(dataRow, rowElement);
  }

  onRowEditCancel(dataRow: SeleccionClasificacionData, index: number): void {
    this.restaurarEstadoOriginal(dataRow, index);
    this.editingRow = null;
  }

  private actualizarRegistroExistente(dataRow: SeleccionClasificacionData, rowElement: HTMLTableRowElement): void {
  this.loading.main = true;

  const datosBackend = this.prepararDatosParaActualizacion(dataRow);
  if (!datosBackend || !dataRow.id) {
    this.loading.main = false;
    return;
  }

  // Determinar tipo de operación para el mensaje
  const esRegistroCompleto = this.verificarSiEsRegistroCompleto(dataRow);
  const tipoOperacion = esRegistroCompleto ? 'actualización' : 'registro inicial';

  this.seleccionClasificacionService.putSeleccionClasificacion(dataRow.id, datosBackend).subscribe({
    next: (response) => {
      console.log('Respuesta exitosa:', response);
      this.procesarRespuestaActualizacion(dataRow, rowElement, tipoOperacion);
    },
    error: (error: any) => {
      console.error('Error al procesar:', error);
      this.loading.main = false;

      const mensajeError = this.extraerMensajeError(error);
      this.mostrarMensaje('error', 'Error', `Error en ${tipoOperacion}: ${mensajeError}`);
    }
  });
}

  private prepararDatosParaActualizacion(dataRow: SeleccionClasificacionData): any {
  if (!dataRow.id) return null;

  // Determinar si es POST (crear) o PUT (actualizar) basándome en si ya existe infoSeleccionClasificacion completa
  const esRegistroCompleto = this.verificarSiEsRegistroCompleto(dataRow);

  const payload = {
    id: dataRow.id,
    fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
    infoSeleccionClasificacion: this.prepararInfoSeleccionClasificacion(dataRow, esRegistroCompleto)
  };

  console.log(`Preparando datos para ${esRegistroCompleto ? 'PUT (actualizar)' : 'POST (crear)'}:`, payload);

  return payload;
}

/**
 * Prepara la información de selección y clasificación según si es creación o actualización
 */
private prepararInfoSeleccionClasificacion(dataRow: SeleccionClasificacionData, esRegistroCompleto: boolean): any {
  const infoData: any = {
    numeroFrascosPasteurizados: dataRow.n_frascos_pasteurizados || null,
    volumen: dataRow.volumen_pasteurizado ? parseFloat(dataRow.volumen_pasteurizado) : null,
    fechaVencimiento: this.formatearFechaParaAPI(dataRow.fecha_vencimiento as Date),
    observaciones: dataRow.observaciones || null,
    loteCultivos: dataRow.n_lote_medios_cultivo || null,
    fechaVencimientoCultivos: this.formatearFechaParaAPI(dataRow.fecha_vencimiento_cultivos as Date),
    profesional: dataRow.id_empleado_profesional ? { id: dataRow.id_empleado_profesional } : null,
    auxiliar: dataRow.id_empleado_auxiliar ? { id: dataRow.id_empleado_auxiliar } : null
  };

  // Si es un registro completo (PUT), incluir el ID de infoSeleccionClasificacion
  if (esRegistroCompleto && this.tieneInfoSeleccionClasificacionExistente(dataRow)) {
    infoData.id = this.extraerIdInfoSeleccionClasificacion(dataRow);
  }
  // Para POST (registro incompleto), NO incluir el ID - se creará nuevo

  return infoData;
}

/**
 * Verifica si es un registro completo (ya tiene datos de infoSeleccionClasificacion)
 */
private verificarSiEsRegistroCompleto(dataRow: SeleccionClasificacionData): boolean {
  // Un registro está completo si ya tiene al menos uno de estos campos llenados desde el backend
  return !!(
    dataRow.nombre_profesional ||
    dataRow.nombre_auxiliar ||
    dataRow.n_frascos_pasteurizados ||
    dataRow.volumen_pasteurizado ||
    dataRow.observaciones ||
    dataRow.n_lote_medios_cultivo ||
    dataRow.fecha_vencimiento_cultivos
  );
}

/**
 * Verifica si el registro tiene información de selección clasificación existente en el backend
 */
private tieneInfoSeleccionClasificacionExistente(dataRow: SeleccionClasificacionData): boolean {
  // Si tiene datos, probablemente ya existe en el backend
  return this.verificarSiEsRegistroCompleto(dataRow);
}

/**
 * Extrae el ID de infoSeleccionClasificacion (esto lo tendremos que mejorar cuando el backend nos envíe este dato)
 */
private extraerIdInfoSeleccionClasificacion(dataRow: SeleccionClasificacionData): number | null {
  // Por ahora, asumimos que si el registro está completo, el ID de info es igual al ID principal
  // TODO: Cuando el backend envíe el ID real de infoSeleccionClasificacion, usar ese dato
  return dataRow.id || null;
}

  private formatearFechaParaAPI(fecha: Date | string | null): string | undefined {
  if (!fecha) return undefined;

  let fechaObj: Date;

  if (typeof fecha === 'string') {
    fechaObj = new Date(fecha);
  } else {
    fechaObj = fecha;
  }

  if (!(fechaObj instanceof Date) || isNaN(fechaObj.getTime())) {
    return undefined;
  }

  // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
  const year = fechaObj.getFullYear();
  const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
  const day = fechaObj.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

  // ============= VALIDACIONES =============
  private validarCamposRequeridos(dataRow: SeleccionClasificacionData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.nombre_profesional?.trim() &&
      dataRow.nombre_auxiliar?.trim()
    );
  }

  // ============= ESTADOS DE EDICIÓN =============
  private guardarEstadoOriginal(dataRow: SeleccionClasificacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: SeleccionClasificacionData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataFiltered[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaActualizacion(dataRow: SeleccionClasificacionData, rowElement: HTMLTableRowElement, tipoOperacion: string): void {
  const rowId = this.getRowId(dataRow);
  delete this.clonedData[rowId];
  this.editingRow = null;
  this.table.saveRowEdit(dataRow, rowElement);
  this.loading.main = false;

  // Mensaje específico según el tipo de operación
  const mensaje = tipoOperacion === 'registro inicial'
    ? 'Registro guardado exitosamente (primera vez)'
    : 'Registro actualizado exitosamente';

  this.mostrarMensaje('success', 'Éxito', mensaje);
}

private extraerMensajeError(error: any): string {
  if (error?.error?.message) {
    return error.error.message;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.error && typeof error.error === 'string') {
    return error.error;
  }
  return 'Error desconocido del servidor';
}

  private getRowId(dataRow: SeleccionClasificacionData): string {
    return dataRow.id?.toString() || 'unknown';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: SeleccionClasificacionData): boolean {
    return this.editingRow !== null && this.editingRow.id === rowData.id;
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  isEditButtonDisabled(rowData: SeleccionClasificacionData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  isColumnEditable(field: string): boolean {
    // Solo estas columnas específicas son editables
    const editableColumns = [
      'fecha',
      'nombre_profesional',
      'nombre_auxiliar',
      'observaciones',
      'n_lote_medios_cultivo',
      'fecha_vencimiento_cultivos'  // Esta SÍ es editable (fecha vencimiento cultivos)
    ];
    return editableColumns.includes(field);
    // fecha_vencimiento NO está en la lista porque se calcula automáticamente
  }

  // ============= FILTROS =============

  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;

    if (filtro) {
      // Cargar datos del mes y año específicos
      this.loading.main = true;
      this.seleccionClasificacionService
        .getSeleccionClasificacionPorMesYAnio(filtro.month, filtro.year)
        .subscribe({
          next: (response: any) => {
            if (response.data && response.data.length > 0) {
              this.dataOriginal = this.transformarDatosDesdeAPI(response.data);
            } else {
              this.dataOriginal = [];
            }
            this.aplicarFiltros();
            this.loading.main = false;
            this.mostrarNotificacionFiltro();
          },
          error: (error: any) => {
            console.error('Error al filtrar por fecha:', error);
            this.loading.main = false;
            this.mostrarMensaje('error', 'Error', 'Error al cargar datos del mes seleccionado');
          }
        });
    } else {
      // Sin filtro, aplicar todos los filtros existentes
      this.aplicarFiltros();
    }
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

  private aplicarFiltrosBusquedaTexto(datos: SeleccionClasificacionData[]): SeleccionClasificacionData[] {
    return datos.filter(item => {
      const cumpleFrascoProcesado = !this.filtrosBusqueda.no_frasco_procesado ||
        item.no_frasco_procesado?.toLowerCase().includes(this.filtrosBusqueda.no_frasco_procesado.toLowerCase());

      const cumpleDonante = !this.filtrosBusqueda.donante ||
        item.donante?.toLowerCase().includes(this.filtrosBusqueda.donante.toLowerCase());

      const cumpleFrascoCrudo = !this.filtrosBusqueda.frasco_leche_cruda ||
        item.frasco_leche_cruda?.toLowerCase().includes(this.filtrosBusqueda.frasco_leche_cruda.toLowerCase());

      const cumpleCiclo = !this.filtrosBusqueda.ciclo ||
        item.ciclo?.toLowerCase().includes(this.filtrosBusqueda.ciclo.toLowerCase());

      const cumpleLote = !this.filtrosBusqueda.lote ||
        item.lote?.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      return cumpleFrascoProcesado && cumpleDonante && cumpleFrascoCrudo && cumpleCiclo && cumpleLote;
    });
  }

  private filtrarPorMesYAno(datos: SeleccionClasificacionData[], filtro: FiltroFecha): SeleccionClasificacionData[] {
    return datos.filter(item => {
      if (!item.fecha) return false;

      const fechaParseada = item.fecha instanceof Date ? item.fecha : this.parsearFechaDesdeBackend(item.fecha);
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
      ? `${cantidad} registro${cantidad > 1 ? 's' : ''} de selección y clasificación cargado${cantidad > 1 ? 's' : ''}`
      : 'No se encontraron registros de selección y clasificación en la base de datos';

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
