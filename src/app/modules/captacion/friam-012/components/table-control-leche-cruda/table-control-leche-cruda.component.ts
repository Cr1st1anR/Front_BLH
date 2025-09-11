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
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterControlComponent } from "../new-register-control/new-register-control.component";
import { ControlLecheCrudaService } from './services/control-leche-cruda.service';


@Component({
  selector: 'table-control-leche-cruda',
  imports: [HeaderComponent, CommonModule, TableModule, ProgressSpinnerModule, ToastModule, FormsModule, InputTextModule, Select, MonthPickerComponent, NewRegisterControlComponent],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [ControlLecheCrudaService, MessageService]
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

  constructor(
    private messageService: MessageService,
    private controlLecheCrudaService: ControlLecheCrudaService
  ) { }

  ngOnInit(): void {
    this.loadDataControlLecheCruda();
  }

  loadDataControlLecheCruda(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataControlLecheCruda =
          this.controlLecheCrudaService.getTableControlLecheCrudaData();

        if (
          this.dataControlLecheCruda &&
          this.dataControlLecheCruda.length > 0
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
}
