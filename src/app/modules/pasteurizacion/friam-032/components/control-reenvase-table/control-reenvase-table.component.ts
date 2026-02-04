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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { ControlReenvaseService } from '../../services/control-reenvase.service';
import type {
  ControlReenvaseData,
  ResponsableOption,
  DonanteOption,
  FrascoOption,
  FiltroFecha,
  TipoMensaje,
  TipoFrasco,
  DatosBackendParaCreacion,
  DatosBackendParaActualizacion,
  LoadingState,
  TableColumn,
  FiltrosBusqueda
} from '../../interfaces/control-reenvase.interface';

@Component({
  selector: 'control-reenvase-table',
  imports: [
    TableModule, CommonModule, ProgressSpinnerModule, ToastModule,
    FormsModule, ButtonModule, InputTextModule, DatePickerModule,
    SelectModule, AutoCompleteModule, TooltipModule, HttpClientModule
  ],
  templateUrl: './control-reenvase-table.component.html',
  styleUrl: './control-reenvase-table.component.scss',
  providers: [MessageService]
})
export class ControlReenvaseTableComponent implements OnInit {

  @ViewChild('tableControlReenvase') table!: Table;
  @Output() rowClick = new EventEmitter<ControlReenvaseData>();

  @Input() filtrosBusqueda: FiltrosBusqueda = {
    no_donante: '',
    ciclo: '',
    lote: ''
  };

  readonly loading: LoadingState = {
    main: false,
    donantes: false,
    frascos: false,
    empleados: false
  };

  editingRow: ControlReenvaseData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, ControlReenvaseData> = {};
  tempIdCounter = -1;

  dataOriginal: ControlReenvaseData[] = [];
  dataFiltered: ControlReenvaseData[] = [];
  filtroFecha: FiltroFecha | null = null;

  opcionesResponsables: ResponsableOption[] = [];
  opcionesDonantes: DonanteOption[] = [];
  frascosFiltrados: FrascoOption[] = [];
  private isInitialLoad = true;

