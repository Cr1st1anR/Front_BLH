import { Component, OnInit } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
import { RegistroDonanteData } from './interfaces/registro-donante.interface';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { MonthPickerTableComponent } from "../month-picker-table/month-picker-table.component";

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [TableModule, CommonModule, HeaderComponent, MonthPickerTableComponent],
  providers: [RegistroDonanteService],
})
export class PosiblesDonantesTableComponent implements OnInit {
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

  constructor(
    private registroDonanteService: RegistroDonanteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.data = this.registroDonanteService.getDataRegistroDonante();
  }

  onRowClick(row: RegistroDonanteData) {
    this.router.navigate([
      '/blh/captacion/registro-donante-blh',
      row.documento,
    ]);
  }
}
