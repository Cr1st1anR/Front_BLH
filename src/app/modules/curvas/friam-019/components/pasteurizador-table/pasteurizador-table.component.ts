import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule, Table } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import type {
  PasteurizadorData,
  LoadingState,
  TableColumn,
  TipoMensaje
} from '../../interfaces/construccion-curvas.interface';

@Component({
  selector: 'pasteurizador-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    HttpClientModule
  ],
  templateUrl: './pasteurizador-table.component.html',
  styleUrl: './pasteurizador-table.component.scss',
  providers: [MessageService]
})
export class PasteurizadorTableComponent implements OnInit {

  @ViewChild('tablePasteurizador') table!: Table;

  readonly loading: LoadingState = {
    main: false,
    responsables: false,
    volumenes: false,
    saving: false
  };

  editingRow: PasteurizadorData | null = null;
  clonedData: Record<string, PasteurizadorData> = {};
  hasNewRowInEditing = false;

  dataPasteurizador: PasteurizadorData[] = [];
  private contadorTiempo = 0;

  headersPasteurizador: TableColumn[] = [
    { header: 'TIEMPO', field: 'tiempo', width: '80px', tipo: 'readonly' },
    { header: 'T° FRASCO\nTESTIGO', field: 't_frasco_testigo_1', width: '100px', tipo: 'text' },
    { header: 'T° AGUA', field: 't_agua_1', width: '100px', tipo: 'text' },
    { header: 'TIEMPO', field: 'tiempo_2', width: '80px', tipo: 'readonly' },
    { header: 'T° FRASCO\nTESTIGO', field: 't_frasco_testigo_2', width: '100px', tipo: 'text' },
    { header: 'T° AGUA', field: 't_agua_2', width: '100px', tipo: 'text' },
    { header: 'TIEMPO', field: 'tiempo_3', width: '80px', tipo: 'readonly' },
    { header: 'T° FRASCO\nTESTIGO', field: 't_frasco_testigo_3', width: '100px', tipo: 'text' },
    { header: 'T° AGUA', field: 't_agua_3', width: '100px', tipo: 'text' }
  ];

  constructor(
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Componente listo
  }

