import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisitaMadresResponse } from './interfaces/visita-domiciliaria';
import { VisitaDomiciliariaService } from './services/visita-domiciliaria.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MonthPickerTableComponent } from '../month-picker-table/month-picker-table.component';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'visita-domiciliaria-table',
  imports: [
    TableModule,
    CommonModule,
    HeaderComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './visita-domiciliaria-table.component.html',
  styleUrl: './visita-domiciliaria-table.component.scss',
  providers: [VisitaDomiciliariaService, MessageService],
})
export class VisitaDomiciliariaTableComponent implements OnInit {
  loading: boolean = false;

  headersTableVisitaDomiciliaria: any[] = [
    {
      header: 'FECHA DE VISITA',
      field: 'fecha_visita',
      width: '200px',
      tipo: Date,
    },
    { header: 'NOMBRES', field: 'nombre', width: '200px', tipo: 'text' },
    { header: 'APELLIDOS', field: 'apellido', width: '200px', tipo: 'text' },
    { header: 'NO. DOC', field: 'documento', width: '200px', tipo: 'number' },
    { header: 'EDAD', field: 'edad', width: '200px', tipo: 'number' },
    { header: 'DIRECCION', field: 'direccion', width: '200px', tipo: 'text' },
    { header: 'CELULAR', field: 'celular', width: '200px', tipo: 'number' },
    { header: 'MUNICIPIO', field: 'ciudad', width: '200px', tipo: 'text' },
    {
      header: 'ENCUESTA REALIZADA',
      field: 'encuesta_realizada',
      width: '200px',
      tipo: 'text',
    },
  ];

  dataTable: VisitaMadresResponse[] = [];

  constructor(
    private visitaDomiciliariaService: VisitaDomiciliariaService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.visitaDomiciliariaService.getDataVisitaDomiciliaria().subscribe({
      next: (data) => {
        this.dataTable = this.formatData(data.data);
        this.loading = false;
        if (data && data.data.length > 0) {
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

  onRowClick(row: VisitaMadresResponse) {
    this.router.navigate(['/blh/captacion/visita-domiciliaria', row.id]);
  }

  formatData(data: VisitaMadresResponse[]): VisitaMadresResponse[] {
    return data.map(item => ({
      ...item,
      nombre: item.infoMadre.nombre,
      apellido: item.infoMadre.apellido,
      documento: item.infoMadre.documento,
      direccion: item.infoMadre.direccion,
      celular: item.infoMadre.celular,
      ciudad: item.infoMadre.ciudad,
      fecha_visita: item.fecha_visita,
      edad: this.ageCalculate(item.infoMadre.fechaNacimiento),
      encuesta_realizada:  'No',
    }));
  }

  ageCalculate(age: Date): number {
    const fechaNacimiento = new Date(age);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  }
}
