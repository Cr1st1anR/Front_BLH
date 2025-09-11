import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';


@Component({
  selector: 'table-control-leche-cruda',
  imports: [HeaderComponent, CommonModule, TableModule, ProgressSpinnerModule, ToastModule, FormsModule, InputTextModule, Select],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [MessageService]
})
export class TableControlLecheCrudaComponent implements OnInit {

  loading = false;

  nCongelador: string = '';
  selectUbicacion: string | null = 'BLH - área de almacenamiento';

  opcionesUbicacion = [
    { label: 'BLH- area de almacenamiento', value: 'BLH - área de almacenamiento' }
  ];

  headersControlLecheCruda: { header: string; field: string; width: string }[] = [
    { header: 'N° GAVETA', field: 'gaveta', width: '120px' },
    { header: 'DIAS POSPARTO', field: 'diasPosparto', width: '140px' },
    { header: 'DONANTE', field: 'donante', width: '220px' },
    { header: 'N° FRASCO DE LECHE CRUDA', field: 'numFrasco', width: '220px' },
    { header: 'EDAD GESTACIONAL', field: 'edadGestacional', width: '160px' },
    { header: 'VOLUMEN', field: 'volumen', width: '120px' },
    { header: 'FECHA DE EXTRACCIÓN', field: 'fechaExtraccion', width: '170px' },
    { header: 'FECHA DE VENCIMIENTO', field: 'fechaVencimiento', width: '170px' },
    { header: 'FECHA DE PARTO', field: 'fechaParto', width: '150px' },
    { header: 'PROCEDENCIA', field: 'procedencia', width: '180px' },
    { header: 'FECHA DE ENTRADA', field: 'fechaEntrada', width: '150px' },
    { header: 'RESPONSABLE', field: 'responsableEntrada', width: '200px' },
    { header: 'FECHA DE SALIDA', field: 'fechaSalida', width: '150px' },
    { header: 'RESPONSABLE', field: 'responsableSalida', width: '200px' },
  ];

  dataControlLecheCruda: any[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.dataControlLecheCruda = [
        // {
        //   id: 1,
        //   gaveta: '01',
        //   diasPosparto: 7,
        //   donante: 'María Pérez',
        //   numFrasco: 'F-0001',
        //   edadGestacional: '38 semanas',
        //   volumen: '120 ml',
        //   fechaExtraccion: '2025-09-01',
        //   fechaVencimiento: '2025-10-01',
        //   fechaParto: '2025-08-25',
        //   procedencia: 'Domicilio',
        //   fechaEntrada: '2025-09-02',
        //   responsableEntrada: 'Lic. Gómez',
        //   fechaSalida: '',
        //   responsableSalida: ''
        // }
      ];
      this.loading = false;

      this.messageService.add({
        severity: this.dataControlLecheCruda.length ? 'success' : 'info',
        summary: this.dataControlLecheCruda.length ? 'Éxito' : 'Información',
        detail: this.dataControlLecheCruda.length ? 'Datos cargados correctamente' : 'No hay datos para mostrar',
        key: 'tr',
        life: 2000,
      });
    }, 800);
  }
}
