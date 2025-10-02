import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TableMadresSeguimientoService } from './services/table-madres-seguimiento.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import type { MadreDonante, MadreTabla } from '../interfaces/madre-donante.interface';

@Component({
  selector: 'table-madres-seguimiento',
  imports: [TableModule, CommonModule, ProgressSpinnerModule, ToastModule],
  templateUrl: './table-madres-seguimiento.component.html',
  styleUrl: './table-madres-seguimiento.component.scss',
  providers: [TableMadresSeguimientoService, MessageService],
})
export class TableMadresSeguimientoComponent implements OnInit {
  @Output() rowClick = new EventEmitter<MadreTabla>();

  loading: boolean = false;

  readonly headersMadresSeguimiento = [
    {
      header: 'CODIGO DONANTE',
      field: 'codigo_donante',
      width: '50px',
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
      width: '150px',
      tipo: 'text',
    },
    {
      header: 'FECHA VISITA',
      field: 'fecha_visita',
      width: '80px',
      tipo: 'date',
    },
  ];

  dataMadresSeguimiento: MadreTabla[] = [];

  constructor(
    private readonly tableMadresSeguimientoService: TableMadresSeguimientoService,
    private readonly messageService: MessageService) { }

  ngOnInit(): void {
    this.loadDataMadresSeguimiento();
  }

  private loadDataMadresSeguimiento(): void {
    this.loading = true;

    this.tableMadresSeguimientoService.getMadresDonantesAptas()
      .subscribe({
        next: (response: any) => {
          this.handleApiResponse(response);
        },
        error: (error) => {
          this.handleApiError(error);
        }
      });
  }

  private handleApiResponse(response: any): void {
    let madres: MadreDonante[] = [];

    if (response?.data && Array.isArray(response.data)) {
      madres = response.data;
    } else if (Array.isArray(response)) {
      madres = response;
    } else {
      this.showErrorMessage('Formato de respuesta inesperado');
      this.loading = false;
      return;
    }

    this.dataMadresSeguimiento = this.transformarDatosParaTabla(madres);
    this.showSuccessMessage();
    this.loading = false;
  }

  private handleApiError(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de las madres donantes',
      key: 'tr',
      life: 3000,
    });
    this.loading = false;
  }

  private transformarDatosParaTabla(madres: MadreDonante[]): MadreTabla[] {
    return madres.map(madre => ({
      id_seguimiento: madre.id,
      codigo_donante: madre.id.toString(),
      nombres: madre.madrePotencial?.infoMadre?.nombre || 'Sin nombre',
      apellidos: madre.madrePotencial?.infoMadre?.apellido || 'Sin apellido',
      donante: this.mapearTipoDonante(madre.tipoDonante),
      fecha_visita: null // Se cargará después con la primera visita
    }));
  }

  private mapearTipoDonante(tipo: string): string {
    return tipo?.toLowerCase() === 'interna' ? 'Interna' : 'Externa';
  }

  private showSuccessMessage(): void {
    const cantidad = this.dataMadresSeguimiento.length;

    if (cantidad > 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `${cantidad} madre${cantidad > 1 ? 's' : ''} donante${cantidad > 1 ? 's' : ''} cargada${cantidad > 1 ? 's' : ''}`,
        key: 'tr',
        life: 2000,
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No se encontraron madres donantes aptas',
        key: 'tr',
        life: 2000,
      });
    }
  }

  private showErrorMessage(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
      key: 'tr',
      life: 3000,
    });
  }

  onRowClick(row: MadreTabla): void {
    this.rowClick.emit(row);
  }
}
