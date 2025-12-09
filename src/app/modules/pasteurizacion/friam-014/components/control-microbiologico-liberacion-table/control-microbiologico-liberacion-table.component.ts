import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

import { ControlMicrobiologicoLiberacionService } from '../../services/control-microbiologico-liberacion.service';
import type {
  ControlMicrobiologicoLiberacionData,
  LoadingState,
  TableColumn,
  BusquedaCicloLote,
  FrascoPasteurizadoData,
  TipoMensaje,
  DatosFormulario,
  EmpleadoOption,
  PayloadControlMicrobiologico
} from '../../interfaces/control-microbiologico-liberacion.interface';

@Component({
  selector: 'control-microbiologico-liberacion-table',
  imports: [
    TableModule,
    CommonModule,
    HttpClientModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    RadioButtonModule,
    DatePickerModule,
    SelectModule,
    CardModule,
    DividerModule
  ],
  templateUrl: './control-microbiologico-liberacion-table.component.html',
  styleUrl: './control-microbiologico-liberacion-table.component.scss',
  providers: [MessageService]
})
export class ControlMicrobiologicoLiberacionTableComponent implements OnInit {

  @ViewChild('tableControlMicrobiologico') table!: Table;

  readonly loading: LoadingState = {
    main: false,
    search: false,
    empleados: false,
    saving: false
  };

  editingRowId: string | null = null;
  clonedData: Record<string, ControlMicrobiologicoLiberacionData> = {};

  dataControlMicrobiologico: ControlMicrobiologicoLiberacionData[] = [];
  fechaPasteurizacion: Date | null = null;

  busquedaCicloLote: BusquedaCicloLote = {
    ciclo: '',
    lote: ''
  };

  datosFormulario: DatosFormulario = {
    fechaSiembra: null,
    horaSiembra: '',
    horaSiembraAux: null,
    fechaPrimeraLectura: null,
    horaPrimeraLectura: '',
    horaPrimeraLecturaAux: null,
    responsableSiembra: '',
    responsableLectura: '',
    responsableProcesamiento: '',
    coordinadorMedico: ''
  };

  opcionesEmpleados: EmpleadoOption[] = [];
  opcionesResponsables: { label: string; value: string }[] = [];
  opcionesCoordinadores: { label: string; value: string }[] = [];

  headersControlMicrobiologico: TableColumn[] = [
    { header: 'N° DE FRASCO\nPASTEURIZADO', field: 'numero_frasco_pasteurizado', width: '150px', tipo: 'text' },
    { header: 'COLIFORMES TOTALES\n(A=AUSENCIA/\nP=PRESENCIA)', field: 'coliformes_totales', width: '160px', tipo: 'radio' },
    { header: 'C=CONFORMIDAD\nNC=NO CONFORMIDAD', field: 'conformidad', width: '180px', tipo: 'radio' },
    { header: 'PC=PRUEBA CONFIRMATORIA', field: 'prueba_confirmatoria', width: '180px', tipo: 'radio' },
    { header: 'LIBERACIÓN DE\nPRODUCTO', field: 'liberacion_producto', width: '150px', tipo: 'radio' },
    { header: 'ESTADO', field: 'estado', width: '120px', tipo: 'status' }
  ];

  constructor(
    private readonly controlMicrobiologicoService: ControlMicrobiologicoLiberacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.mostrarMensaje('info', 'Información', 'Utilice la búsqueda por ciclo y lote para cargar los frascos pasteurizados');
    this.cargarEmpleados();
  }

  // ============= CARGA DE EMPLEADOS =============

  private cargarEmpleados(): void {
    this.loading.empleados = true;

    this.controlMicrobiologicoService.getEmpleados().subscribe({
      next: (empleados: EmpleadoOption[]) => {
        this.opcionesEmpleados = empleados;
        this.procesarOpcionesEmpleados(empleados);
        this.loading.empleados = false;
      },
      error: (error) => {
        this.loading.empleados = false;
        console.error('Error al cargar empleados:', error);
        this.mostrarMensaje('error', 'Error', 'Error al cargar empleados');
      }
    });
  }

  private procesarOpcionesEmpleados(empleados: EmpleadoOption[]): void {
    this.opcionesResponsables = empleados.map(emp => ({
      label: emp.nombre,
      value: emp.nombre
    }));

    this.opcionesCoordinadores = empleados
      .filter(emp =>
        emp.cargo.toLowerCase().includes('coordinador') ||
        emp.cargo.toLowerCase().includes('médico')
      )
      .map(emp => ({
        label: emp.nombre,
        value: emp.nombre
      }));
  }

