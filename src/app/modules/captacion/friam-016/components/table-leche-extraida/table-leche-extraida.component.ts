import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { TableLecheExtraidaService } from './services/table-leche-extraida.service';

@Component({
  selector: 'table-leche-extraida',
  imports: [TableModule, CommonModule, ProgressSpinnerModule, ToastModule, RadioButtonModule, FormsModule],
  templateUrl: './table-leche-extraida.component.html',
  styleUrl: './table-leche-extraida.component.scss',
  providers: [TableLecheExtraidaService, MessageService]
})
export class TableLecheExtraidaComponent {

  loading: boolean = false;

  headersLecheExtraida: any[] = [
    {
      header: 'FECHA DE REGISTRO',
      field: 'fecha_registro',
      width: '200px',
      tipo: 'date',
    },
    {
      header: 'APELLIDOS Y NOMBRE',
      field: 'apellidos_nombre',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'EDAD',
      field: 'edad',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'IDENTIFICACIÓN',
      field: 'identificacion',
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
      header: 'TELÉFONO',
      field: 'telefono',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'EPS',
      field: 'eps',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'PROCEDENCIA',
      field: 'procedencia',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'CONSEJERIA',
      field: 'consejeria',
      width: '320px',
      tipo: 'consejeria',
    },
  ];

  dataLecheExtraida: any[] = [];

  constructor(
    private tableLecheExtraidaService: TableLecheExtraidaService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDataLecheExtraida();
  }

  loadDataLecheExtraida(): void {
    this.loading = true;

    setTimeout(() => {
      try {
        this.dataLecheExtraida =
          this.tableLecheExtraidaService.getTableLecheExtraidaData();

        if (
          this.dataLecheExtraida &&
          this.dataLecheExtraida.length > 0
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

  /**
   * Obtener el valor de consejería de forma segura
   */
  getConsejeriaValue(rowData: any, type: 'individual' | 'grupal'): number | null {
    return rowData?.consejeria?.[type] ?? null;
  }

  /**
   * Actualizar el valor de consejería individual
   */
  onConsejeriaIndividualChange(rowIndex: number, value: number): void {
    if (!this.dataLecheExtraida[rowIndex].consejeria) {
      this.dataLecheExtraida[rowIndex].consejeria = {};
    }
    this.dataLecheExtraida[rowIndex].consejeria.individual = value;
  }

  /**
   * Actualizar el valor de consejería grupal
   */
  onConsejeriaGrupalChange(rowIndex: number, value: number): void {
    if (!this.dataLecheExtraida[rowIndex].consejeria) {
      this.dataLecheExtraida[rowIndex].consejeria = {};
    }
    this.dataLecheExtraida[rowIndex].consejeria.grupal = value;
  }
}
