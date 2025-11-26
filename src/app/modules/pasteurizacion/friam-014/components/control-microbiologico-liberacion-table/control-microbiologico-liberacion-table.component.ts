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

import { ControlMicrobiologicoLiberacionService } from '../../services/control-microbiologico-liberacion.service';
import type {
  ControlMicrobiologicoLiberacionData,
  LoadingState,
  TableColumn,
  BusquedaCicloLote,
  FrascoPasteurizadoData,
  TipoMensaje
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
    RadioButtonModule
  ],
  templateUrl: './control-microbiologico-liberacion-table.component.html',
  styleUrl: './control-microbiologico-liberacion-table.component.scss',
  providers: [MessageService]
})
export class ControlMicrobiologicoLiberacionTableComponent implements OnInit {

  @ViewChild('tableControlMicrobiologico') table!: Table;

  readonly loading: LoadingState = {
    main: false,
    search: false
  };

  // Estados de edición - usar identificación única más específica
  editingRowId: string | null = null;
  clonedData: Record<string, ControlMicrobiologicoLiberacionData> = {};
  tempIdCounter = -1;

  dataControlMicrobiologico: ControlMicrobiologicoLiberacionData[] = [];
  fechaPasteurizacion: Date | null = null;

  busquedaCicloLote: BusquedaCicloLote = {
    ciclo: '',
    lote: ''
  };