  private obtenerAñoActualCorto(): string {
    const añoCompleto = new Date().getFullYear();
    return añoCompleto.toString().slice(-2);
  }

  private generarCodigoLHP(id: number): string {
    const añoActual = this.obtenerAñoActualCorto();
    return `LHP ${añoActual} ${id}`;
  }

  // ============= CARGA DE DATOS =============

  buscarFrascosPorCicloLote(): void {
    if (!this.validarBusqueda()) return;

    // Cancelar cualquier edición activa antes de buscar
    if (this.isAnyRowEditing()) {
      this.cancelarEdicionActual();
    }

    this.loading.search = true;
    const ciclo = parseInt(String(this.busquedaCicloLote.ciclo));
    const lote = parseInt(String(this.busquedaCicloLote.lote));

    this.controlMicrobiologicoService.getFrascosPasteurizadosPorCicloLote(ciclo, lote).subscribe({
      next: (frascos: FrascoPasteurizadoData[]) => {
        this.procesarResultadosBusqueda(frascos, ciclo, lote);
        this.loading.search = false;
      },
      error: (error) => {
        this.loading.search = false;
        this.mostrarMensaje('error', 'Error', 'Error al buscar frascos pasteurizados');
      }
    });
  }

  private procesarResultadosBusqueda(frascos: FrascoPasteurizadoData[], ciclo: number, lote: number): void {
    if (frascos.length === 0) {
      this.mostrarMensaje('info', 'Sin resultados', `No se encontraron frascos pasteurizados para el ciclo ${ciclo}, lote ${lote}`);
      this.dataControlMicrobiologico = [];
      this.fechaPasteurizacion = null;
      return;
    }

    this.fechaPasteurizacion = new Date(frascos[0].fechaPasteurizacion);

    // Limpiar estados de edición anteriores
    this.resetearEstadoEdicion();

    // Crear registros con UID únicos
    const nuevosRegistros = frascos.map((frasco, index) => this.crearRegistroDesdeFramco(frasco, ciclo, lote, index));

    // Reemplazar completamente los datos
    this.dataControlMicrobiologico = nuevosRegistros;

    this.mostrarMensaje('success', 'Búsqueda exitosa', `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} pasteurizado${frascos.length > 1 ? 's' : ''}`);
  }

  private crearRegistroDesdeFramco(frasco: FrascoPasteurizadoData, ciclo: number, lote: number, index: number): ControlMicrobiologicoLiberacionData {
    const timestamp = Date.now();
    const uniqueId = `search_${timestamp}_${ciclo}_${lote}_${index}_${frasco.numeroFrasco}`;

    return {
      id: null,
      numero_frasco_pasteurizado: this.generarCodigoLHP(frasco.numeroFrasco),
      id_frasco_pasteurizado: frasco.numeroFrasco,
      coliformes_totales: null,
      conformidad: null,
      prueba_confirmatoria: null,
      liberacion_producto: null,
      fecha_pasteurizacion: new Date(frasco.fechaPasteurizacion),
      ciclo: ciclo,
      lote: lote,
      _uid: uniqueId,
      isNew: true
    };
  }

  private validarBusqueda(): boolean {
    const cicloStr = String(this.busquedaCicloLote.ciclo || '').trim();
    const loteStr = String(this.busquedaCicloLote.lote || '').trim();

    const cicloValido = cicloStr && !isNaN(Number(cicloStr));
    const loteValido = loteStr && !isNaN(Number(loteStr));

    if (!cicloValido || !loteValido) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor ingrese valores válidos para el ciclo y lote');
      return false;
    }

    if (Number(cicloStr) <= 0 || Number(loteStr) <= 0) {
      this.mostrarMensaje('warn', 'Advertencia', 'El ciclo y lote deben ser números mayores a 0');
      return false;
    }

