import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { TableLecheExtraidaService } from './services/table-leche-extraida.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'table-leche-extraida',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    RadioButtonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    InputTextModule
  ],
  templateUrl: './table-leche-extraida.component.html',
  styleUrl: './table-leche-extraida.component.scss',
  providers: [TableLecheExtraidaService, MessageService]
})
export class TableLecheExtraidaComponent {

  @ViewChild('tableLecheExtraida') table!: Table;

  loading: boolean = false;
  hasNewRowInEditing: boolean = false;
  editingRow: any = null;
  clonedLecheExtraida: { [s: string]: any } = {};

  headersLecheExtraida: any[] = [
    {
      header: 'FECHA DE REGISTRO',
      field: 'fecha_registro',
      width: '200px',
      tipo: 'date',
    },
    {
      header: 'APELLIDOS Y NOMBRE',
      field: 'apellidos_nombre',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'EDAD',
      field: 'edad',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'IDENTIFICACIÓN',
      field: 'identificacion',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'MUNICIPIO',
      field: 'municipio',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'TELÉFONO',
      field: 'telefono',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'EPS',
      field: 'eps',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'PROCEDENCIA',
      field: 'procedencia',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'CONSEJERIA',
      field: 'consejeria',
      width: '320px',
      tipo: 'consejeria',
    },
    {
      header: 'ACCIONES',
      field: 'acciones',
      width: '120px',
      tipo: 'acciones',
    },
  ];

  dataLecheExtraida: any[] = [];
  private tempIdCounter: number = -1;

  constructor(
    private tableLecheExtraidaService: TableLecheExtraidaService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDataLecheExtraida();
  }

