import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule, Table } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DosificacionesService } from '../../services/dosificaciones.service';
import type {
  DosificacionData,
  DosificacionBackendRequest,
  DosificacionBackendResponse,
  ApiResponseDosificaciones,
  LoadingStateDosificaciones,
  TableColumnDosificaciones,
  TipoMensajeDosificaciones
} from '../../interfaces/dosificaciones.interface';
import type { IngresoLechePasteurizadaData } from '../../interfaces/ingreso-leche-pasteurizada.interface';

@Component({
  selector: 'dosificaciones-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    HttpClientModule
  ],
  templateUrl: './dosificaciones-table.component.html',
  styleUrl: './dosificaciones-table.component.scss',
  providers: [MessageService]
})
export class DosificacionesTableComponent implements OnInit, OnChanges {

  @Input() ingresoLechePasteurizadaData: IngresoLechePasteurizadaData | null = null;

  @ViewChild('tableDosificaciones') table!: Table;

  readonly loading: LoadingStateDosificaciones = {
    main: false,
    saving: false
  };

  editingRow: DosificacionData | null = null;
  clonedData: Record<string, DosificacionData> = {};
  hasNewRowInEditing = false;
  tempIdCounter = -1;

  dataDosificaciones: DosificacionData[] = [];

  headersDosificaciones: TableColumnDosificaciones[] = [
    { header: 'NOMBRE DEL\nRECIÉN NACIDO', field: 'nombre_recien_nacido', width: '200px', tipo: 'text' },
    { header: 'CAMA', field: 'cama', width: '120px', tipo: 'text' },
    { header: 'VOLUMEN\nDOSIFICADO', field: 'volumen_dosificado', width: '150px', tipo: 'text' },
    { header: 'MÉDICO O NUTRICIONISTA\nQUE ORDENA', field: 'medico_nutricionista', width: '220px', tipo: 'text' },
    { header: 'QUIEN DOSIFICÓ', field: 'quien_dosificado', width: '200px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly messageService: MessageService,
    private readonly dosificacionesService: DosificacionesService
  ) { }

  ngOnInit(): void {
    // Inicialización sin datos mock
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ingresoLechePasteurizadaData']?.currentValue) {
      const idIngreso = this.ingresoLechePasteurizadaData?.id;
      if (idIngreso) {
        this.cargarDosificaciones(idIngreso);
      }
    }
  }

  // ============= CARGAR DOSIFICACIONES DESDE API =============
  private cargarDosificaciones(idIngreso: number): void {
    this.loading.main = true;

    this.dosificacionesService.getDosificacionesByIngresoId(idIngreso).subscribe({
      next: (response: ApiResponseDosificaciones) => {
        if (response?.data && Array.isArray(response.data)) {
          this.dataDosificaciones = this.transformarDosificacionesDesdeAPI(response.data);
        } else {
          this.dataDosificaciones = [];
        }
        this.loading.main = false;
      },
      error: (error: any) => {
        console.error('Error al cargar dosificaciones:', error);
        this.dataDosificaciones = [];
        this.loading.main = false;
      }
    });
  }

  private transformarDosificacionesDesdeAPI(datos: DosificacionBackendResponse[]): DosificacionData[] {
    return datos.map((item: DosificacionBackendResponse) => ({
      id: item.id,
      nombre_recien_nacido: item.nombre,
      cama: item.cama.toString(),
      volumen_dosificado: item.volumenDosificado.toString(),
      medico_nutricionista: item.medico,
      quien_dosificado: item.dosificador,
      id_ingreso_leche_pasteurizada: this.ingresoLechePasteurizadaData?.id || null,
      isNew: false
    }));
  }