    return true;
  }

  limpiarBusqueda(): void {
    if (this.isAnyRowEditing()) {
      this.cancelarEdicionActual();
    }

    this.busquedaCicloLote = {
      ciclo: '',
      lote: ''
    };
    this.fechaPasteurizacion = null;
    this.dataControlMicrobiologico = [];
    this.resetearEstadoEdicion();
    this.limpiarFormulario();

    this.mostrarMensaje('info', 'Información', 'Búsqueda limpiada');
  }

  // ============= MANEJO DEL FORMULARIO Y GUARDADO COMPLETO =============

  limpiarFormulario(): void {
    this.datosFormulario = {
      fechaSiembra: null,
      horaSiembra: '',
      horaSiembraAux: null,
      fechaPrimeraLectura: null,
      horaPrimeraLectura: '',
      horaPrimeraLecturaAux: null,
      responsableSiembra: '',
      responsableLectura: '',
      responsableProcesamiento: '',
      coordinadorMedico: ''
    };
  }

  guardarFormulario(): void {
    // Procesar las horas antes de validar
    this.procesarHorasFormulario();

    // Validar que el formulario esté completo
    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos del formulario');
      return;
    }

    // Validar que todos los registros de la tabla estén completos
    if (!this.validarTodosLosRegistros()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los registros de la tabla antes de guardar');
      return;
    }

    // Cancelar cualquier edición activa
    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de guardar todo');
      return;
    }

    // Preparar payload completo
    const payload = this.prepararPayloadCompleto();

    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos para guardar');
      return;
    }

    // Enviar al backend
    this.enviarDatosCompletos(payload);
  }

  private procesarHorasFormulario(): void {
    if (this.datosFormulario.horaSiembraAux) {
      this.datosFormulario.horaSiembra = this.convertDateToHours(this.datosFormulario.horaSiembraAux);
    }

    if (this.datosFormulario.horaPrimeraLecturaAux) {
      this.datosFormulario.horaPrimeraLectura = this.convertDateToHours(this.datosFormulario.horaPrimeraLecturaAux);
    }
  }

  private convertDateToHours(fecha: Date): string {
    if (!fecha) return '';

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  private validarFormulario(): boolean {
    return !!(
      this.datosFormulario.fechaSiembra &&
      this.datosFormulario.horaSiembra &&
      this.datosFormulario.fechaPrimeraLectura &&
      this.datosFormulario.horaPrimeraLectura &&
      this.datosFormulario.responsableSiembra &&
      this.datosFormulario.responsableLectura &&
      this.datosFormulario.responsableProcesamiento &&
      this.datosFormulario.coordinadorMedico
    );
  }

  private validarTodosLosRegistros(): boolean {
    if (this.dataControlMicrobiologico.length === 0) {
      return false;
    }

    return this.dataControlMicrobiologico.every(registro =>
      this.validarCamposRequeridos(registro)
    );
  }

  private validarCamposRequeridos(dataRow: ControlMicrobiologicoLiberacionData): boolean {
    return !!(
      dataRow.numero_frasco_pasteurizado?.trim() &&
      (dataRow.coliformes_totales === 0 || dataRow.coliformes_totales === 1) &&
      (dataRow.conformidad === 0 || dataRow.conformidad === 1) &&
      (dataRow.liberacion_producto === 0 || dataRow.liberacion_producto === 1)
    );
  }

  private prepararPayloadCompleto(): PayloadControlMicrobiologico | null {
    try {
      const payload: PayloadControlMicrobiologico = {
        datosFormulario: {
          fechaSiembra: this.datosFormulario.fechaSiembra!,
          horaSiembra: this.datosFormulario.horaSiembra!,
          fechaPrimeraLectura: this.datosFormulario.fechaPrimeraLectura!,
          horaPrimeraLectura: this.datosFormulario.horaPrimeraLectura!,
          responsableSiembra: this.datosFormulario.responsableSiembra!,
          responsableLectura: this.datosFormulario.responsableLectura!,
          responsableProcesamiento: this.datosFormulario.responsableProcesamiento!,
          coordinadorMedico: this.datosFormulario.coordinadorMedico!
        },
        registrosControl: this.dataControlMicrobiologico.map(registro => ({
          numero_frasco_pasteurizado: registro.numero_frasco_pasteurizado,
          id_frasco_pasteurizado: registro.id_frasco_pasteurizado!,
          coliformes_totales: registro.coliformes_totales!,
          conformidad: registro.conformidad!,
          prueba_confirmatoria: registro.prueba_confirmatoria ?? null,
          liberacion_producto: registro.liberacion_producto!,
          fecha_pasteurizacion: registro.fecha_pasteurizacion!,
          ciclo: Number(registro.ciclo),
          lote: Number(registro.lote)
        }))
      };

      return payload;
    } catch (error) {
      console.error('Error al preparar payload:', error);
      return null;
    }
  }

  private enviarDatosCompletos(payload: PayloadControlMicrobiologico): void {
    this.loading.saving = true;

    this.controlMicrobiologicoService.guardarControlMicrobiologicoCompleto(payload).subscribe({
      next: (response) => {
        this.loading.saving = false;
        this.mostrarMensaje('success', 'Éxito', 'Todos los datos han sido guardados exitosamente');

        // Limpiar todo después de guardar exitosamente
        this.limpiarTodosDatos();
      },
      error: (error) => {
        this.loading.saving = false;
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar los datos. Por favor intente nuevamente');
      }
    });
  }

  private limpiarTodosDatos(): void {
    this.dataControlMicrobiologico = [];
    this.fechaPasteurizacion = null;
    this.busquedaCicloLote = { ciclo: '', lote: '' };
    this.limpiarFormulario();
    this.resetearEstadoEdicion();
  }

  // ============= EDICIÓN DE REGISTROS (Solo para completar, NO para guardar) =============

  onRowEditInit(dataRow: ControlMicrobiologicoLiberacionData): void {
    const currentRowId = this.getRowId(dataRow);

    if (this.isAnyRowEditing() && this.editingRowId !== currentRowId) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRowId = currentRowId;
  }

  onRowEditSave(dataRow: ControlMicrobiologicoLiberacionData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Solo confirmamos los cambios localmente, NO guardamos en el backend
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.resetearEstadoEdicion();

    this.mostrarMensaje('success', 'Confirmado', 'Registro completado. Recuerde guardar todos los datos al finalizar');
  }

  onRowEditCancel(dataRow: ControlMicrobiologicoLiberacionData, index: number): void {
    this.restaurarEstadoOriginal(dataRow);
    this.resetearEstadoEdicion();
  }

  // ============= ESTADOS DE EDICIÓN =============

  private guardarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);

    if (this.clonedData[rowId]) {
      const index = this.dataControlMicrobiologico.findIndex(item =>
        this.getRowId(item) === rowId
      );

      if (index !== -1) {
        Object.assign(this.dataControlMicrobiologico[index], this.clonedData[rowId]);
        delete this.clonedData[rowId];
        this.dataControlMicrobiologico = [...this.dataControlMicrobiologico];
      }
    }
  }

  private cancelarEdicionActual(): void {
    if (this.editingRowId) {
      const editingRow = this.dataControlMicrobiologico.find(item => this.getRowId(item) === this.editingRowId);
      if (editingRow) {
        this.restaurarEstadoOriginal(editingRow);
      }
      this.resetearEstadoEdicion();
    }
  }

  private resetearEstadoEdicion(): void {
    this.editingRowId = null;
    this.clonedData = {};
  }

  private getRowId(dataRow: ControlMicrobiologicoLiberacionData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= MÉTODOS DE VERIFICACIÓN DE ESTADO =============

  isEditing(rowData: ControlMicrobiologicoLiberacionData): boolean {
    if (!this.editingRowId || !rowData) {
      return false;
    }

    const currentRowId = this.getRowId(rowData);
    return this.editingRowId === currentRowId;
  }

  isAnyRowEditing(): boolean {
    return this.editingRowId !== null;
  }

  isEditButtonDisabled(rowData: ControlMicrobiologicoLiberacionData): boolean {
    if (!rowData) {
      return true;
    }

    const currentRowId = this.getRowId(rowData);
    return this.isAnyRowEditing() && this.editingRowId !== currentRowId;
  }

  // Nuevo método para verificar si un registro está completo
  isRegistroCompleto(rowData: ControlMicrobiologicoLiberacionData): boolean {
    return this.validarCamposRequeridos(rowData);
  }

  // Nuevo método para contar registros completos
  contarRegistrosCompletos(): number {
    return this.dataControlMicrobiologico.filter(registro =>
      this.isRegistroCompleto(registro)
    ).length;
  }

  // Nuevo método para verificar si se puede guardar
  puedeGuardar(): boolean {
    return this.dataControlMicrobiologico.length > 0 &&
           this.validarTodosLosRegistros() &&
           !this.isAnyRowEditing();
  }

  // ============= MÉTODOS HELPER PARA MOSTRAR VALORES =============

  getDisplayValueColiformes(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 1 ? 'A' : 'P';
  }

  getDisplayValueConformidad(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 1 ? 'C' : 'NC';
  }

  getDisplayValueLiberacion(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 1 ? 'Sí' : 'No';
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
