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

  editingRow: ControlMicrobiologicoLiberacionData | null = null;
  hasNewRowInEditing = false;
  clonedData: Record<string, ControlMicrobiologicoLiberacionData> = {};
  tempIdCounter = -1;

  dataControlMicrobiologico: ControlMicrobiologicoLiberacionData[] = [];
  fechaPasteurizacion: Date | null = null;

  busquedaCicloLote: BusquedaCicloLote = {
    ciclo: '',
    lote: ''
  };

  headersControlMicrobiologico: TableColumn[] = [
    { header: 'N° DE FRASCO\nPASTEURIZADO', field: 'numero_frasco_pasteurizado', width: '180px', tipo: 'text' },
    { header: 'COLIFORMES TOTALES\n(A=AUSENCIA/\nP=PRESENCIA)', field: 'coliformes_totales', width: '200px', tipo: 'radio' },
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
    this.cargarControlesExistentes();
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

  private cargarControlesExistentes(): void {
    this.loading.main = true;

    this.controlMicrobiologicoService.getAllControlesMicrobiologicos().subscribe({
      next: (controles) => {
        this.dataControlMicrobiologico = controles;
        this.loading.main = false;
        this.mostrarMensajeExitosoCarga();
      },
      error: (error) => {
        this.loading.main = false;
        console.error('Error al cargar controles:', error);
        this.mostrarMensaje('error', 'Error', 'Error al cargar los controles microbiológicos');
      }
    });
  }

  buscarFrascosPorCicloLote(): void {
    if (!this.validarBusqueda()) return;

    this.loading.search = true;
    const ciclo = parseInt(this.busquedaCicloLote.ciclo);
    const lote = parseInt(this.busquedaCicloLote.lote);

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
      return;
    }

    // Establecer fecha de pasteurización (todos los frascos del mismo ciclo/lote tienen la misma fecha)
    this.fechaPasteurizacion = new Date(frascos[0].fechaPasteurizacion);

    // Limpiar registros anteriores de la búsqueda
    this.dataControlMicrobiologico = this.dataControlMicrobiologico.filter(item => !item.isNew);

    // Crear registros para cada frasco encontrado
    const nuevosRegistros = frascos.map(frasco => this.crearRegistroDesdeFramco(frasco, ciclo, lote));

    // Agregar los nuevos registros
    this.dataControlMicrobiologico.push(...nuevosRegistros);
    this.dataControlMicrobiologico = [...this.dataControlMicrobiologico];

    this.mostrarMensaje('success', 'Búsqueda exitosa', `Se encontraron ${frascos.length} frasco${frascos.length > 1 ? 's' : ''} pasteurizado${frascos.length > 1 ? 's' : ''}`);
  }

  private crearRegistroDesdeFramco(frasco: FrascoPasteurizadoData, ciclo: number, lote: number): ControlMicrobiologicoLiberacionData {
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
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };
  }

  private validarBusqueda(): boolean {
    const cicloValido = this.busquedaCicloLote.ciclo.trim() && !isNaN(Number(this.busquedaCicloLote.ciclo));
    const loteValido = this.busquedaCicloLote.lote.trim() && !isNaN(Number(this.busquedaCicloLote.lote));

    if (!cicloValido || !loteValido) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor ingrese valores válidos para el ciclo y lote');
      return false;
    }

    if (Number(this.busquedaCicloLote.ciclo) <= 0 || Number(this.busquedaCicloLote.lote) <= 0) {
      this.mostrarMensaje('warn', 'Advertencia', 'El ciclo y lote deben ser números mayores a 0');
      return false;
    }

    return true;
  }

  // ============= CRUD OPERATIONS =============

  onRowEditInit(dataRow: ControlMicrobiologicoLiberacionData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = false;
    }
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
    if (dataRow.isNew) {
      this.eliminarRegistroTemporal(dataRow);
      this.hasNewRowInEditing = false;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    const datosParaGuardar = this.prepararDatosParaCreacion(dataRow);

    this.controlMicrobiologicoService.postControlMicrobiologico(datosParaGuardar).subscribe({
      next: (response) => {
        this.procesarRespuestaCreacion(response.data, dataRow, rowElement);
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
      dataRow.coliformes_totales &&
      dataRow.conformidad &&
      dataRow.liberacion_producto
    );
  }

  // ============= ESTADOS DE EDICIÓN =============

  private guardarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: ControlMicrobiologicoLiberacionData, index: number): void {
    const rowId = this.getRowId(dataRow);
    this.dataControlMicrobiologico[index] = this.clonedData[rowId];
    delete this.clonedData[rowId];
  }

  private eliminarRegistroTemporal(dataRow: ControlMicrobiologicoLiberacionData): void {
    const index = this.dataControlMicrobiologico.findIndex(item =>
      item._uid === dataRow._uid || (item.id === dataRow.id && dataRow.isNew)
    );

    if (index !== -1) {
      this.dataControlMicrobiologico.splice(index, 1);
      this.dataControlMicrobiologico = [...this.dataControlMicrobiologico];
    }
  }

  private procesarRespuestaCreacion(responseData: ControlMicrobiologicoLiberacionData, dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    dataRow.isNew = false;
    dataRow.id = responseData.id;
    delete dataRow._uid;

    this.resetearEstadoEdicion();
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Control microbiológico guardado exitosamente');
  }

  private procesarRespuestaActualizacion(dataRow: ControlMicrobiologicoLiberacionData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.mostrarMensaje('success', 'Éxito', 'Control microbiológico actualizado exitosamente');
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  // ============= UTILIDADES DE ESTADO =============

  isEditing(rowData: ControlMicrobiologicoLiberacionData): boolean {
    return this.editingRow !== null && (
      (this.editingRow._uid && this.editingRow._uid === rowData._uid) ||
      (this.editingRow.id === rowData.id)
    );
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: ControlMicrobiologicoLiberacionData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  private getRowId(dataRow: ControlMicrobiologicoLiberacionData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  limpiarBusqueda(): void {
    this.busquedaCicloLote = {
      ciclo: '',
      lote: ''
    };
    this.fechaPasteurizacion = null;

    // Remover registros temporales
    this.dataControlMicrobiologico = this.dataControlMicrobiologico.filter(item => !item.isNew);
    this.dataControlMicrobiologico = [...this.dataControlMicrobiologico];

    this.mostrarMensaje('info', 'Información', 'Búsqueda limpiada');
  }

  // ============= MENSAJES =============

  private mostrarMensajeExitosoCarga(): void {
    const cantidad = this.dataControlMicrobiologico.length;
    const mensaje = cantidad > 0
      ? `${cantidad} control${cantidad > 1 ? 'es' : ''} microbiológico${cantidad > 1 ? 's' : ''} cargado${cantidad > 1 ? 's' : ''}`
      : 'No se encontraron controles microbiológicos en la base de datos';

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
