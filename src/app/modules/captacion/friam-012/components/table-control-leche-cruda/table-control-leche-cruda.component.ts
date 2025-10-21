import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { Table, TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { ControlLecheCrudaService } from './services/control-leche-cruda.service';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import type { ControlLecheCrudaData, EmpleadoResponse } from './interfaces/control-leche-cruda.interface';

@Component({
  selector: 'table-control-leche-cruda',
  imports: [
    HeaderComponent,
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    InputTextModule,
    Select,
    DatePickerModule,
    MonthPickerComponent,
    ButtonModule,
    RippleModule,
    HttpClientModule
  ],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [ControlLecheCrudaService, MessageService]
})
export class TableControlLecheCrudaComponent implements OnInit {

  @ViewChild('tableControl') table!: Table;

  loading = false;

  editingRow: ControlLecheCrudaData | null = null;
  clonedDataControlLecheCruda: { [s: number]: ControlLecheCrudaData } = {};

  // Datos desde el backend
  empleados: EmpleadoResponse[] = [];
  donantes: { label: string; value: string }[] = [];

  opcionesUbicacion = [
    { label: 'BLH- area de almacenamiento', value: 'BLH - área de almacenamiento' }
  ];

  opcionesResponsables: { label: string; value: string }[] = [];
  opcionesDonantes: { label: string; value: string }[] = [];

  headersControlLecheCruda: { header: string; field: string; width: string; tipo?: string }[] = [
    { header: 'CONGELADOR N°', field: 'nCongelador', width: '150px', tipo: 'text' },
    { header: 'UBICACIÓN', field: 'ubicacion', width: '200px', tipo: 'select' },
    { header: 'N° GAVETA', field: 'gaveta', width: '120px', tipo: 'text' },
    { header: 'DIAS POSPARTO', field: 'diasPosparto', width: '140px', tipo: 'text' },
    { header: 'DONANTE', field: 'donante', width: '220px', tipo: 'select' },
    { header: 'N° FRASCO DE LECHE CRUDA', field: 'numFrasco', width: '220px', tipo: 'text' },
    { header: 'EDAD GESTACIONAL', field: 'edadGestacional', width: '160px', tipo: 'text' },
    { header: 'VOLUMEN', field: 'volumen', width: '120px', tipo: 'text' },
    { header: 'FECHA DE EXTRACCIÓN', field: 'fechaExtraccion', width: '170px', tipo: 'date' },
    { header: 'FECHA DE VENCIMIENTO', field: 'fechaVencimiento', width: '170px', tipo: 'date' },
    { header: 'FECHA DE PARTO', field: 'fechaParto', width: '150px', tipo: 'date' },
    { header: 'PROCEDENCIA', field: 'procedencia', width: '180px', tipo: 'text' },
    { header: 'FECHA DE ENTRADA', field: 'fechaEntrada', width: '150px', tipo: 'date' },
    { header: 'RESPONSABLE', field: 'responsableEntrada', width: '200px', tipo: 'select' },
    { header: 'FECHA DE SALIDA', field: 'fechaSalida', width: '150px', tipo: 'date' },
    { header: 'RESPONSABLE', field: 'responsableSalida', width: '200px', tipo: 'select' },
    { header: 'ACCIONES', field: 'acciones', width: '150px' }
  ];

  dataControlLecheCruda: ControlLecheCrudaData[] = [];

  requiredFields: string[] = ['gaveta', 'fechaEntrada', 'responsableEntrada'];

  // Mes y año actuales para la carga inicial
  mesActual: number = new Date().getMonth() + 1;
  anioActual: number = new Date().getFullYear();

  constructor(
    private messageService: MessageService,
    private controlLecheCrudaService: ControlLecheCrudaService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Cargar datos iniciales (empleados y datos de control)
   */
  loadInitialData(): void {
    this.loading = true;

    forkJoin({
      empleados: this.controlLecheCrudaService.getEmpleados(),
      controlData: this.controlLecheCrudaService.getEntradasSalidasLecheCruda(this.mesActual, this.anioActual)
    }).subscribe({
      next: (response) => {
        // Procesar empleados
        this.empleados = response.empleados;
        this.opcionesResponsables = this.empleados.map(emp => ({
          label: emp.nombre,
          value: emp.nombre
        }));

        // Procesar datos de control
        this.dataControlLecheCruda = response.controlData;

        // Extraer donantes únicos de los datos
        this.extractDonantesList(this.dataControlLecheCruda);

        this.loading = false;

        if (this.dataControlLecheCruda.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la fecha seleccionada',
            key: 'tr',
            life: 3000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la fecha seleccionada',
            key: 'tr',
            life: 3000,
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.dataControlLecheCruda = []; // Limpiar datos en caso de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al cargar los datos',
          key: 'tr',
          life: 3000,
        });
        console.error('Error al cargar datos:', error);
      }
    });
  }

  /**
   * Cargar datos de control de leche cruda por mes y año
   */
  loadDataControlLecheCruda(mes?: number, anio?: number): void {
    this.loading = true;

    const mesConsulta = mes || this.mesActual;
    const anioConsulta = anio || this.anioActual;

    this.controlLecheCrudaService.getEntradasSalidasLecheCruda(mesConsulta, anioConsulta)
      .subscribe({
        next: (data) => {
          this.dataControlLecheCruda = data;
          this.extractDonantesList(data);
          this.loading = false;

          if (data.length > 0) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Datos cargados para la fecha seleccionada',
              key: 'tr',
              life: 3000,
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'Información',
              detail: 'No hay datos para la fecha seleccionada',
              key: 'tr',
              life: 3000,
            });
          }
        },
        error: (error) => {
          this.loading = false;
          this.dataControlLecheCruda = []; // Limpiar la tabla cuando hay error
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un error al cargar los datos',
            key: 'tr',
            life: 3000,
          });
          console.error('Error al cargar datos:', error);
        }
      });
  }

  /**
   * Extraer lista única de donantes de los datos
   */
  private extractDonantesList(data: ControlLecheCrudaData[]): void {
    const donantesUnicos = [...new Set(data.map(item => item.donante))];
    this.opcionesDonantes = donantesUnicos.map(donante => ({
      label: donante,
      value: donante
    }));
  }

  /**
   * Método para manejar cambios en el month-picker
   * Adaptamos { year, month } a { mes, anio } que espera nuestro servicio
   */
  onMonthYearChange(event: { year: number; month: number }): void {
    this.mesActual = event.month;
    this.anioActual = event.year;
    this.loadDataControlLecheCruda(event.month, event.year);
  }

  onRowEditInit(dataRow: ControlLecheCrudaData): void {
    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    this.clonedDataControlLecheCruda[dataRow.id as number] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: ControlLecheCrudaData, index: number, event: MouseEvent): void {
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    const invalidField = this.requiredFields.find(field => this.isFieldInvalid(field, dataRow));
    if (invalidField) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El campo "${invalidField}" es obligatorio.`,
        key: 'tr',
        life: 3000,
      });
      return;
    }

    this.editingRow = null;
    delete this.clonedDataControlLecheCruda[dataRow.id as number];

    // TODO: Aquí implementarías la llamada al backend para actualizar
    // Cuando implementes el PUT, enviarás:
    // {
    //   responsableEntrada: dataRow.responsableEntrada, // nombre del empleado
    //   responsableSalida: dataRow.responsableSalida,   // nombre del empleado
    //   // ... otros campos
    // }

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Datos actualizados',
      key: 'tr',
      life: 3000,
    });

    this.table.saveRowEdit(dataRow, rowElement);
  }

  onRowEditCancel(dataRow: ControlLecheCrudaData, index: number): void {
    // Restaurar datos originales
    this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[dataRow.id as number];
    delete this.clonedDataControlLecheCruda[dataRow.id as number];
    this.editingRow = null;
  }

  isFieldInvalid(field: string, dataRow: ControlLecheCrudaData): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field as keyof ControlLecheCrudaData] === null ||
        dataRow[field as keyof ControlLecheCrudaData] === undefined ||
        dataRow[field as keyof ControlLecheCrudaData] === '');
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow && this.table) {
      try {
        this.table.cancelRowEdit(this.editingRow);
      } catch (error) {
        // Ignorar errores del cancelRowEdit
      }

      const index = this.dataControlLecheCruda.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        // Restaurar datos originales si existen
        if (this.clonedDataControlLecheCruda[this.editingRow.id as number]) {
          this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[this.editingRow.id as number];
          delete this.clonedDataControlLecheCruda[this.editingRow.id as number];
        }
      }
      this.editingRow = null;
    }
  }

  isEditButtonDisabled(rowData: ControlLecheCrudaData): boolean {
    return this.editingRow !== null && this.editingRow !== rowData;
  }
}
