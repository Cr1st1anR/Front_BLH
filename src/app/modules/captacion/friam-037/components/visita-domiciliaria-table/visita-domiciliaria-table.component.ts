import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VisitaDomiciliariaData } from './interfaces/visita-domiciliaria';
import { VisitaDomiciliariaService } from './services/visita-domiciliaria.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MonthPickerTableComponent } from '../month-picker-table/month-picker-table.component';

@Component({
  selector: 'visita-domiciliaria-table',
  imports: [
    TableModule,
    CommonModule,
    HeaderComponent,
    MonthPickerTableComponent,
  ],
  templateUrl: './visita-domiciliaria-table.component.html',
  styleUrl: './visita-domiciliaria-table.component.scss',
  providers: [VisitaDomiciliariaService],
})
export class VisitaDomiciliariaTableComponent implements OnInit {
  headersTableVisitaDomiciliaria: any[] = [
    {
      header: 'FECHA DE VISITA',
      field: 'fecha_visita',
      width: '200px',
      tipo: Date,
    },
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
      header: 'EDAD',
      field: 'edad',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'DIRECCION',
      field: 'direccion',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'CELULAR',
      field: 'celular',
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
      header: 'ENCUESTA REALIZADA',
      field: 'encuesta_realizada',
      width: '200px',
      tipo: 'text',
    },
  ];

  data: VisitaDomiciliariaData[] = [];

  constructor(
    private visitaDomiciliariaService: VisitaDomiciliariaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const data = this.visitaDomiciliariaService.getDataVisitaDomiciliaria();
    this.data = data.map((item) => ({
      ...item,
      fecha_visita: new Date(item.fecha_visita),
    }));
  }

  onRowClick(row: VisitaDomiciliariaData) {
    this.router.navigate(['/blh/captacion/visita-domiciliaria', row.documento]);
  }
}
