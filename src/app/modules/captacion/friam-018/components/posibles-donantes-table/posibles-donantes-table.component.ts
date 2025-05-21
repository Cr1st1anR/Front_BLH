import { Component, OnInit } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
import { RegistroDonanteData } from './interfaces/registro-donante.interface';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../../../../shared/components/header/header.component";

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [TableModule, CommonModule, HeaderComponent],
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
      tipo: 'text', // Cambia a 'text' si solo mostrarás el nombre
    },
  ];

  data: RegistroDonanteData[] = [];

  constructor(private registroDonanteService: RegistroDonanteService) {}

  ngOnInit(): void {
    this.data = this.registroDonanteService.getDataRegistroDonante();
  }
}