  headersControlMicrobiologico: TableColumn[] = [
    { header: 'N° DE FRASCO\nPASTEURIZADO', field: 'numero_frasco_pasteurizado', width: '150px', tipo: 'text' },
    { header: 'COLIFORMES TOTALES\n(A=AUSENCIA/\nP=PRESENCIA)', field: 'coliformes_totales', width: '160px', tipo: 'radio' },
    { header: 'C=CONFORMIDAD\nNC=NO CONFORMIDAD', field: 'conformidad', width: '180px', tipo: 'radio' },
    { header: 'PC=PRUEBA CONFIRMATORIA', field: 'prueba_confirmatoria', width: '180px', tipo: 'radio' },
    { header: 'LIBERACIÓN DE\nPRODUCTO', field: 'liberacion_producto', width: '150px', tipo: 'radio' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly controlMicrobiologicoService: ControlMicrobiologicoLiberacionService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.mostrarMensaje('info', 'Información', 'Utilice la búsqueda por ciclo y lote para cargar los frascos pasteurizados');
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
        console.error('Error en búsqueda:', error);
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

    // Limpiar estados de edición anteriores COMPLETAMENTE
    this.resetearEstadoEdicion();

    // Crear registros con UID únicos y secuenciales
    const nuevosRegistros = frascos.map((frasco, index) => this.crearRegistroDesdeFramco(frasco, ciclo, lote, index));

    // Reemplazar completamente los datos
    this.dataControlMicrobiologico = nuevosRegistros;

    console.log('Registros creados:', this.dataControlMicrobiologico.map(r => ({ uid: r._uid, numero: r.numero_frasco_pasteurizado })));

    this.mostrarMensaje('success', 'Búsqueda exitosa', `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} pasteurizado${frascos.length > 1 ? 's' : ''}`);
  }

  private crearRegistroDesdeFramco(frasco: FrascoPasteurizadoData, ciclo: number, lote: number, index: number): ControlMicrobiologicoLiberacionData {
    // Crear UID único basado en timestamp, ciclo, lote e índice para garantizar unicidad
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
    // Cancelar cualquier edición activa antes de limpiar
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

    this.mostrarMensaje('info', 'Información', 'Búsqueda limpiada');
  }

  // ============= CRUD OPERATIONS (Corregido) =============

  onRowEditInit(dataRow: ControlMicrobiologicoLiberacionData): void {
    const currentRowId = this.getRowId(dataRow);

    // Verificar si hay otra fila siendo editada
    if (this.isAnyRowEditing() && this.editingRowId !== currentRowId) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    // Guardar estado original usando UID único
    this.guardarEstadoOriginal(dataRow);

    // Establecer el ID de la fila actual como editando
    this.editingRowId = currentRowId;

    console.log('Editando fila ID:', this.editingRowId, 'Número frasco:', dataRow.numero_frasco_pasteurizado);
  }

  onRowEditSave(dataRow: ControlMicrobiologicoLiberacionData, index: number, event: MouseEvent): void {
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

  onRowEditCancel(dataRow: ControlMicrobiologicoLiberacionData, index: number): void {
    // Restaurar estado original
    this.restaurarEstadoOriginal(dataRow);

    // Resetear estado de edición
    this.resetearEstadoEdicion();
  }

  private guardarNuevoRegistro(dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    const datosBackend = this.prepararDatosParaCreacion(dataRow);

    this.controlMicrobiologicoService.postControlMicrobiologico(datosBackend).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response, dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al guardar el control microbiológico');
      }
    });
  }

  private actualizarRegistroExistente(dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    this.controlMicrobiologicoService.putControlMicrobiologico(dataRow.id!, dataRow).subscribe({
      next: (response) => {
        this.procesarRespuestaActualizacion(dataRow, rowElement);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('error', 'Error', 'Error al actualizar el control microbiológico');
      }
    });
  }

  private procesarRespuestaCreacion(response: any, dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = response.data.id;
    delete dataRow._uid;

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Control microbiológico guardado exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Control microbiológico actualizado exitosamente');
  }

  private prepararDatosParaCreacion(dataRow: ControlMicrobiologicoLiberacionData): Omit<ControlMicrobiologicoLiberacionData, 'id'> {
    return {
      numero_frasco_pasteurizado: dataRow.numero_frasco_pasteurizado,
      id_frasco_pasteurizado: dataRow.id_frasco_pasteurizado,
      coliformes_totales: dataRow.coliformes_totales,
      conformidad: dataRow.conformidad,
      prueba_confirmatoria: dataRow.prueba_confirmatoria,
      liberacion_producto: dataRow.liberacion_producto,
      fecha_pasteurizacion: dataRow.fecha_pasteurizacion,
      ciclo: dataRow.ciclo,
      lote: dataRow.lote
    };
  }

  // ============= VALIDACIONES =============

  private validarCamposRequeridos(dataRow: ControlMicrobiologicoLiberacionData): boolean {
    return !!(
      dataRow.numero_frasco_pasteurizado?.trim() &&
      (dataRow.coliformes_totales === 0 || dataRow.coliformes_totales === 1) &&
      (dataRow.conformidad === 0 || dataRow.conformidad === 1) &&
      (dataRow.liberacion_producto === 0 || dataRow.liberacion_producto === 1)
    );
  }

  // ============= ESTADOS DE EDICIÓN (Corregido con ID específico) =============

  private guardarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
    console.log('Estado original guardado para:', rowId);
  }

  private restaurarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);

    if (this.clonedData[rowId]) {
      const index = this.dataControlMicrobiologico.findIndex(item =>
        this.getRowId(item) === rowId
      );

      if (index !== -1) {
        // Restaurar todos los valores del objeto original
        Object.assign(this.dataControlMicrobiologico[index], this.clonedData[rowId]);
        delete this.clonedData[rowId];

        // Forzar actualización de la vista
        this.dataControlMicrobiologico = [...this.dataControlMicrobiologico];
        console.log('Estado restaurado para:', rowId);
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
    console.log('Reseteando estado de edición');
    this.editingRowId = null;
    this.clonedData = {}; // Limpiar completamente
  }

  private getRowId(dataRow: ControlMicrobiologicoLiberacionData): string {
    // Usar UID si existe, sino usar ID, sino 'unknown'
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= MÉTODOS DE VERIFICACIÓN DE ESTADO (Corregidos) =============

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

  // ============= MÉTODOS HELPER PARA MOSTRAR VALORES =============

  /**
 * Método helper para verificar si una fila específica está en edición
 * Usado para debugging y mayor claridad en el template
 */
isRowCurrentlyEditing(rowData: ControlMicrobiologicoLiberacionData): boolean {
  const currentRowId = this.getRowId(rowData);
  const isCurrentlyEditing = this.editingRowId === currentRowId;

  // Log para debugging (puedes remover en producción)
  if (isCurrentlyEditing) {
    console.log(`✓ Fila en edición: ${currentRowId} (${rowData.numero_frasco_pasteurizado})`);
  }

  return isCurrentlyEditing;
}

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
