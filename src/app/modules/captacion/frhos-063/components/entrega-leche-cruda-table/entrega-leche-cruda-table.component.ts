import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EntregaLecheCrudaService } from '../../services/entrega-leche-cruda.service';

@Component({
  selector: 'entrega-leche-cruda-table',
  imports: [
    TableModule,
    CommonModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './entrega-leche-cruda-table.component.html',
  styleUrl: './entrega-leche-cruda-table.component.scss',
  providers: [MessageService]
})
export class EntregaLecheCrudaTableComponent implements OnInit {

  loading: boolean = false;

  readonly headersEntregaLecheCruda = [
    { header: 'FECHA', field: 'fecha', width: '120px', tipo: 'date' },
    { header: 'NOMBRE DE LA MADRE', field: 'nombre_madre', width: '200px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA A.M (ml)', field: 'volumen_leche_materna_am', width: '180px', tipo: 'text' },
    { header: 'VOLUMEN LECHE MATERNA P.M (ml)', field: 'volumen_leche_materna_pm', width: '180px', tipo: 'text' },
    { header: 'PERDIDAS', field: 'perdidas', width: '100px', tipo: 'number' },
    { header: 'RESPONSABLE', field: 'responsable', width: '150px', tipo: 'text' },
  ];

  dataEntregaLecheCruda: any[] = [];

  constructor(
    private readonly entregaLecheCrudaService: EntregaLecheCrudaService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadDataEntregaLecheCruda();
  }

  private loadDataEntregaLecheCruda(): void {
    this.loading = true;

    try {
      // Por ahora usamos datos hardcodeados del servicio
      this.dataEntregaLecheCruda = this.entregaLecheCrudaService.getEntregaLecheCrudaData();

      // Formatear fechas si es necesario
      this.dataEntregaLecheCruda = this.formatData(this.dataEntregaLecheCruda);

      this.showSuccessMessage();
      this.loading = false;
    } catch (error) {
      this.handleError(error);
    }
  }

  private formatData(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      fecha: item.fecha ? new Date(item.fecha) : null
    }));
  }

  private showSuccessMessage(): void {
    const cantidad = this.dataEntregaLecheCruda.length;

    if (cantidad > 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `${cantidad} registro${cantidad > 1 ? 's' : ''} de entrega de leche cruda cargado${cantidad > 1 ? 's' : ''}`,
        key: 'tr',
        life: 2000,
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No se encontraron registros de entrega de leche cruda',
        key: 'tr',
        life: 2000,
      });
    }
  }

  private handleError(error: any): void {
    console.error('Error al cargar datos:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de entrega de leche cruda',
      key: 'tr',
      life: 3000,
    });
    this.loading = false;
  }
}
