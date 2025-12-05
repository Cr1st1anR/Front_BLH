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
  providers: [MessageService]
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
      await this.cargarEmpleados();
    } catch (error) {
      console.error('Error al inicializar componente:', error);
      this.mostrarMensaje('error', 'Error', 'Error al cargar datos iniciales');
    }
  }

  private cargarEmpleados(): Promise<void> {
    return new Promise((resolve) => {
      this.loading.empleados = true;

      this.seleccionClasificacionService.getEmpleados().subscribe({
        next: (response: any) => {
          if (response && response.data && Array.isArray(response.data)) {
            if (response.data.length > 0) {
              const empleados = this.transformarEmpleadosDesdeAPI(response.data);
              this.procesarEmpleadosTransformados(empleados);
            } else {
              this.opcionesProfesionales = [];
              this.opcionesAuxiliares = [];
              console.warn('No hay empleados registrados en el sistema');
            }
          } else {
            this.opcionesProfesionales = [];
            this.opcionesAuxiliares = [];
            console.warn('Respuesta de empleados inválida');
          }

          this.loading.empleados = false;
          resolve();
        },
        error: (error: any) => {
          console.error('Error al cargar empleados:', error);
          this.opcionesProfesionales = [];
          this.opcionesAuxiliares = [];
          this.loading.empleados = false;

          const mensajeError = this.extraerMensajeError(error);
          this.mostrarMensaje('warn', 'Advertencia', `No se pudieron cargar los empleados: ${mensajeError}`);

          resolve();
        }
      });
    });
  }

  // ============= TRANSFORMACIÓN DE DATOS DESDE API =============
  private transformarDatosDesdeAPI(registros: any[]): SeleccionClasificacionData[] {
    return registros.map((registro: any) => {
      const origen = this.determinarOrigenDatos(registro.controlReenvase);
      const fechaParseda = this.parsearFechaDesdeBackend(registro.fecha);

      return {
        id: registro.id,
        fecha: fechaParseda,
        gaveta_cruda: origen.gaveta?.toString() || '',
        dias_produccion: this.calcularDiasProduccion(
          registro.controlReenvase?.madreDonante?.gestacion?.fechaParto,
          origen.fechaExtraccion
        ),
        no_frasco_procesado: this.generarCodigoFrascosProcesados(registro.controlReenvase?.frascosPasteurizados || []),
        donante: registro.controlReenvase?.madreDonante?.id?.toString() || '',
        frasco_leche_cruda: this.generarCodigoFrascoCrudo(origen.frascoId),
        edad_gestacional: registro.controlReenvase?.madreDonante?.gestacion?.semanas || 0,
        volumen: origen.volumen?.toString() || '',
        nombre_profesional: registro.infoSeleccionClasificacion?.profesional?.nombre || '',
        nombre_auxiliar: registro.infoSeleccionClasificacion?.auxiliar?.nombre || '',
        n_frascos_pasteurizados: registro.infoSeleccionClasificacion?.numeroFrascosPasteurizados || 0,
        volumen_pasteurizado: registro.infoSeleccionClasificacion?.volumen?.toString() || '',
        fecha_vencimiento: this.calcularFechaVencimiento(fechaParseda),
        observaciones: registro.infoSeleccionClasificacion?.observaciones || '',
        ciclo: registro.controlReenvase?.lote?.ciclo?.numeroCiclo?.toString() || '',
        n_lote_medios_cultivo: registro.infoSeleccionClasificacion?.loteCultivos || '',
        fecha_vencimiento_cultivos: this.parsearFechaDesdeBackend(registro.infoSeleccionClasificacion?.fechaVencimientoCultivos) || null,
        lote: registro.controlReenvase?.lote?.numeroLote?.toString() || '',
        id_empleado_profesional: registro.infoSeleccionClasificacion?.profesional?.id || null,
        id_empleado_auxiliar: registro.infoSeleccionClasificacion?.auxiliar?.id || null,
        id_info_seleccion_clasificacion: registro.infoSeleccionClasificacion?.id || null
      };
    });
  }

  private determinarOrigenDatos(controlReenvase: any): any {
  const frascoIdCorrecto = controlReenvase?.frascoCrudo;

  if (!controlReenvase?.madreDonante?.entradasSalidas) {
    return {
      gaveta: null,
      fechaExtraccion: null,
      volumen: null,
      frascoId: frascoIdCorrecto || null
    };
  }

  const entradasSalidas = controlReenvase.madreDonante.entradasSalidas[0];

  if (entradasSalidas?.extraccion) {
    const extraccion = entradasSalidas.extraccion;

    return {
      gaveta: extraccion.gaveta,
      fechaExtraccion: extraccion.fechaExtraccion,
      volumen: extraccion.cantidad,
      frascoId: frascoIdCorrecto
    };
  }

  else if (entradasSalidas?.frascoRecolectado) {
    const frascoRecolectado = entradasSalidas.frascoRecolectado;

    return {
      gaveta: frascoRecolectado.gaveta,
      fechaExtraccion: frascoRecolectado.fechaDeExtraccion,
      volumen: frascoRecolectado.volumen,
      frascoId: frascoIdCorrecto
    };
  }

  return {
    gaveta: null,
    fechaExtraccion: null,
    volumen: null,
    frascoId: frascoIdCorrecto || null
  };
}

  private calcularDiasProduccion(fechaParto: string, fechaExtraccion: string): string {
    if (!fechaParto || !fechaExtraccion) return '';

    const parto = new Date(fechaParto);
    const extraccion = new Date(fechaExtraccion);

    const diferenciaMilisegundos = extraccion.getTime() - parto.getTime();
    const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 3600 * 24));

    if (diasTranscurridos < 0) return '';

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

    if (this.opcionesProfesionales.length === 0) {
      this.opcionesProfesionales = empleados;
    }
    if (this.opcionesAuxiliares.length === 0) {
      this.opcionesAuxiliares = empleados;
    }
  }

  // ============= CÁLCULOS DE FECHAS =============
  private calcularFechaVencimiento(fechaBase: Date | null): Date | null {
    if (!fechaBase || !(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) {
      return null;
    }

    const fechaVencimiento = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
    fechaVencimiento.setHours(12, 0, 0, 0);

    return fechaVencimiento;
  }

  private actualizarFechaVencimiento(rowData: SeleccionClasificacionData): void {
    if (rowData.fecha) {
      rowData.fecha_vencimiento = this.calcularFechaVencimiento(rowData.fecha as Date);
    } else {
      rowData.fecha_vencimiento = null;
    }
  }

  private parsearFechaDesdeBackend(fecha: string | Date | null): Date | null {
    if (!fecha) return null;

    if (fecha instanceof Date) {
      return fecha;
    }

    if (typeof fecha === 'string') {
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const partes = fecha.split('-');
        const year = parseInt(partes[0], 10);
        const month = parseInt(partes[1], 10) - 1;
        const day = parseInt(partes[2], 10);

        return new Date(year, month, day, 12, 0, 0, 0);
      }

      const fechaParseada = new Date(fecha);
      return isNaN(fechaParseada.getTime()) ? null : fechaParseada;
    }

    return null;
  }

  // ============= EVENTOS DE UI =============
  onFechaChanged(rowData: SeleccionClasificacionData): void {
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

    const esRegistroCompleto = this.verificarSiEsRegistroCompleto(dataRow);
    const tieneIdInfo = !!dataRow.id_info_seleccion_clasificacion;

    const tipoOperacion = (esRegistroCompleto && tieneIdInfo) ? 'actualización' : 'registro inicial';

    this.seleccionClasificacionService.putSeleccionClasificacion(dataRow.id, datosBackend).subscribe({
      next: (response) => {
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

    const esRegistroCompleto = this.verificarSiEsRegistroCompleto(dataRow);

    return {
      id: dataRow.id,
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      infoSeleccionClasificacion: this.prepararInfoSeleccionClasificacion(dataRow, esRegistroCompleto)
    };
  }

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

    if (esRegistroCompleto && dataRow.id_info_seleccion_clasificacion) {
      infoData.id = dataRow.id_info_seleccion_clasificacion;
    }

    return infoData;
  }

  private verificarSiEsRegistroCompleto(dataRow: SeleccionClasificacionData): boolean {
    const tieneIdInfo = !!dataRow.id_info_seleccion_clasificacion;
    const tieneDatos = !!(
      dataRow.nombre_profesional ||
      dataRow.nombre_auxiliar ||
      dataRow.n_frascos_pasteurizados ||
      dataRow.volumen_pasteurizado ||
      dataRow.observaciones ||
      dataRow.n_lote_medios_cultivo ||
      dataRow.fecha_vencimiento_cultivos
    );

    return tieneIdInfo && tieneDatos;
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

    const year = fechaObj.getFullYear();
    const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const day = fechaObj.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============= FUNCIONES PARA GENERAR CÓDIGOS DE FRASCOS =============

  private obtenerAñoActualCorto(): string {
    const añoCompleto = new Date().getFullYear();
    return añoCompleto.toString().slice(-2);
  }

  private generarCodigoFrascosProcesados(frascosPasteurizados: any[]): string {
    if (!frascosPasteurizados || frascosPasteurizados.length === 0) {
      return 'Sin frascos\nprocesados';
    }

    const añoActual = this.obtenerAñoActualCorto();

    const frascosSinObservaciones = frascosPasteurizados.filter(frasco => {
      const tieneNumero = frasco.numeroFrasco !== null && frasco.numeroFrasco !== undefined;
      const sinObservaciones = !frasco.observaciones || frasco.observaciones.trim() === '';

      return tieneNumero && sinObservaciones;
    });

    if (frascosSinObservaciones.length === 0) {
      return 'Frascos con\nobservaciones';
    }

    const numerosFrascos = frascosSinObservaciones
      .map(frasco => frasco.numeroFrasco)
      .sort((a, b) => a - b);

    if (numerosFrascos.length === 1) {
      const resultado = `LHP ${añoActual}\n${numerosFrascos[0]}`;
      return resultado;
    } else {
      const frascoInicial = numerosFrascos[0];
      const frascoFinal = numerosFrascos[numerosFrascos.length - 1];
      const resultado = `LHP ${añoActual}\n${frascoInicial} -\n${frascoFinal}`;
      return resultado;
    }
  }

  private generarCodigoFrascoCrudo(idFrasco: number | null): string {
    if (!idFrasco) {
      return '';
    }

    const añoActual = this.obtenerAñoActualCorto();
    return `LHC ${añoActual}\n${idFrasco}`;
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

  // ============= UTILIDADES PARA FORMATEO =============

  formatearCodigoFrasco(codigo: string): string {
    if (!codigo) {
      return '<span class="text-gray-400 italic text-xs">Sin datos</span>';
    }

    if (codigo.includes('Sin frascos')) {
      return `<span class="text-gray-500 italic text-xs">${codigo.replace(/\n/g, '<br>')}</span>`;
    }

    if (codigo.includes('observaciones')) {
      return `<span class="text-orange-500 italic text-xs">${codigo.replace(/\n/g, '<br>')}</span>`;
    }

    if (codigo.startsWith('LHP')) {
      return `<span class="text-blue-600 font-medium text-xs">${codigo.replace(/\n/g, '<br>')}</span>`;
    }

    if (codigo.startsWith('LHC')) {
      return `<span class="text-green-600 font-medium text-xs">${codigo.replace(/\n/g, '<br>')}</span>`;
    }

    return codigo.replace(/\n/g, '<br>');
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
    const editableColumns = [
      'fecha',
      'nombre_profesional',
      'nombre_auxiliar',
      'observaciones',
      'n_lote_medios_cultivo',
      'fecha_vencimiento_cultivos'
    ];
    return editableColumns.includes(field);
  }

  // ============= FILTROS =============
  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;

    if (filtro) {
      this.loading.main = true;
      this.seleccionClasificacionService
        .getSeleccionClasificacionPorMesYAnio(filtro.month, filtro.year)
        .subscribe({
          next: (response: any) => {
            if (response && response.data && Array.isArray(response.data)) {
              if (response.data.length > 0) {
                this.dataOriginal = this.transformarDatosDesdeAPI(response.data);
                this.mostrarMensajeExitosoCarga(true);
              } else {
                this.dataOriginal = [];
                this.mostrarMensajeExitosoCarga(false);
              }
            } else {
              this.dataOriginal = [];
              this.mostrarMensajeExitosoCarga(false);
            }

            this.aplicarFiltros();
            this.loading.main = false;
            this.mostrarNotificacionFiltro();
          },
          error: (error: any) => {
            console.error('Error al filtrar por fecha:', error);
            this.dataOriginal = [];
            this.aplicarFiltros();
            this.loading.main = false;

            const mensajeError = this.extraerMensajeError(error);
            this.mostrarMensaje('error', 'Error', `Error al cargar datos: ${mensajeError}`);
          }
        });
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

    if (this.filtroFecha) {
      const nombreMes = this.mesesDelAno[this.filtroFecha.month - 1];

      const hayFiltrosBusqueda = Object.values(this.filtrosBusqueda).some(filtro => filtro.trim() !== '');

      if (hayFiltrosBusqueda) {
        const mensaje = cantidad > 0
          ? `${cantidad} registro${cantidad > 1 ? 's' : ''} encontrado${cantidad > 1 ? 's' : ''} después de aplicar filtros`
          : `No se encontraron registros que coincidan con los filtros aplicados`;

        this.mostrarMensaje(cantidad > 0 ? 'info' : 'warn', 'Filtros aplicados', mensaje);
      }
    }
  }

  // ============= MENSAJES =============
  private mostrarMensajeExitosoCarga(hayDatos: boolean): void {
    if (!this.filtroFecha) return;

    const nombreMes = this.mesesDelAno[this.filtroFecha.month - 1];
    const cantidad = this.dataOriginal.length;

    if (hayDatos) {
      const mensaje = `${cantidad} registro${cantidad > 1 ? 's' : ''} cargado${cantidad > 1 ? 's' : ''} para ${nombreMes} ${this.filtroFecha.year}`;
      this.mostrarMensaje('success', 'Datos cargados', mensaje);
    } else {
      const mensaje = `No hay registros de selección y clasificación para ${nombreMes} ${this.filtroFecha.year}`;
      this.mostrarMensaje('info', 'Sin datos', mensaje);
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