  // ============= EVENTOS DE SELECCIÓN =============
  private extraerValorEvento(event: any): string {
    if (event?.value) return event.value;
    if (typeof event === 'string') return event;
    return '';
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

  private crearRegistroVacio(): DosificacionData {
    return {
      id: null,
      nombre_recien_nacido: '',
      cama: '',
      volumen_dosificado: '',
      medico_nutricionista: '',
      quien_dosificado: '',
      id_ingreso_leche_pasteurizada: this.ingresoLechePasteurizadaData?.id || null,
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private agregarRegistroATabla(registro: DosificacionData): void {
    this.dataDosificaciones.push(registro);
    this.dataDosificaciones = [...this.dataDosificaciones];
  }

  private iniciarEdicionRegistro(registro: DosificacionData): void {
    this.hasNewRowInEditing = true;
    this.editingRow = registro;
    setTimeout(() => this.table.initRowEdit(registro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: DosificacionData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: DosificacionData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Validar que la suma de volúmenes no exceda el volumen del frasco
    if (!this.validarVolumenTotal(dataRow)) {
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: DosificacionData, index: number): void {
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: DosificacionData, rowElement: HTMLTableRowElement): void {
    this.loading.saving = true;

    const requestData = this.transformarABackendRequestDosificacion(dataRow);

    this.dosificacionesService.postDosificacion(requestData).subscribe({
      next: (response: any) => {
        if (response?.data?.id) {
          dataRow.id = response.data.id;
        }
        this.procesarRespuestaCreacion(dataRow, rowElement);
        // Recargar dosificaciones
        if (this.ingresoLechePasteurizadaData?.id) {
          this.cargarDosificaciones(this.ingresoLechePasteurizadaData.id);
        }
      },
      error: (error: any) => {
        console.error('Error al crear dosificación:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudo crear la dosificación');
        this.loading.saving = false;
      }
    });
  }

  private actualizarRegistroExistente(dataRow: DosificacionData, rowElement: HTMLTableRowElement): void {
    if (!dataRow.id) {
      this.mostrarMensaje('error', 'Error', 'No se puede actualizar un registro sin ID');
      return;
    }

    this.loading.saving = true;

    const requestData = this.transformarABackendRequestDosificacion(dataRow);

    this.dosificacionesService.putDosificacion(dataRow.id, requestData).subscribe({
      next: (response: any) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
        // Recargar dosificaciones
        if (this.ingresoLechePasteurizadaData?.id) {
          this.cargarDosificaciones(this.ingresoLechePasteurizadaData.id);
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar dosificación:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudo actualizar la dosificación');
        this.loading.saving = false;
      }
    });
  }

  private eliminarRegistroTemporal(dataRow: DosificacionData): void {
    const predicate = (item: DosificacionData) =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew);

    const index = this.dataDosificaciones.findIndex(predicate);
    if (index !== -1) {
      this.dataDosificaciones.splice(index, 1);
      this.dataDosificaciones = [...this.dataDosificaciones];
    }
  }

  private validarCamposRequeridos(dataRow: DosificacionData): boolean {
    return !!(
      dataRow.nombre_recien_nacido?.trim() &&
      dataRow.cama?.trim() &&
      dataRow.volumen_dosificado?.trim() &&
      dataRow.medico_nutricionista?.trim() &&
      dataRow.quien_dosificado?.trim()
    );
  }

  private validarVolumenTotal(dataRowActual: DosificacionData): boolean {
    if (!this.ingresoLechePasteurizadaData?.volumen) {
      this.mostrarMensaje('error', 'Error', 'No se puede validar: no hay volumen del frasco disponible');
      return false;
    }

    const volumenFrasco = parseFloat(this.ingresoLechePasteurizadaData.volumen);
    if (isNaN(volumenFrasco)) {
      this.mostrarMensaje('error', 'Error', 'El volumen del frasco no es válido');
      return false;
    }

    // Calcular suma de volúmenes de todas las dosificaciones
    let sumaVolumenes = 0;
    this.dataDosificaciones.forEach(dosificacion => {
      // Si es el registro actual que estamos editando/creando, usar el nuevo valor
      const volumenStr = dosificacion._uid === dataRowActual._uid || dosificacion.id === dataRowActual.id
        ? dataRowActual.volumen_dosificado
        : dosificacion.volumen_dosificado;

      const volumen = parseFloat(volumenStr || '0');
      if (!isNaN(volumen)) {
        sumaVolumenes += volumen;
      }
    });

    if (sumaVolumenes > volumenFrasco) {
      this.mostrarMensaje(
        'error',
        'Error de Validación',
        `La suma de volúmenes dosificados (${sumaVolumenes} ML) no puede superar el volumen del frasco (${volumenFrasco} ML)`
      );
      return false;
    }

    return true;
  }

  private guardarEstadoOriginal(dataRow: DosificacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: DosificacionData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataDosificaciones[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaCreacion(dataRow: DosificacionData, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    delete dataRow._uid;

    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Dosificación registrada exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: DosificacionData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.saving = false;

    this.mostrarMensaje('success', 'Éxito', 'Dosificación actualizada exitosamente');
  }

  private getRowId(dataRow: DosificacionData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: DosificacionData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: DosificacionData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ============= CÁLCULOS =============
  calcularVolumenTotal(): number {
    return this.dataDosificaciones.reduce((total, dosificacion) => {
      const volumen = parseFloat(dosificacion.volumen_dosificado || '0');
      return total + (isNaN(volumen) ? 0 : volumen);
    }, 0);
  }

  obtenerVolumenRestante(): number {
    if (!this.ingresoLechePasteurizadaData?.volumen) return 0;

    const volumenFrasco = parseFloat(this.ingresoLechePasteurizadaData.volumen);
    const volumenDosificado = this.calcularVolumenTotal();

    return volumenFrasco - volumenDosificado;
  }

  // ============= MENSAJES =============
  private mostrarMensaje(severity: TipoMensajeDosificaciones, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      key: 'tr',
      life
    });
  }

  private transformarABackendRequestDosificacion(dataRow: DosificacionData): DosificacionBackendRequest {
    return {
      nombre: dataRow.nombre_recien_nacido,
      cama: parseInt(dataRow.cama) || 0,
      volumenDosificado: parseFloat(dataRow.volumen_dosificado) || 0,
      medico: dataRow.medico_nutricionista,
      dosificador: dataRow.quien_dosificado,
      ingresoLechePasteurizada: this.ingresoLechePasteurizadaData?.id || 0
    };
  }
}