  loadDataLecheExtraida(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataLecheExtraida =
          this.tableLecheExtraidaService.getTableLecheExtraidaData();

        if (
          this.dataLecheExtraida &&
          this.dataLecheExtraida.length > 0
        ) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados correctamente',
            key: 'tr',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para mostrar',
            key: 'tr',
            life: 2000,
          });
        }
      } catch (error) {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al cargar los datos',
          key: 'tr',
          life: 3000,
        });
        console.error('Error al cargar datos:', error);
      } finally {
        this.loading = false;
      }
    }, 1200);
  }

  /**
   * Crear un nuevo registro en la tabla
   */
  crearNuevoRegistroLecheExtraida(): void {
    if (this.hasNewRowInEditing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar el registro actual antes de crear uno nuevo',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    const nuevoRegistro: any = {
      id_extraccion: null,
      fecha_registro: new Date().toLocaleDateString('es-ES'),
      apellidos_nombre: '',
      edad: '',
      identificacion: '',
      municipio: '',
      telefono: '',
      eps: '',
      procedencia: '',
      consejeria: {
        individual: null,
        grupal: null
      },
      _uid: `tmp_${this.tempIdCounter--}`,
      isNew: true
    };

    // Agregar al final del array
    this.dataLecheExtraida.push(nuevoRegistro);
    this.dataLecheExtraida = [...this.dataLecheExtraida];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevoRegistro;

    // Iniciar edición automáticamente
    setTimeout(() => this.table.initRowEdit(nuevoRegistro), 100);

    this.messageService.add({
      severity: 'info',
      summary: 'Nuevo registro',
      detail: 'Se ha creado un nuevo registro. Complete los campos requeridos.',
      key: 'tr',
      life: 2000,
    });
  }

  /**
   * Iniciar edición de una fila
   */
  onRowEditInit(dataRow: any): void {
    if (this.isAnyRowEditing()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la edición actual antes de editar otra fila.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Cancelar edición actual si existe
    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    this.clonedLecheExtraida[this.getRowId(dataRow)] = { ...dataRow };
    this.editingRow = dataRow;

    if (!dataRow.isNew) {
      this.hasNewRowInEditing = true;
    }
  }

  /**
   * Guardar edición de una fila
   */
  onRowEditSave(dataRow: any, index: number, event: MouseEvent): void {
    if (!this.validateRequiredFields(dataRow)) {
      return;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (dataRow.isNew) {
      this.guardarNuevoRegistro(dataRow, rowElement);
    } else {
      this.actualizarRegistroExistente(dataRow, rowElement);
    }
  }

  /**
   * Cancelar edición de una fila
   */
  onRowEditCancel(dataRow: any, index: number): void {
    if (dataRow.isNew) {
      // Eliminar registro nuevo
      this.dataLecheExtraida.splice(index, 1);
      this.dataLecheExtraida = [...this.dataLecheExtraida];
      this.hasNewRowInEditing = false;
    } else {
      // Restaurar valores originales
      const rowId = this.getRowId(dataRow);
      this.dataLecheExtraida[index] = this.clonedLecheExtraida[rowId];
      delete this.clonedLecheExtraida[rowId];
    }

    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  /**
   * Método para hacer clic en una fila (solo si no está en edición)
   */
  onRowClick(rowData: any): void {
    if (this.isAnyRowEditing()) return;
    console.log('Fila seleccionada:', rowData);
  }

  /**
   * Verificar si una fila está siendo editada
   */
  isEditing(rowData: any): boolean {
    return this.editingRow &&
      ((this.editingRow.id_extraccion === rowData.id_extraccion) ||
        (this.editingRow.isNew && rowData.isNew));
  }

  /**
   * Verificar si alguna fila está siendo editada
   */
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  /**
   * Verificar si el botón de editar está deshabilitado
   */
  isEditButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  /**
   * Obtener el valor de consejería de forma segura
   */
  getConsejeriaValue(rowData: any, type: 'individual' | 'grupal'): number | null {
    return rowData?.consejeria?.[type] ?? null;
  }

  /**
   * Actualizar el valor de consejería individual
   */
  onConsejeriaIndividualChange(rowIndex: number, value: number): void {
    if (!this.dataLecheExtraida[rowIndex].consejeria) {
      this.dataLecheExtraida[rowIndex].consejeria = {};
    }
    this.dataLecheExtraida[rowIndex].consejeria.individual = value;
  }

  /**
   * Actualizar el valor de consejería grupal
   */
  onConsejeriaGrupalChange(rowIndex: number, value: number): void {
    if (!this.dataLecheExtraida[rowIndex].consejeria) {
      this.dataLecheExtraida[rowIndex].consejeria = {};
    }
    this.dataLecheExtraida[rowIndex].consejeria.grupal = value;
  }

  // ========== MÉTODOS PRIVADOS ==========

  private getRowId(dataRow: any): string {
    return dataRow.id_extraccion?.toString() || dataRow._uid || 'unknown';
  }

  private validateRequiredFields(dataRow: any): boolean {
    const requiredFields = ['apellidos_nombre', 'edad', 'identificacion', 'municipio', 'telefono', 'eps', 'procedencia'];

    for (const field of requiredFields) {
      if (!dataRow[field] || dataRow[field].toString().trim() === '') {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: `El campo ${this.getFieldLabel(field)} es obligatorio`,
          key: 'tr',
          life: 3000,
        });
        return false;
      }
    }

    // Validar que al menos una opción de consejería esté seleccionada
    if (!dataRow.consejeria?.individual && !dataRow.consejeria?.grupal) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar al menos una opción de consejería (Individual o Grupal)',
        key: 'tr',
        life: 3000,
      });
      return false;
    }

    return true;
  }

  private getFieldLabel(field: string): string {
    const fieldLabels: { [key: string]: string } = {
      'apellidos_nombre': 'Apellidos y Nombre',
      'edad': 'Edad',
      'identificacion': 'Identificación',
      'municipio': 'Municipio',
      'telefono': 'Teléfono',
      'eps': 'EPS',
      'procedencia': 'Procedencia'
    };
    return fieldLabels[field] || field;
  }

  private guardarNuevoRegistro(dataRow: any, rowElement: HTMLTableRowElement): void {
    // Simular guardado en el servidor
    setTimeout(() => {
      // Asignar ID real (simulado)
      dataRow.id_extraccion = Date.now();
      dataRow.isNew = false;
      delete dataRow._uid;

      this.resetearEstadoEdicion();
      this.table.saveRowEdit(dataRow, rowElement);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Registro guardado correctamente',
        key: 'tr',
        life: 2000,
      });
    }, 500);
  }

  private actualizarRegistroExistente(dataRow: any, rowElement: HTMLTableRowElement): void {
    // Simular actualización en el servidor
    setTimeout(() => {
      const rowId = this.getRowId(dataRow);
      delete this.clonedLecheExtraida[rowId];
      this.editingRow = null;

      this.hasNewRowInEditing = false;

      this.table.saveRowEdit(dataRow, rowElement);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Registro actualizado correctamente',
        key: 'tr',
        life: 2000,
      });
    }, 500);
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow?.isNew) {
      // Eliminar fila nueva
      const index = this.dataLecheExtraida.findIndex(item =>
        item._uid === this.editingRow._uid
      );
      if (index !== -1) {
        this.dataLecheExtraida.splice(index, 1);
        this.dataLecheExtraida = [...this.dataLecheExtraida];
      }
    } else {
      // Restaurar valores originales
      const rowId = this.getRowId(this.editingRow);
      const index = this.dataLecheExtraida.findIndex(item =>
        this.getRowId(item) === rowId
      );
      if (index !== -1 && this.clonedLecheExtraida[rowId]) {
        this.dataLecheExtraida[index] = this.clonedLecheExtraida[rowId];
        delete this.clonedLecheExtraida[rowId];
      }
    }

    // Siempre resetear ambos estados
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }
}
