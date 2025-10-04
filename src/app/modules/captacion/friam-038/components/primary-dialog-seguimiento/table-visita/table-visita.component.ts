import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { PrimaryDialogSeguimientoService } from '../services/primary-dialog-seguimiento.service';
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
  providers: [MessageService],
})
export class TableVisitaComponent implements OnInit, OnChanges {
  @Input() codigoDonante: string | null = null;
  @Output() eyeClicked = new EventEmitter<any>();

  @ViewChild('tableVisitas') table!: Table;

  loading: boolean = false;
  editingRow: any = null;
  hasNewRowInEditing: boolean = false;
  clonedVisitas: { [s: string]: any } = {};
  dataTableVisita: VisitaTabla[] = [];

  private isInitialLoad: boolean = true;

  readonly headersTableVisita = [
    { header: 'No. visita', field: 'no_visita', width: '100px', tipo: 'number' },
    { header: 'FECHA DE VISITA', field: 'fecha_visita', width: '200px', tipo: 'date' },
    { header: 'VISTA RAPIDA', field: 'vista_rapida', width: '50px' },
    { header: 'ACCIONES', field: 'acciones', width: '120px' },
  ];

  constructor(
    private readonly primaryDialogSeguimientoService: PrimaryDialogSeguimientoService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (this.codigoDonante) {
      this.loadDataTableVisita();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codigoDonante']?.currentValue && !this.isInitialLoad) {
      this.loadDataTableVisita();
    } else if (changes['codigoDonante']?.currentValue && this.isInitialLoad) {
      this.loadDataTableVisita();
      this.isInitialLoad = false;
    }
  }

  loadDataTableVisita(): void {
    if (!this.codigoDonante) return;

    if (this.loading) return;

    this.loading = true;

    this.primaryDialogSeguimientoService.getTableVistaData(this.codigoDonante)
      .subscribe({
        next: (visitas: VisitaTabla[]) => {
          this.dataTableVisita = visitas;
          this.mostrarMensajeCarga(visitas);
          this.loading = false;
        },
        error: (error) => {
          this.manejarErrorCarga(error);
          this.loading = false;
        }
      });
  }

  crearNuevaVisita(): void {
    if (!this.validarCreacionVisita()) return;

    const nuevaVisita: VisitaTabla = {
      id_visita: 0,
      no_visita: this.dataTableVisita.length + 1,
      fecha_visita: '',
      isNew: true
    };

    this.dataTableVisita.push(nuevaVisita);
    this.dataTableVisita = [...this.dataTableVisita];
    this.hasNewRowInEditing = true;
    this.editingRow = nuevaVisita;

    setTimeout(() => this.table.initRowEdit(nuevaVisita), 100);
  }


  onRowEditSave(rowData: any, index: number, event: MouseEvent): void {
    if (!rowData.fecha_visita) {
      this.mostrarError('La fecha de visita es obligatoria');
      return;
    }

    const { fechaParaAPI, fechaParaMostrar } = this.procesarFecha(rowData.fecha_visita);
    rowData.fecha_visita = fechaParaMostrar;

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    if (rowData.isNew) {
      this.guardarNuevaVisita(fechaParaAPI);
    } else {
      this.actualizarVisitaExistente(rowData, fechaParaAPI, rowElement);
    }
  }


  onRowEditInit(rowData: any): void {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de editar otra fila.');
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


  onRowClick(row: any): void {
    if (this.isAnyRowEditing()) return;

    console.log('Fila seleccionada:', row);
    this.router.navigate(['/blh/captacion/visitas-domiciliarias-seguimiento'], {
      queryParams: { noVisita: row.no_visita },
    });
  }

  onEyeClick(row: any, event: Event): void {
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


  private validarCreacionVisita(): boolean {
    if (this.isAnyRowEditing()) {
      this.mostrarAdvertencia('Debe guardar o cancelar la edición actual antes de crear una nueva visita');
      return false;
    }

    if (!this.codigoDonante) {
      this.mostrarError('No se puede crear visita sin código de donante');
      return false;
    }

    return true;
  }

  private procesarFecha(fecha: any): { fechaParaAPI: string; fechaParaMostrar: string } {
    if (fecha instanceof Date) {
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');

      return {
        fechaParaAPI: `${year}-${month}-${day}`,
        fechaParaMostrar: `${day}/${month}/${year}`
      };
    }

    return {
      fechaParaAPI: fecha,
      fechaParaMostrar: this.formatearFechaParaMostrar(fecha)
    };
  }

  private formatearFechaParaMostrar(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    if (fecha.includes('-')) {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }

    return fecha;
  }

  private guardarNuevaVisita(fechaParaAPI: string): void {
    this.primaryDialogSeguimientoService.crearNuevaVisita(this.codigoDonante!, fechaParaAPI)
      .subscribe({
        next: (response) => {
          console.log('Visita creada:', response);
          this.resetearEstadoEdicion();
          this.loadDataTableVisita();
          this.mostrarExito('Nueva visita creada correctamente');
        },
        error: (error) => {
          console.error('Error al crear visita:', error);
          this.mostrarError('Error al crear la visita');
        }
      });
  }

  private actualizarVisitaExistente(rowData: any, fechaParaAPI: string, rowElement: HTMLTableRowElement): void {
    this.primaryDialogSeguimientoService.actualizarFechaVisita(rowData.id_visita, fechaParaAPI)
      .subscribe({
        next: (response) => {
          console.log('Visita actualizada:', response);
          delete this.clonedVisitas[rowData.id_visita as string];
          this.editingRow = null;
          this.table.saveRowEdit(rowData, rowElement);
          this.mostrarExito('Fecha de visita actualizada correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar visita:', error);
          this.mostrarError('Error al actualizar la fecha de visita');
        }
      });
  }

  private resetearEstadoEdicion(): void {
    this.hasNewRowInEditing = false;
    this.editingRow = null;
  }

  private mostrarMensajeCarga(visitas: VisitaTabla[]): void {
    if (visitas.length > 0) {
      this.mostrarExito(`${visitas.length} visita${visitas.length > 1 ? 's' : ''} cargada${visitas.length > 1 ? 's' : ''}`);
    } else {
      this.mostrarInfo('No hay visitas registradas para esta madre');
    }
  }

  private manejarErrorCarga(error: any): void {
    console.error('Error al cargar visitas:', error);
    this.mostrarError('Error al cargar las visitas');
  }

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje, key: 'tr', life: 2000 });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarAdvertencia(mensaje: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarInfo(mensaje: string): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: mensaje, key: 'tr', life: 2000 });
  }
}
