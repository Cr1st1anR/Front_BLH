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
import {
  SeleccionClasificacionData,
  LoadingState,
  TableColumn,
  ResponsableOption,
  FiltroFecha,
  FiltrosBusqueda,
  TipoMensaje,
  TipoDialog
} from '../../interfaces/seleccion-clasificacion.interface';
import { SeleccionClasificacionService } from '../../services/seleccion-clasificacion.service';

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
    frasco_leche_cruda: ''
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
    { header: 'FECHA DE\nVENCIMIENTO', field: 'fecha_vencimiento', width: '150px', tipo: 'date', vertical: false },
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
        next: (empleados) => {
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

          this.loading.empleados = false;
          resolve();
        },
        error: (error) => {
          this.loading.empleados = false;
          console.error('Error al cargar empleados:', error);
          this.cargarEmpleadosFallback();
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los empleados');
          reject(error);
        }
      });
    });
  }

  private cargarDatosSeleccionClasificacion(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.main = true;

      this.seleccionClasificacionService.getAllSeleccionClasificacion().subscribe({
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

  private cargarEmpleadosFallback(): void {
    this.opcionesProfesionales = [
      { label: 'Dr. Juan López', value: 'Dr. Juan López', id_empleado: 1 },
      { label: 'Dra. María Fernández', value: 'Dra. María Fernández', id_empleado: 2 }
    ];
    this.opcionesAuxiliares = [
      { label: 'Ana García', value: 'Ana García', id_empleado: 3 },
      { label: 'Pedro Sánchez', value: 'Pedro Sánchez', id_empleado: 4 }
    ];
  }

  // ============= TRANSFORMACIÓN DE DATOS =============
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
      fecha_vencimiento: this.parsearFechaDesdeBackend(registro.fecha_vencimiento || registro.fechaVencimiento),
      observaciones: registro.observaciones,
      ciclo: registro.ciclo,
      n_lote_medios_cultivo: registro.n_lote_medios_cultivo || registro.nLoteMediosCultivo,
      fecha_vencimiento_cultivos: this.parsearFechaDesdeBackend(registro.fecha_vencimiento_cultivos || registro.fechaVencimientoCultivos),
      lote: registro.lote,
      id_empleado_profesional: registro.id_empleado_profesional || registro.idEmpleadoProfesional,
      id_empleado_auxiliar: registro.id_empleado_auxiliar || registro.idEmpleadoAuxiliar
    }));
  }

  private parsearFechaDesdeBackend(fechaString: string | Date | null): Date | null {
    if (!fechaString) return null;

    // Si ya es un Date, retornarlo
    if (fechaString instanceof Date) return fechaString;

    // Si tiene hora (ISO 8601), quitarla
    let fechaSoloDate = fechaString;
    if (fechaString.includes('T')) {
      fechaSoloDate = fechaString.split('T')[0];
    }

    // Parsear YYYY-MM-DD
    const partes = fechaSoloDate.split('-');
    if (partes.length !== 3) return null;

    const year = parseInt(partes[0], 10);
    const month = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
    const day = parseInt(partes[2], 10);

    // Crear fecha con hora fija a las 12:00 para evitar problemas de zona horaria
    return new Date(year, month, day, 12, 0, 0, 0);
  }

  // ============= EVENTOS DE UI =============
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
    if (!datosBackend) {
      this.loading.main = false;
      return;
    }

    this.seleccionClasificacionService.putSeleccionClasificacion(datosBackend).subscribe({
      next: () => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.loading.main = false;
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el registro');
      }
    });
  }

  private prepararDatosParaActualizacion(dataRow: SeleccionClasificacionData): any {
    if (!dataRow.id) return null;

    return {
      id: dataRow.id,
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      gavetaCruda: dataRow.gaveta_cruda,
      diasProduccion: dataRow.dias_produccion,
      noFrascoProcesado: dataRow.no_frasco_procesado,
      donante: dataRow.donante,
      frascoLecheCruda: dataRow.frasco_leche_cruda,
      edadGestacional: dataRow.edad_gestacional,
      volumen: dataRow.volumen,
      idEmpleadoProfesional: dataRow.id_empleado_profesional,
      idEmpleadoAuxiliar: dataRow.id_empleado_auxiliar,
      nFrascosPasteurizados: dataRow.n_frascos_pasteurizados,
      volumenPasteurizado: dataRow.volumen_pasteurizado,
      fechaVencimiento: this.formatearFechaParaAPI(dataRow.fecha_vencimiento as Date),
      observaciones: dataRow.observaciones,
      ciclo: dataRow.ciclo,
      nLoteMediosCultivo: dataRow.n_lote_medios_cultivo,
      fechaVencimientoCultivos: this.formatearFechaParaAPI(dataRow.fecha_vencimiento_cultivos as Date),
      lote: dataRow.lote
    };
  }

  private formatearFechaParaAPI(fecha: Date | null): string {
    if (!fecha || !(fecha instanceof Date)) return '';

    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');

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

  private procesarRespuestaActualizacion(dataRow: SeleccionClasificacionData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;
    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado exitosamente');
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
    // Solo las columnas horizontales son editables
    const header = this.headersSeleccionClasificacion.find(h => h.field === field);
    return header ? !header.vertical : false;
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

  private aplicarFiltrosBusquedaTexto(datos: SeleccionClasificacionData[]): SeleccionClasificacionData[] {
    return datos.filter(item => {
      const cumpleFrascoProcesado = !this.filtrosBusqueda.no_frasco_procesado ||
        item.no_frasco_procesado?.toLowerCase().includes(this.filtrosBusqueda.no_frasco_procesado.toLowerCase());

      const cumpleDonante = !this.filtrosBusqueda.donante ||
        item.donante?.toLowerCase().includes(this.filtrosBusqueda.donante.toLowerCase());

      const cumpleFrascoCrudo = !this.filtrosBusqueda.frasco_leche_cruda ||
        item.frasco_leche_cruda?.toLowerCase().includes(this.filtrosBusqueda.frasco_leche_cruda.toLowerCase());

      return cumpleFrascoProcesado && cumpleDonante && cumpleFrascoCrudo;
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
