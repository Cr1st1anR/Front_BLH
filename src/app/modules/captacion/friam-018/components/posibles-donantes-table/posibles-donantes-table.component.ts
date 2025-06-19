import { Component, OnInit } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
import { RegistroDonanteData } from './interfaces/registro-donante.interface';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { MonthPickerTableComponent } from '../month-picker-table/month-picker-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [
    TableModule,
    CommonModule,
    HeaderComponent,
    MonthPickerTableComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  providers: [RegistroDonanteService, MessageService],
})
export class PosiblesDonantesTableComponent implements OnInit {
  loading: boolean = false;

  headersTablePosiblesDonantes: any[] = [
    {
      header: 'NOMBRES',
      field: 'nombre',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'APELLIDOS',
      field: 'apellido',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'NO. DOC',
      field: 'documento',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'REMITE',
      field: 'entidad',
      width: '200px',
      tipo: 'text',
    },
  ];

  data: RegistroDonanteData[] = [];

  requiredFields: string[] = ['nombre', 'apellido', 'documento', 'entidad'];

  constructor(
    private registroDonanteService: RegistroDonanteService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.registroDonanteService.getDataRegistroDonante().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
        if (data && data.length > 0) {
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
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al cargar los datos',
          key: 'tr',
          life: 2000,
        });
      },
    });
  }

  onRowClick(row: RegistroDonanteData) {
    this.router.navigate([
      '/blh/captacion/registro-donante-blh',
      row.documento,
    ]);
  }
}