  // ============= CREAR NUEVO REGISTRO =============
  crearNuevoRegistro(): void {
    if (this.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de crear un nuevo registro.');
      return;
    }

    const nuevoRegistro = this.createNewRecord();
    this.dataPasteurizador = [...this.dataPasteurizador, nuevoRegistro];
    this.hasNewRowInEditing = true;

    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);
    this.mostrarMensaje('info', 'Información', 'Se ha creado un nuevo registro. Complete los campos requeridos.');
  }

  private createNewRecord(): PasteurizadorData {
    const tiempoActual = this.contadorTiempo.toString();
    this.contadorTiempo++;

    return {
      id: null,
      tiempo: tiempoActual,
      t_frasco_testigo_1: '',
      t_agua_1: '',
      tiempo_2: tiempoActual,
      t_frasco_testigo_2: '',
      t_agua_2: '',
      tiempo_3: tiempoActual,
      t_frasco_testigo_3: '',
      t_agua_3: ''
    };
  }

  // ============= CRUD OPERATIONS =============
  onRowEditInit(dataRow: PasteurizadorData): void {
    if (this.isAnyRowEditing() && !this.isEditing(dataRow)) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual antes de editar otra fila.');
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: PasteurizadorData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) {
      this.mostrarMensaje('error', 'Error', 'Complete al menos una fase completa (T° Frasco Testigo y T° Agua)');
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.id === null) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: PasteurizadorData, index: number): void {
    if (dataRow.id === null) {
      this.removeNewRowFromData(dataRow);
      this.hasNewRowInEditing = false;
      this.contadorTiempo--;
    } else {
      this.restaurarEstadoOriginal(dataRow, index);
    }
    this.editingRow = null;
  }

  private guardarNuevoRegistro(dataRow: PasteurizadorData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    setTimeout(() => {
      dataRow.id = Date.now();
      this.procesarRespuestaCreacion(dataRow, rowElement);
    }, 300);
  }

  private actualizarRegistroExistente(dataRow: PasteurizadorData, rowElement: HTMLTableRowElement): void {
    this.loading.main = true;

    setTimeout(() => {
      this.procesarRespuestaActualizacion(dataRow, rowElement);
    }, 300);
  }

  private removeNewRowFromData(dataRow: PasteurizadorData): void {
    const index = this.dataPasteurizador.indexOf(dataRow);
    if (index > -1) {
      this.dataPasteurizador.splice(index, 1);
    }
  }

  private validarCamposRequeridos(dataRow: PasteurizadorData): boolean {
    // ✅ CAMBIO: Validar que al menos UNA fase esté completa
    const fase1Completa = !!(
      dataRow.t_frasco_testigo_1?.trim() &&
      dataRow.t_agua_1?.trim()
    );

    const fase2Completa = !!(
      dataRow.t_frasco_testigo_2?.trim() &&
      dataRow.t_agua_2?.trim()
    );

    const fase3Completa = !!(
      dataRow.t_frasco_testigo_3?.trim() &&
      dataRow.t_agua_3?.trim()
    );

    // Al menos una fase debe estar completa
    const alMenosUnaFaseCompleta = fase1Completa || fase2Completa || fase3Completa;

    if (!alMenosUnaFaseCompleta) {
      return false;
    }

    // ✅ VALIDACIÓN ADICIONAL: Si hay datos en una fase, debe estar completa
    // Fase 1: Si tiene frasco o agua, debe tener ambos
    const fase1Valida = !!(
      (!dataRow.t_frasco_testigo_1?.trim() && !dataRow.t_agua_1?.trim()) ||
      (dataRow.t_frasco_testigo_1?.trim() && dataRow.t_agua_1?.trim())
    );

    // Fase 2: Si tiene frasco o agua, debe tener ambos
    const fase2Valida = !!(
      (!dataRow.t_frasco_testigo_2?.trim() && !dataRow.t_agua_2?.trim()) ||
      (dataRow.t_frasco_testigo_2?.trim() && dataRow.t_agua_2?.trim())
    );

    // Fase 3: Si tiene frasco o agua, debe tener ambos
    const fase3Valida = !!(
      (!dataRow.t_frasco_testigo_3?.trim() && !dataRow.t_agua_3?.trim()) ||
      (dataRow.t_frasco_testigo_3?.trim() && dataRow.t_agua_3?.trim())
    );

    return fase1Valida && fase2Valida && fase3Valida;
  }

  private guardarEstadoOriginal(dataRow: PasteurizadorData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedData[rowId] = { ...dataRow };
  }

  private restaurarEstadoOriginal(dataRow: PasteurizadorData, index: number): void {
    const rowId = this.getRowId(dataRow);
    if (this.clonedData[rowId]) {
      this.dataPasteurizador[index] = this.clonedData[rowId];
      delete this.clonedData[rowId];
    }
  }

  private procesarRespuestaCreacion(dataRow: PasteurizadorData, rowElement: HTMLTableRowElement): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro guardado localmente');
  }

  private procesarRespuestaActualizacion(dataRow: PasteurizadorData, rowElement: HTMLTableRowElement): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.editingRow = null;
    this.table.saveRowEdit(dataRow, rowElement);
    this.loading.main = false;

    this.mostrarMensaje('success', 'Éxito', 'Registro actualizado localmente');
  }

  private getRowId(dataRow: PasteurizadorData): string {
    return dataRow.id?.toString() || 'new';
  }

  // ============= UTILIDADES DE ESTADO =============
  isEditing(rowData: PasteurizadorData): boolean {
    return this.editingRow !== null && this.editingRow.id === rowData.id;
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: PasteurizadorData): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // ============= MÉTODOS PÚBLICOS PARA EL COMPONENTE PADRE =============

  /**
   * Carga datos externos en la tabla
   */
  cargarDatosExternos(datos: PasteurizadorData[]): void {
    this.dataPasteurizador = datos;

    // Actualizar el contador de tiempo basado en el último valor
    if (datos.length > 0) {
      const ultimoTiempo = parseInt(datos[datos.length - 1].tiempo);
      this.contadorTiempo = isNaN(ultimoTiempo) ? datos.length : ultimoTiempo + 1;
    }
  }

  /**
   * Limpia todos los datos de la tabla
   */
  limpiarDatos(): void {
    this.dataPasteurizador = [];
    this.editingRow = null;
    this.clonedData = {};
    this.hasNewRowInEditing = false;
    this.contadorTiempo = 0;
  }

  /**
   * Valida si un registro está completo
   */
  validarRegistroCompleto(registro: PasteurizadorData): boolean {
    return this.validarCamposRequeridos(registro);
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
