import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TableMadresSeguimientoService } from './services/table-madres-seguimiento.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'table-madres-seguimiento',
  imports: [TableModule, CommonModule, ProgressSpinnerModule, ToastModule],
  templateUrl: './table-madres-seguimiento.component.html',
  styleUrl: './table-madres-seguimiento.component.scss',
  providers: [TableMadresSeguimientoService, MessageService],
})
export class TableMadresSeguimientoComponent implements OnInit {
  @Output() rowClick = new EventEmitter<any>();

  loading: boolean = false;

  headersMadresSeguimiento: any[] = [
    {
      header: 'CODIGO DE LA DONANTE',
      field: 'codigo_donante',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'NOMBRES',
      field: 'nombres',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'APELLIDOS',
      field: 'apellidos',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'DONANTE',
      field: 'donante',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'FECHA DE VISITA',
      field: 'fecha_visita',
      width: '200px',
      tipo: 'date',
    },
  ];

  dataMadresSeguimiento: any[] = [];

  constructor(
    private _tableMadresSeguimientoService: TableMadresSeguimientoService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDataMadresSeguimiento();
  }

  loadDataMadresSeguimiento(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataMadresSeguimiento =
          this._tableMadresSeguimientoService.getTableMadresSeguimientoData();

        if (
          this.dataMadresSeguimiento &&
          this.dataMadresSeguimiento.length > 0
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

  onRowClick(row: any) {
    console.log('Fila seleccionada:', row);
    // Emitir el evento al componente padre en lugar de navegar directamente
    this.rowClick.emit(row);
  }
}
