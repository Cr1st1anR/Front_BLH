// table-visita.component.ts - INTEGRAR API
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
import { VisitaTabla } from '../../interfaces/visita-seguimiento.interface';

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
export class TableVisitaComponent implements OnInit, OnChanges {
  @Input() idSeguimiento: number | null = null;
  @Input() codigoDonante: string | null = null; // AGREGAR este input
  @Output() eyeClicked = new EventEmitter<any>();

  @ViewChild('tableVisitas') table!: Table;

  loading: boolean = false;
  editingRow: any = null;
  hasNewRowInEditing: boolean = false;
  clonedVisitas: { [s: string]: any } = {};

  readonly headersTableVisita = [
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

  dataTableVisita: VisitaTabla[] = [];

  constructor(
    private readonly primaryDialogSeguimientoService: PrimaryDialogSeguimientoService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadDataTableVisita();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codigoDonante'] && changes['codigoDonante'].currentValue) {
      this.loadDataTableVisita();
    }
  }

  // MÉTODO ACTUALIZADO: Cargar datos desde API
  loadDataTableVisita(): void {
    this.loading = true;

    this.primaryDialogSeguimientoService.getTableVistaData(this.codigoDonante || undefined)
      .subscribe({
        next: (visitas: VisitaTabla[]) => {
          this.dataTableVisita = visitas;

          if (visitas.length > 0) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${visitas.length} visita${visitas.length > 1 ? 's' : ''} cargada${visitas.length > 1 ? 's' : ''}`,
              key: 'tr',
              life: 2000,
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'Información',
              detail: 'No hay visitas registradas para esta madre',
              key: 'tr',
              life: 2000,
            });
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar visitas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las visitas',
            key: 'tr',
            life: 3000,
          });
          this.loading = false;
        }
      });
  }

  // MÉTODO ACTUALIZADO: Crear nueva visita con API
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

  if (!this.codigoDonante) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se puede crear visita sin código de donante',
      key: 'tr',
      life: 3000,
    });
    return;
  }

  // ✅ CORRECCIÓN: Calcular número basado en orden cronológico
  const siguienteNumero = this.dataTableVisita.length + 1;

  const nuevaVisita: VisitaTabla = {
    id_visita: 0, // Temporal
    no_visita: siguienteNumero, // ✅ Número secuencial correcto
    fecha_visita: '',
    isNew: true
  };

  // ✅ AGREGAR AL FINAL (no al principio)
  this.dataTableVisita.push(nuevaVisita);
  this.dataTableVisita = [...this.dataTableVisita];
  this.hasNewRowInEditing = true;
  this.editingRow = nuevaVisita;

  setTimeout(() => {
    this.table.initRowEdit(nuevaVisita);
  }, 100);
}

  // MÉTODO ACTUALIZADO: Guardar con API
  // En table-visita.component.ts - MÉTODO onRowEditSave
  // CAMBIAR esta parte:

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

  // ✅ CORRECCIÓN PARA ZONA HORARIA
  let fechaParaAPI = '';
  let fechaParaMostrar = '';

  if (rowData.fecha_visita instanceof Date) {
    // Usar la fecha local sin conversión de zona horaria
    const year = rowData.fecha_visita.getFullYear();
    const month = (rowData.fecha_visita.getMonth() + 1).toString().padStart(2, '0');
    const day = rowData.fecha_visita.getDate().toString().padStart(2, '0');

    fechaParaAPI = `${year}-${month}-${day}`;
    fechaParaMostrar = `${day}/${month}/${year}`;
  } else if (typeof rowData.fecha_visita === 'string') {
    // Si ya es string, mantenerlo
    fechaParaAPI = rowData.fecha_visita;
    fechaParaMostrar = this.formatearFechaParaMostrar(rowData.fecha_visita);
  }

  // Actualizar para mostrar
  rowData.fecha_visita = fechaParaMostrar;

  const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

  if (rowData.isNew) {
    // ✅ CREAR NUEVA VISITA EN API
    this.primaryDialogSeguimientoService.crearNuevaVisita(this.codigoDonante!, fechaParaAPI)
      .subscribe({
        next: (response) => {
          console.log('Visita creada:', response);

          this.hasNewRowInEditing = false;
          this.editingRow = null;

          // ✅ RECARGAR DATOS para mantener orden correcto
          this.loadDataTableVisita();

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nueva visita creada correctamente',
            key: 'tr',
            life: 2000,
          });
        },
        error: (error) => {
          console.error('Error al crear visita:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la visita',
            key: 'tr',
            life: 3000,
          });
        }
      });
  } else {
    // ✅ ACTUALIZAR VISITA EXISTENTE EN API
    this.primaryDialogSeguimientoService.actualizarFechaVisita(rowData.id_visita, fechaParaAPI)
      .subscribe({
        next: (response) => {
          console.log('Visita actualizada:', response);
          delete this.clonedVisitas[rowData.id_visita as string];
          this.editingRow = null;
          this.table.saveRowEdit(rowData, rowElement);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Fecha de visita actualizada correctamente',
            key: 'tr',
            life: 2000,
          });
        },
        error: (error) => {
          console.error('Error al actualizar visita:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la fecha de visita',
            key: 'tr',
            life: 3000,
          });
        }
      });
  }
}

// ✅ AGREGAR ESTE MÉTODO AUXILIAR
private formatearFechaParaMostrar(fecha: string): string {
  if (!fecha) return 'Sin fecha';

  // Si viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
  if (fecha.includes('-')) {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  return fecha; // Si ya está en formato DD/MM/YYYY
}

  // MANTENER: Resto de métodos sin cambios
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
    if (this.editingRow || this.hasNewRowInEditing) return;
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

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing() && !this.isEditing(rowData);
  }

  isEyeButtonDisabled(rowData: any): boolean {
    return this.isAnyRowEditing();
  }
}
