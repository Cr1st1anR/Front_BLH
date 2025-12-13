import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';

import type {
  ControlMicrobiologicoLiberacionData,
  TableColumn
} from '../../interfaces/control-microbiologico-liberacion.interface';

@Component({
  selector: 'control-microbiologico-liberacion-table',
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    RadioButtonModule
  ],
  templateUrl: './control-microbiologico-liberacion-table.component.html',
  styleUrl: './control-microbiologico-liberacion-table.component.scss'
})
export class ControlMicrobiologicoLiberacionTableComponent {

  @Input() dataControlMicrobiologico: ControlMicrobiologicoLiberacionData[] = [];

  editingRowId: string | null = null;
  clonedData: Record<string, ControlMicrobiologicoLiberacionData> = {};

  headersControlMicrobiologico: TableColumn[] = [
    { header: 'N° DE FRASCO\nPASTEURIZADO', field: 'numero_frasco_pasteurizado', width: '150px', tipo: 'text' },
    { header: 'COLIFORMES TOTALES\n(A=AUSENCIA/\nP=PRESENCIA)', field: 'coliformes_totales', width: '160px', tipo: 'radio' },
    { header: 'C=CONFORMIDAD\nNC=NO CONFORMIDAD', field: 'conformidad', width: '180px', tipo: 'radio' },
    { header: 'PC=PRUEBA CONFIRMATORIA', field: 'prueba_confirmatoria', width: '180px', tipo: 'radio' },
    { header: 'LIBERACIÓN DE\nPRODUCTO', field: 'liberacion_producto', width: '150px', tipo: 'radio' },
    { header: 'ESTADO', field: 'estado', width: '120px', tipo: 'status' }
  ];

  // ============= EDICIÓN DE REGISTROS =============

  onRowEditInit(dataRow: ControlMicrobiologicoLiberacionData): void {
    const currentRowId = this.getRowId(dataRow);

    if (this.isAnyRowEditing() && this.editingRowId !== currentRowId) {
      return;
    }

    this.guardarEstadoOriginal(dataRow);
    this.editingRowId = currentRowId;
  }

  onRowEditSave(dataRow: ControlMicrobiologicoLiberacionData): void {
    const rowId = this.getRowId(dataRow);
    delete this.clonedData[rowId];
    this.resetearEstadoEdicion();
  }

  onRowEditCancel(dataRow: ControlMicrobiologicoLiberacionData): void {
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

  private resetearEstadoEdicion(): void {
    this.editingRowId = null;
    this.clonedData = {};
  }

  private getRowId(dataRow: ControlMicrobiologicoLiberacionData): string {
    return dataRow._uid || dataRow.id?.toString() || 'unknown';
  }

  // ============= MÉTODOS PÚBLICOS PARA EL PAGE =============

  public isEditing(rowData: ControlMicrobiologicoLiberacionData): boolean {
    if (!this.editingRowId || !rowData) {
      return false;
    }

    const currentRowId = this.getRowId(rowData);
    return this.editingRowId === currentRowId;
  }

  public isAnyRowEditing(): boolean {
    return this.editingRowId !== null;
  }

  public isEditButtonDisabled(rowData: ControlMicrobiologicoLiberacionData): boolean {
    if (!rowData) {
      return true;
    }

    const currentRowId = this.getRowId(rowData);
    return this.isAnyRowEditing() && this.editingRowId !== currentRowId;
  }

  public validarRegistroCompleto(rowData: ControlMicrobiologicoLiberacionData): boolean {
    return !!(
      rowData.numero_frasco_pasteurizado?.trim() &&
      (rowData.coliformes_totales === 0 || rowData.coliformes_totales === 1) &&
      (rowData.conformidad === 0 || rowData.conformidad === 1) &&
      (rowData.liberacion_producto === 0 || rowData.liberacion_producto === 1)
      // Nota: prueba_confirmatoria no es obligatorio (puede ser 0 o 1)
    );
  }

  // ============= MÉTODOS HELPER PARA MOSTRAR VALORES =============

  /**
   * Coliformes Totales:
   * 0 = Ausencia (A)
   * 1 = Presencia (P)
   */
  getDisplayValueColiformes(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 0 ? 'A' : 'P';
  }

  /**
   * Conformidad:
   * 0 = No Conformidad (NC)
   * 1 = Conformidad (C)
   */
  getDisplayValueConformidad(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 1 ? 'C' : 'NC';
  }

  /**
   * Prueba Confirmatoria:
   * 0 = Vacía (sin marcar)
   * 1 = PC
   */
  getDisplayValuePruebaConfirmatoria(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return '-';
    return value === 1 ? 'PC' : '-';
  }

  /**
   * Liberación de Producto:
   * 0 = No
   * 1 = Sí
   */
  getDisplayValueLiberacion(value: 0 | 1 | null): string {
    if (value === null || value === undefined) return 'No seleccionado';
    return value === 1 ? 'Sí' : 'No';
  }
}
