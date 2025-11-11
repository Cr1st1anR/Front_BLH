import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import {
  SeleccionClasificacionData,
  LoadingState,
  TableColumn,
  ResponsableOption,
  DonanteOption,
  FrascoOption,
  FiltroFecha,
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
    AutoCompleteModule,
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

  readonly loading: LoadingState = {
    main: false,
    donantes: false,
    frascos: false,
    empleados: false
  };

  editingRow: SeleccionClasificacionData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, SeleccionClasificacionData> = {};
  tempIdCounter = -1;

  dataOriginal: SeleccionClasificacionData[] = [];
  dataFiltered: SeleccionClasificacionData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesProfesionales: ResponsableOption[] = [];
  opcionesAuxiliares: ResponsableOption[] = [];
  opcionesDonantes: DonanteOption[] = [];
  frascosFiltrados: FrascoOption[] = [];

  headersSeleccionClasificacion: TableColumn[] = [
  { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date', vertical: false },
  { header: 'GAVETA\nCRUDA', field: 'gaveta_cruda', width: '90px', tipo: 'text', vertical: true },
  { header: 'DIAS DE\nPRODUCCIÓN', field: 'dias_produccion', width: '90px', tipo: 'string', vertical: true },
  { header: 'N° FRASCO\nPROCESADO', field: 'no_frasco_procesado', width: '90px', tipo: 'text', vertical: true },
  { header: 'DONANTE', field: 'donante', width: '90px', tipo: 'select', vertical: true },
  { header: 'FRASCO LECHE\nCRUDA', field: 'frasco_leche_cruda', width: '90px', tipo: 'select', vertical: true },
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
    return this.filtroFecha ? this.dataFiltered : this.dataOriginal;
  }

  get loadingDonantes(): boolean {
    return this.loading.donantes;
  }

  get loadingFrascos(): boolean {
    return this.loading.frascos;
  }

  constructor(
    private readonly seleccionClasificacionService: SeleccionClasificacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // ============= INICIALIZACIÓN =============
  private cargarDatosIniciales(): void {
    this.loading.main = true;
    this.cargarTabla();
    this.cargarEmpleados();
    this.cargarDonantes();
  }

  private cargarTabla(): void {
    this.seleccionClasificacionService.getAllSeleccionClasificacion()
      .subscribe({
        next: (data: SeleccionClasificacionData[]) => {
          this.dataOriginal = data;
          this.loading.main = false;
          this.mostrarMensaje('info', 'Datos cargados correctamente');
        },
        error: (error) => {
          console.error('Error al cargar datos:', error);
          this.loading.main = false;
          this.mostrarMensaje('error', 'Error al cargar los datos');
        }
      });
  }

  private cargarEmpleados(): void {
    this.loading.empleados = true;
    this.seleccionClasificacionService.getEmpleados()
      .subscribe({
        next: (empleados: ResponsableOption[]) => {
          // Filtrar profesionales y auxiliares según cargo si existe
          this.opcionesProfesionales = empleados.filter(e =>
            e.cargo?.toLowerCase().includes('médico') ||
            e.cargo?.toLowerCase().includes('profesional')
          );
          this.opcionesAuxiliares = empleados.filter(e =>
            e.cargo?.toLowerCase().includes('auxiliar')
          );

          // Si no hay filtro por cargo, usar todos para ambos
          if (this.opcionesProfesionales.length === 0) {
            this.opcionesProfesionales = empleados;
          }
          if (this.opcionesAuxiliares.length === 0) {
            this.opcionesAuxiliares = empleados;
          }

          this.loading.empleados = false;
        },
        error: (error) => {
          console.error('Error al cargar empleados:', error);
          this.loading.empleados = false;
        }
      });
  }

  private cargarDonantes(): void {
    this.loading.donantes = true;
    this.seleccionClasificacionService.getMadresDonantes()
      .subscribe({
        next: (donantes: DonanteOption[]) => {
          this.opcionesDonantes = donantes;
          this.loading.donantes = false;
        },
        error: (error) => {
          console.error('Error al cargar donantes:', error);
          this.loading.donantes = false;
        }
      });
  }

  // ============= EVENTOS DE UI =============
  onDonanteSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    if (!event?.value) return;

    rowData.donante = event.value;
    const donanteId = this.extraerIdDonante(event.value);

    if (donanteId) {
      this.cargarFrascosPorDonante(donanteId, rowData);
    }
  }

  onFrascoSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    if (!event?.value) return;

    rowData.frasco_leche_cruda = event.value;
    const frascoSeleccionado = this.frascosFiltrados.find(f => f.value === event.value);

    if (frascoSeleccionado?.volumen) {
      rowData.volumen = frascoSeleccionado.volumen;
    }
  }

  onProfesionalSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    if (!event?.value) return;

    rowData.nombre_profesional = event.value;
    const profesional = this.opcionesProfesionales.find(p => p.value === event.value);

    if (profesional?.id_empleado) {
      rowData.id_empleado_profesional = profesional.id_empleado;
    }
  }

  onAuxiliarSeleccionado(event: any, rowData: SeleccionClasificacionData): void {
    if (!event?.value) return;

    rowData.nombre_auxiliar = event.value;
    const auxiliar = this.opcionesAuxiliares.find(a => a.value === event.value);

    if (auxiliar?.id_empleado) {
      rowData.id_empleado_auxiliar = auxiliar.id_empleado;
    }
  }

  onEyeClick(tipo: TipoDialog, rowData: SeleccionClasificacionData, event: Event): void {
    event.stopPropagation();

    if (this.isEditing(rowData)) {
      return;
    }

    this.eyeClicked.emit({ tipo, data: rowData });
  }

  // ============= CRUD OPERATIONS =============
  crearNuevoRegistro(): void {
    if (this.hasNewRowInEditing || this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Ya hay un registro en edición');
      return;
    }

    const nuevoRegistro: SeleccionClasificacionData = {
      id: this.tempIdCounter--,
      fecha: new Date(),
      gaveta_cruda: '',
      dias_produccion: '',
      no_frasco_procesado: '',
      donante: '',
      frasco_leche_cruda: '',
      edad_gestacional: 0,
      volumen: '',
      nombre_profesional: '',
      nombre_auxiliar: '',
      n_frascos_pasteurizados: 0,
      volumen_pasteurizado: '',
      fecha_vencimiento: null,
      observaciones: '',
      ciclo: '',
      n_lote_medios_cultivo: '',
      fecha_vencimiento_cultivos: null,
      lote: '',
      isNew: true,
      _uid: `new_${Date.now()}`
    };

    this.dataOriginal = [nuevoRegistro, ...this.dataOriginal];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    setTimeout(() => {
      this.table?.initRowEdit(nuevoRegistro);
    }, 0);

    this.mostrarMensaje('info', 'Nuevo registro creado. Complete los campos obligatorios.');
  }

  onRowEditInit(dataRow: SeleccionClasificacionData): void {
    this.editingRow = dataRow;

    const key = dataRow._uid || dataRow.id?.toString() || '';
    this.clonedData[key] = { ...dataRow };

    if (dataRow.donante) {
      const donanteId = this.extraerIdDonante(dataRow.donante);
      if (donanteId) {
        this.cargarFrascosPorDonante(donanteId, dataRow);
      }
    }
  }

  onRowEditSave(dataRow: SeleccionClasificacionData, index: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const rowElement = (event.target as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (!this.validarCamposObligatorios(dataRow)) {
      this.mostrarMensaje('warn', 'Complete todos los campos obligatorios');
      return;
    }

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: SeleccionClasificacionData, index: number): void {
    const key = dataRow._uid || dataRow.id?.toString() || '';

    if (dataRow.isNew) {
      this.dataOriginal = this.dataOriginal.filter(item => item._uid !== dataRow._uid);
      this.hasNewRowInEditing = false;
    } else if (this.clonedData[key]) {
      Object.assign(dataRow, this.clonedData[key]);
      delete this.clonedData[key];
    }

    this.editingRow = null;
  }

  // ============= VALIDACIONES =============
  private validarCamposObligatorios(dataRow: SeleccionClasificacionData): boolean {
    return !!(
      dataRow.fecha &&
      dataRow.gaveta_cruda &&
      dataRow.donante &&
      dataRow.frasco_leche_cruda &&
      dataRow.nombre_profesional &&
      dataRow.nombre_auxiliar
    );
  }

  // ============= UTILIDADES =============
  private cargarFrascosPorDonante(idDonante: string, rowData: SeleccionClasificacionData): void {
    this.loading.frascos = true;

    this.seleccionClasificacionService.getFrascosByMadreDonante(idDonante)
      .subscribe({
        next: (frascos: FrascoOption[]) => {
          this.frascosFiltrados = frascos;
          this.loading.frascos = false;
        },
        error: (error) => {
          console.error('Error al cargar frascos:', error);
          this.loading.frascos = false;
          this.frascosFiltrados = [];
        }
      });
  }

  private extraerIdDonante(donanteLabel: string): string | null {
    const match = donanteLabel.match(/^(\d+)/);
    return match ? match[1] : null;
  }

  private guardarNuevoRegistro(dataRow: SeleccionClasificacionData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    const datosParaBackend = this.prepararDatosParaCreacion(dataRow);

    this.seleccionClasificacionService.postSeleccionClasificacion(datosParaBackend)
      .subscribe({
        next: (response) => {
          dataRow.id = response.data.id;
          dataRow.isNew = false;
          delete dataRow._uid;

          this.table?.cancelRowEdit(rowElement);
          this.resetearEstadoEdicion();
          this.loading.main = false;
          this.mostrarMensaje('success', 'Registro creado exitosamente');
        },
        error: (error) => {
          console.error('Error al crear registro:', error);
          this.loading.main = false;
          this.mostrarMensaje('error', 'Error al crear el registro');
        }
      });
  }

  private actualizarRegistroExistente(dataRow: SeleccionClasificacionData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    const datosParaBackend = this.prepararDatosParaActualizacion(dataRow);

    this.seleccionClasificacionService.putSeleccionClasificacion(datosParaBackend)
      .subscribe({
        next: () => {
          const key = dataRow.id?.toString() || '';
          delete this.clonedData[key];

          this.table?.cancelRowEdit(rowElement);
          this.resetearEstadoEdicion();
          this.loading.main = false;
          this.mostrarMensaje('success', 'Registro actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar registro:', error);
          this.loading.main = false;
          this.mostrarMensaje('error', 'Error al actualizar el registro');
        }
      });
  }

  private prepararDatosParaCreacion(dataRow: SeleccionClasificacionData): any {
    return {
      fecha: this.formatearFechaParaBackend(dataRow.fecha),
      gavetaCruda: dataRow.gaveta_cruda,
      diasProduccion: dataRow.dias_produccion,
      noFrascoProcesado: dataRow.no_frasco_procesado,
      idMadreDonante: dataRow.id_madre_donante,
      idFrascoLecheCruda: this.extraerIdFrasco(dataRow.frasco_leche_cruda),
      edadGestacional: dataRow.edad_gestacional,
      volumen: dataRow.volumen,
      idEmpleadoProfesional: dataRow.id_empleado_profesional,
      idEmpleadoAuxiliar: dataRow.id_empleado_auxiliar,
      nFrascosPasteurizados: dataRow.n_frascos_pasteurizados,
      volumenPasteurizado: dataRow.volumen_pasteurizado,
      fechaVencimiento: this.formatearFechaParaBackend(dataRow.fecha_vencimiento),
      observaciones: dataRow.observaciones,
      ciclo: dataRow.ciclo,
      nLoteMediosCultivo: dataRow.n_lote_medios_cultivo,
      fechaVencimientoCultivos: this.formatearFechaParaBackend(dataRow.fecha_vencimiento_cultivos),
      lote: dataRow.lote
    };
  }

  private prepararDatosParaActualizacion(dataRow: SeleccionClasificacionData): any {
    return {
      id: dataRow.id,
      ...this.prepararDatosParaCreacion(dataRow)
    };
  }

  private formatearFechaParaBackend(fecha: any): string {
    if (!fecha) return '';

    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }

    if (typeof fecha === 'string') {
      return new Date(fecha).toISOString().split('T')[0];
    }

    return '';
  }

  private extraerIdFrasco(frascoLabel: string | undefined): number | null {
    if (!frascoLabel) return null;

    const frasco = this.frascosFiltrados.find(f => f.value === frascoLabel);
    return frasco?.id_frasco || null;
  }

  private resetearEstadoEdicion(): void {
    this.editingRow = null;
    this.hasNewRowInEditing = false;
  }

  // ============= FILTROS =============
  filtrarPorFecha(filtro: FiltroFecha): void {
    this.filtroFecha = filtro;

    this.dataFiltered = this.dataOriginal.filter(item => {
      if (!item.fecha) return false;

      const fecha = new Date(item.fecha);
      return (
        fecha.getFullYear() === filtro.year &&
        fecha.getMonth() + 1 === filtro.month
      );
    });

    this.mostrarMensaje('info',
      `Mostrando registros de ${this.obtenerNombreMes(filtro.month)} ${filtro.year}`
    );
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha): void {
    if (this.dataOriginal.length === 0) {
      return;
    }

    this.filtrarPorFecha(filtro);
  }

  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: SeleccionClasificacionData): boolean {
    return this.editingRow?._uid === rowData._uid ||
      this.editingRow?.id === rowData.id;
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null;
  }

  isEditButtonDisabled(rowData: SeleccionClasificacionData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  isEyeButtonDisabled(rowData: SeleccionClasificacionData): boolean {
    return this.isEditing(rowData);
  }

  getFrascosDisponibles(rowData: SeleccionClasificacionData): FrascoOption[] {
    return this.frascosFiltrados;
  }

  // ============= MENSAJES =============
  private mostrarMensaje(tipo: TipoMensaje, mensaje: string): void {
    this.messageService.add({
      severity: tipo,
      summary: tipo === 'success' ? 'Éxito' :
        tipo === 'error' ? 'Error' :
          tipo === 'warn' ? 'Advertencia' : 'Información',
      detail: mensaje,
      key: 'tr',
      life: 3000
    });
  }
}