  headersControlReenvase: TableColumn[] = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'No. Donante', field: 'no_donante', width: '200px', tipo: 'select' },
    { header: 'No. FRASCO ANTERIOR', field: 'no_frasco_anterior', width: '200px', tipo: 'select' },
    { header: 'VOLUMEN', field: 'volumen_frasco_anterior', width: '150px', tipo: 'text' },
    { header: 'CICLO', field: 'ciclo', width: '120px', tipo: 'text' },
    { header: 'LOTE', field: 'lote', width: '120px', tipo: 'text' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'select' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  private readonly mesesDelAno = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;

  get dataControlReenvase(): ControlReenvaseData[] {
    return this.dataFiltered;
  }

  get loadingDonantes(): boolean {
    return this.loading.donantes;
  }

  get loadingFrascos(): boolean {
    return this.loading.frascos;
  }

  constructor(
    private readonly controlReenvaseService: ControlReenvaseService,
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
        this.cargarMadresDonantes(),
        this.cargarDatosControlReenvase()
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

      this.controlReenvaseService.getEmpleados().subscribe({
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

  private cargarMadresDonantes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.donantes = true;

      this.controlReenvaseService.getMadresDonantes().subscribe({
        next: (donantes) => {
          this.opcionesDonantes = donantes;
          this.loading.donantes = false;
          resolve();
        },
        error: (error) => {
          this.loading.donantes = false;
          console.error('Error al cargar madres donantes:', error);
          this.mostrarMensaje('error', 'Error', 'No se pudieron cargar las madres donantes');
          reject(error);
        }
      });
    });
  }

  private cargarDatosControlReenvase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.main = true;

      this.controlReenvaseService.getAllControlReenvase().subscribe({
        next: (registros) => {
          this.dataOriginal = this.transformarDatosBackend(registros);
          this.dataFiltered = [...this.dataOriginal];

          if (!this.isInitialLoad) {
            this.mostrarMensajeExitosoCarga();
          }

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

  private cargarFrascosPorDonante(idMadreDonante: string): void {
    if (!idMadreDonante) {
      this.frascosFiltrados = [];
      return;
    }

    this.loading.frascos = true;

    this.controlReenvaseService.getFrascosByMadreDonante(idMadreDonante).subscribe({
      next: (frascos) => {
        this.frascosFiltrados = this.transformarFrascosAPI(frascos, idMadreDonante);
        this.loading.frascos = false;

        if (this.frascosFiltrados.length === 0) {
          this.mostrarMensaje('info', 'Información', 'No se encontraron frascos disponibles para esta donante');
        }
      },
      error: (error) => {
        this.loading.frascos = false;
        console.error('Error al cargar frascos:', error);
        this.mostrarMensaje('error', 'Error', 'Error al cargar los frascos de la donante');
        this.frascosFiltrados = [];
      }
    });
  }

  // ============= TRANSFORMACIÓN DE DATOS =============

  private transformarFrascosAPI(frascos: any[], idMadreDonante: string): FrascoOption[] {
    return frascos
      .map((entrada: any) => {
        const esExtraccion = entrada.extraccion !== null;
        const frascoData = esExtraccion ? entrada.extraccion : entrada.frascoRecolectado;

        if (!frascoData) return null;

        const volumenValue = esExtraccion
          ? (frascoData.cantidad?.toString() || '0')
          : (frascoData.volumen?.toString() || '0');

        const fechaExtraccion = frascoData.fechaDeExtraccion || frascoData.fechaExtraccion || null;

        return {
          label: this.generarCodigoLHC(entrada.id, fechaExtraccion),
          value: this.generarCodigoLHC(entrada.id, fechaExtraccion),
          donante: idMadreDonante,
          volumen: volumenValue,
          id_frasco_principal: entrada.id,
          id_frasco_data: entrada.id,
          tipo: esExtraccion ? 'extraccion' : 'recolectado',
          fechaExtraccion: fechaExtraccion,
          termo: frascoData.termo || null,
          gaveta: frascoData.gaveta || null,
          procedencia: entrada.procedencia || null,
          fechaVencimiento: entrada.fechaVencimiento || null,
          fechaEntrada: entrada.fechaEntrada || null,
          fechaSalida: entrada.fechaSalida || null
        };
      })
      .filter(Boolean) as FrascoOption[];
  }

  private transformarDatosBackend(registros: any[]): ControlReenvaseData[] {
    return registros.map((registro: any) => {
      const { volumen, tipo, idExtraccion, idFrascoRecolectado } = this.extraerVolumenYTipoDesdeFrascoCrudo(registro);

      return {
        id: registro.id,
        fecha: this.parsearFechaDesdeBackend(registro.fecha),
        no_donante: registro.madreDonante.id.toString(),
        no_frasco_anterior: this.generarCodigoLHC(registro.frascoCrudo.id, registro.fecha),
        id_frasco_anterior: registro.frascoCrudo.id,
        volumen_frasco_anterior: volumen,
        ciclo: registro.lote?.ciclo?.numeroCiclo?.toString() || '',
        lote: registro.lote?.numeroLote?.toString() || '',
        responsable: registro.empleado.nombre,
        madre_donante_info: registro.madreDonante,
        empleado_info: registro.empleado,
        id_empleado: registro.empleado.id,
        tipo_frasco: tipo,
        id_extraccion: idExtraccion,
        id_frasco_recolectado: idFrascoRecolectado,
        ciclo_id: registro.lote?.ciclo?.id || null,
        lote_id: registro.lote?.id || null
      };
    });
  }

  private extraerVolumenYTipoDesdeFrascoCrudo(registro: any): {
    volumen: string;
    tipo: TipoFrasco;
    idExtraccion?: number;
    idFrascoRecolectado?: number;
  } {
    const frascoCrudo = registro.frascoCrudo;

    if (!frascoCrudo) {
      return { volumen: '0', tipo: 'recolectado' };
    }

    if (frascoCrudo.extraccion) {
      return {
        volumen: frascoCrudo.extraccion.cantidad?.toString() || '0',
        tipo: 'extraccion',
        idExtraccion: frascoCrudo.id
      };
    }

    if (frascoCrudo.frascoRecolectado) {
      return {
        volumen: frascoCrudo.frascoRecolectado.volumen?.toString() || '0',
        tipo: 'recolectado',
        idFrascoRecolectado: frascoCrudo.id
      };
    }

    return { volumen: '0', tipo: 'recolectado' };
  }

  private extraerVolumenYTipo(registro: any): {
    volumen: string;
    tipo: TipoFrasco;
    idExtraccion?: number;
    idFrascoRecolectado?: number;
  } {
    return this.extraerVolumenYTipoDesdeFrascoCrudo(registro);
  }

  // ============= UTILIDADES =============

  private generarCodigoLHC(id: number, fecha?: Date | string | null): string {
    let año: string;

    if (fecha) {
      const fechaParseada = this.parsearFechaSegura(fecha);
      if (fechaParseada) {
        año = fechaParseada.getFullYear().toString().slice(-2);
      } else {
        año = new Date().getFullYear().toString().slice(-2);
      }
    } else {
      año = new Date().getFullYear().toString().slice(-2);
    }

    return `LHC ${año} ${id}`;
  }

  private extraerIdDeCodigoLHC(codigo: string): number | null {
    if (!codigo) return null;
    const match = codigo.match(/LHC\s+\d+\s+(\d+)/);
    return match ? parseInt(match[1]) : null;
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

  onDonanteSeleccionado(event: any, rowData: ControlReenvaseData): void {
    const codigoDonante = this.extraerValorEvento(event);
    if (!codigoDonante) return;

    rowData.no_donante = codigoDonante;

    if (codigoDonante.trim()) {
      rowData.no_frasco_anterior = '';
      rowData.volumen_frasco_anterior = '';
      this.cargarFrascosPorDonante(codigoDonante);
    } else {
      this.limpiarSeleccionFrasco(rowData);
    }
  }

  onFrascoSeleccionado(event: any, rowData: ControlReenvaseData): void {
    const valorFrasco = this.extraerValorEvento(event);
    if (!valorFrasco) return;

    rowData.no_frasco_anterior = valorFrasco;

    const frascoSeleccionado = this.frascosFiltrados.find(f => f.value === valorFrasco);
    if (frascoSeleccionado) {
      rowData.volumen_frasco_anterior = frascoSeleccionado.volumen;

      rowData.id_frasco_anterior = frascoSeleccionado.id_frasco_principal;
      rowData.frasco_crudo = frascoSeleccionado.id_frasco_principal;
      rowData.tipo_frasco = frascoSeleccionado.tipo;

      if (frascoSeleccionado.tipo === 'extraccion') {
        rowData.id_extraccion = frascoSeleccionado.id_frasco_principal;
        rowData.id_frasco_recolectado = null;
      } else {
        rowData.id_frasco_recolectado = frascoSeleccionado.id_frasco_principal;
        rowData.id_extraccion = null;
      }
    }
  }

  onResponsableSeleccionado(event: any, rowData: ControlReenvaseData): void {
    const responsable = this.extraerValorEvento(event);
    if (!responsable) return;

    rowData.responsable = responsable;

    const empleadoSeleccionado = this.opcionesResponsables.find(emp => emp.value === responsable);
    if (empleadoSeleccionado?.id_empleado) {
      (rowData as any).id_empleado = empleadoSeleccionado.id_empleado;
    }
  }

  onRowClick(rowData: ControlReenvaseData): void {
    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de ver las pasteurizaciones');
      return;
    }
    this.rowClick.emit(rowData);
  }

  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
  }

  private limpiarSeleccionFrasco(rowData: ControlReenvaseData): void {
    rowData.no_frasco_anterior = '';
    rowData.volumen_frasco_anterior = '';
    this.frascosFiltrados = [];
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

  private crearRegistroVacio(): ControlReenvaseData {
    return {
      id: null,
      fecha: new Date(),
      responsable: '',
      no_donante: '',
      no_frasco_anterior: '',
      volumen_frasco_anterior: '',
      ciclo: '',
      lote: '',
      ciclo_id: null,
      lote_id: null,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarRegistroATabla(registro: ControlReenvaseData): void {
    this.dataOriginal.push(registro);
    this.dataFiltered.push(registro);
    this.dataFiltered = [...this.dataFiltered];
  }

  private iniciarEdicionRegistro(registro: ControlReenvaseData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = registro;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  onRowEditInit(dataRow: ControlReenvaseData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;

    if (dataRow.no_donante) {
      this.cargarFrascosPorDonante(dataRow.no_donante);
    } else {
      this.frascosFiltrados = [];
    }

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
  }

  onRowEditSave(dataRow: ControlReenvaseData, index: number, event: MouseEvent): void {
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

  onRowEditCancel(dataRow: ControlReenvaseData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaCreacion(dataRow);
    if (!datosBackend) return;

    this.controlReenvaseService.postControlReenvase(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response, dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar el registro');
      }
    });
  }

  private actualizarRegistroExistente(dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaActualizacion(dataRow);
    if (!datosBackend) return;

    this.controlReenvaseService.putControlReenvase(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el registro');
      }
    });
  }

  private prepararDatosParaCreacion(dataRow: ControlReenvaseData): DatosBackendParaCreacion {
    const frascoSeleccionado = this.frascosFiltrados.find(f => f.value === dataRow.no_frasco_anterior);

    if (!frascoSeleccionado) {
      throw new Error('Frasco seleccionado no encontrado');
    }

    const idFrascoPrincipal = frascoSeleccionado.id_frasco_principal;

    const datosCreacion: DatosBackendParaCreacion = {
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      frascoCrudo: idFrascoPrincipal!,
      ciclo: { id: Number(dataRow.ciclo) },
      lote: { id: Number(dataRow.lote) },
      madreDonante: { id: Number(dataRow.no_donante) },
      empleado: { id: dataRow.id_empleado! }
    };

    if (frascoSeleccionado.tipo === 'extraccion') {
      datosCreacion.extraccion = idFrascoPrincipal;
      datosCreacion.frascoRecolectado = null;
    } else {
      datosCreacion.frascoRecolectado = idFrascoPrincipal;
      datosCreacion.extraccion = null;
    }

    return datosCreacion;
  }

  private prepararDatosParaActualizacion(dataRow: ControlReenvaseData): DatosBackendParaActualizacion {
    if (!dataRow.id) {
      throw new Error('ID del registro no encontrado para actualización');
    }

    const datosActualizacion: DatosBackendParaActualizacion = {
      id: dataRow.id,
      fecha: this.formatearFechaParaAPI(dataRow.fecha as Date),
      volumen: Number(dataRow.volumen_frasco_anterior) || 0,
      frascoCrudo: dataRow.id_frasco_anterior!,
      ciclo: {
        id: dataRow.ciclo_id!,
        numeroCiclo: Number(dataRow.ciclo)
      },
      lote: {
        id: dataRow.lote_id!,
        numeroLote: Number(dataRow.lote)
      },
      madreDonante: {
        id: Number(dataRow.no_donante),
        tipoDonante: dataRow.madre_donante_info?.tipoDonante || 'externa'
      },
      empleado: { id: dataRow.id_empleado! },
      extraccion: null,
      frascoRecolectado: null
    };

    if (dataRow.tipo_frasco === 'extraccion') {
      datosActualizacion.extraccion = dataRow.id_frasco_anterior!;
    } else {
      datosActualizacion.frascoRecolectado = dataRow.id_frasco_anterior!;
    }

    return datosActualizacion;
  }

  private actualizarDatosDesdeBackend(idRegistro: number, dataRow: ControlReenvaseData): void {
    setTimeout(() => {
      this.controlReenvaseService.getControlReenvaseById(idRegistro).subscribe({
        next: (registroActualizado) => {
          if (registroActualizado) {

            const [datosTransformados] = this.transformarDatosBackend([registroActualizado]);

            dataRow.ciclo_id = datosTransformados.ciclo_id;
            dataRow.lote_id = datosTransformados.lote_id;
            dataRow.ciclo = datosTransformados.ciclo;
            dataRow.lote = datosTransformados.lote;

            const originalIndex = this.dataOriginal.findIndex(item => item.id === idRegistro);
            if (originalIndex !== -1) {
              this.dataOriginal[originalIndex] = { ...dataRow };
            }

            const filteredIndex = this.dataFiltered.findIndex(item => item.id === idRegistro);
            if (filteredIndex !== -1) {
              this.dataFiltered[filteredIndex] = { ...dataRow };
            }

            this.dataFiltered = [...this.dataFiltered];
          }
        },
        error: (error) => {
          console.error('Error al obtener datos actualizados del backend:', error);
        }
      });
    }, 500);
  }

  // ============= VALIDACIONES =============

  private validarCamposRequeridos(dataRow: ControlReenvaseData): boolean {
    const camposBasicos = !!(
      dataRow.fecha &&
      dataRow.responsable?.trim() &&
      dataRow.no_donante?.trim() &&
      dataRow.no_frasco_anterior?.trim() &&
      dataRow.volumen_frasco_anterior?.trim()
    );

    const cicloStr = typeof dataRow.ciclo === 'number' ? dataRow.ciclo.toString() : dataRow.ciclo || '';
    const loteStr = typeof dataRow.lote === 'number' ? dataRow.lote.toString() : dataRow.lote || '';

    if (dataRow.isNew) {
      const tieneCiclo = cicloStr.trim() !== '';
      const tieneLote = loteStr.trim() !== '';

      if (!tieneCiclo || !tieneLote) {
        return false;
      }

      const cicloValue = parseInt(cicloStr.trim());
      const loteValue = parseInt(loteStr.trim());

      const cicloValido = !isNaN(cicloValue) && cicloValue > 0;
      const loteValido = !isNaN(loteValue) && loteValue > 0;

      return camposBasicos && cicloValido && loteValido;
    }

    else {
      const cicloValido = !cicloStr.trim() || (!isNaN(parseInt(cicloStr.trim())) && parseInt(cicloStr.trim()) > 0);
      const loteValido = !loteStr.trim() || (!isNaN(parseInt(loteStr.trim())) && parseInt(loteStr.trim()) > 0);

      return camposBasicos && cicloValido && loteValido;
    }
  }

  private validarDatosBasicos(dataRow: ControlReenvaseData): boolean {
    if (!this.validarCamposRequeridos(dataRow)) {
      return false;
    }

    if (!dataRow.isNew) {
      const volumen = parseFloat(dataRow.volumen_frasco_anterior!);
      if (isNaN(volumen) || volumen <= 0) {
        this.mostrarMensaje('error', 'Error', 'El volumen debe ser un número mayor a 0');
        return false;
      }
    }

    return true;
  }

  // ============= ESTADOS DE EDICIÓN =============

  private guardarEstadoOriginal(dataRow: ControlReenvaseData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: ControlReenvaseData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataFiltered[index] = this.clonedData[rowId];
    delete this.clonedData[rowId];
  }

  private eliminarRegistroTemporal(dataRow: ControlReenvaseData): void {
    const predicate = (item: ControlReenvaseData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const originalIndex = this.dataOriginal.findIndex(predicate);
    if (originalIndex !== -1) this.dataOriginal.splice(originalIndex, 1);

    const filteredIndex = this.dataFiltered.findIndex(predicate);
    if (filteredIndex !== -1) {
      this.dataFiltered.splice(filteredIndex, 1);
      this.dataFiltered = [...this.dataFiltered];
    }
  }

  private procesarRespuestaCreacion(response: any, dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    if (response.data?.id) {
      dataRow.id = response.data.id;

      this.actualizarDatosDesdeBackend(response.data.id, dataRow);
    }

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

  private procesarRespuestaActualizacion(dataRow: ControlReenvaseData, rowElement: HTMLTableRowElement): void {
    if (dataRow.id) {
      this.actualizarDatosDesdeBackend(dataRow.id, dataRow);
    }

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

  isCampoEditable(campo: string, rowData: ControlReenvaseData): boolean {
    if (rowData.isNew && (campo === 'fecha' || campo === 'no_donante')) return true;
    if (campo === 'volumen_frasco_anterior' || campo === 'responsable' || campo === 'ciclo' || campo === 'lote') return true;
    if (campo === 'no_frasco_anterior') {
      const tieneDonante = Boolean(rowData.no_donante?.trim());
      return tieneDonante && Boolean(rowData.isNew);
    }
    if ((campo === 'fecha' || campo === 'no_donante') && rowData.isNew) return true;
    return false;
  }

  getFrascosDisponibles(rowData: ControlReenvaseData): FrascoOption[] {
    return rowData.no_donante ? this.frascosFiltrados : [];
  }

  isEditing(rowData: ControlReenvaseData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: ControlReenvaseData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private getRowId(dataRow: ControlReenvaseData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= FILTROS =============

  filtrarPorFecha(filtro: FiltroFecha | null): void {
    this.filtroFecha = filtro;
    this.aplicarFiltros();
    this.mostrarNotificacionFiltro();
  }

  aplicarFiltroInicialConNotificacion(filtro: FiltroFecha | null): void {
    this.isInitialLoad = false;
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

  private aplicarFiltrosBusquedaTexto(datos: ControlReenvaseData[]): ControlReenvaseData[] {
    return datos.filter(item => {
      const cumpleDonante = !this.filtrosBusqueda.no_donante ||
        item.no_donante?.toLowerCase().includes(this.filtrosBusqueda.no_donante.toLowerCase());

      const cicloStr = typeof item.ciclo === 'number' ? item.ciclo.toString() : item.ciclo || '';
      const loteStr = typeof item.lote === 'number' ? item.lote.toString() : item.lote || '';

      const cumpleCiclo = !this.filtrosBusqueda.ciclo ||
        cicloStr.toLowerCase().includes(this.filtrosBusqueda.ciclo.toLowerCase());

      const cumpleLote = !this.filtrosBusqueda.lote ||
        loteStr.toLowerCase().includes(this.filtrosBusqueda.lote.toLowerCase());

      return cumpleDonante && cumpleCiclo && cumpleLote;
    });
  }

  private filtrarPorMesYAno(datos: ControlReenvaseData[], filtro: FiltroFecha): ControlReenvaseData[] {
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
      ? `${cantidad} registro${cantidad > 1 ? 's' : ''} de control de reenvase cargado${cantidad > 1 ? 's' : ''}`
      : 'No se encontraron registros de control de reenvase en la base de datos';

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
