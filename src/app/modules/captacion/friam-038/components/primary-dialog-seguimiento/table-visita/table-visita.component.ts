import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { PrimaryDialogSeguimientoService } from '../services/primary-dialog-seguimiento.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'table-visita-seguimiento',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule,
    ButtonModule,
    TooltipModule,
    DatePickerModule,
    FormsModule
  ],
  templateUrl: './table-visita.component.html',
  styleUrl: './table-visita.component.scss',
  providers: [PrimaryDialogSeguimientoService, MessageService],
})
export class TableVisitaComponent implements OnInit {
  @Input() idSeguimiento: number | null = null;
  @Output() eyeClicked = new EventEmitter<any>();

  @ViewChild('tableVisitas') table!: Table;

  loading: boolean = false;
  editingRow: any = null;
  hasNewRowInEditing: boolean = false;
  clonedVisitas: { [s: string]: any } = {};

  headersTableVisita: any[] = [
    {
      header: 'No. visita',
      field: 'no_visita',
      width: '100px',
      tipo: 'number',
    },
    {
      header: 'FECHA DE VISITA',
      field: 'fecha_visita',
      width: '200px',
      tipo: 'date',
    },
    {
      header: 'VISTA RAPIDA',
      field: 'vista_rapida',
      width: '50px',
    },
    {
      header: 'ACCIONES',
      field: 'acciones',
      width: '120px',
    },
  ];

  dataTableVisita: any[] = [];

  constructor(
    private _primaryDialogSeguimientoService: PrimaryDialogSeguimientoService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDataTableVisita();
  }

  loadDataTableVisita(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataTableVisita =
          this._primaryDialogSeguimientoService.getTableVistaData(
            this.idSeguimiento || undefined
          );

        if (this.dataTableVisita && this.dataTableVisita.length > 0) {
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

  crearNuevaVisita() {
    if (this.hasNewRowInEditing || this.editingRow) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la edición actual antes de crear una nueva visita',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Calcular el siguiente número de visita
    const maxNoVisita = this.dataTableVisita.length > 0
      ? Math.max(...this.dataTableVisita.map(v => v.no_visita || 0))
      : 0;

    const nuevaVisita = {
      id_visita: null,
      no_visita: maxNoVisita + 1,
      fecha_visita: null,
      id_seguimiento: this.idSeguimiento,
      isNew: true // Marcador para identificar registros nuevos
    };

    // Añadir al final de la tabla (push en lugar de unshift)
    this.dataTableVisita.push(nuevaVisita);
    this.dataTableVisita = [...this.dataTableVisita];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevaVisita;

    setTimeout(() => {
      this.table.initRowEdit(nuevaVisita);
    }, 100);
  }

  onRowEditInit(rowData: any): void {
    if (this.hasNewRowInEditing || this.editingRow) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la edición actual antes de editar otra fila.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    this.editingRow = { ...rowData };
    this.clonedVisitas[rowData.id_visita as string] = { ...rowData };
  }

  onRowEditSave(rowData: any, index: number, event: MouseEvent) {
    if (!rowData.fecha_visita) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de visita es obligatoria',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Formatear la fecha
    if (rowData.fecha_visita instanceof Date) {
      const day = rowData.fecha_visita.getDate().toString().padStart(2, '0');
      const month = (rowData.fecha_visita.getMonth() + 1).toString().padStart(2, '0');
      const year = rowData.fecha_visita.getFullYear();
      rowData.fecha_visita = `${day}/${month}/${year}`;
    }

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (rowData.isNew) {
      // Lógica para guardar nueva visita
      console.log('Guardando nueva visita:', rowData);
      delete rowData.isNew;
      rowData.id_visita = Date.now(); // Simulamos un ID generado
      this.hasNewRowInEditing = false;
    } else {
      // Lógica para actualizar visita existente
      console.log('Actualizando visita:', rowData);
      delete this.clonedVisitas[rowData.id_visita as string];
    }

    // Cerrar el modo de edición y limpiar variables
    this.editingRow = null;

    // Importante: cerrar el modo de edición en la tabla
    this.table.saveRowEdit(rowData, rowElement);

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Visita guardada correctamente',
      key: 'tr',
      life: 2000,
    });
  }

  onRowEditCancel(rowData: any, index: number): void {
    if (rowData.isNew) {
      this.dataTableVisita.splice(index, 1);
      this.dataTableVisita = [...this.dataTableVisita];
      this.hasNewRowInEditing = false;
    } else {
      this.dataTableVisita[index] = this.clonedVisitas[rowData.id_visita as string];
      delete this.clonedVisitas[rowData.id_visita as string];
    }
    this.editingRow = null;
  }

  onRowClick(row: any) {
    if (this.editingRow || this.hasNewRowInEditing) return; // No permitir navegación si hay una fila en edición

    console.log('Fila seleccionada:', row);
    this.router.navigate(['/blh/captacion/visitas-domiciliarias-seguimiento'], {
      queryParams: { noVisita: row.no_visita },
    });
  }

  onEyeClick(row: any, event: Event) {
    event.stopPropagation();
    console.log('Icono ojo clickeado para:', row);
    this.eyeClicked.emit(row);
  }

  isEditing(rowData: any): boolean {
    return this.editingRow &&
           ((this.editingRow.id_visita === rowData.id_visita) ||
            (this.editingRow.isNew && rowData.isNew));
  }

  // Método para verificar si hay alguna fila en edición
  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  // Método para verificar si un botón específico debe estar deshabilitado
  isEditButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  // Método para verificar si el botón de ojo debe estar deshabilitado
  isEyeButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing();
  }
}
