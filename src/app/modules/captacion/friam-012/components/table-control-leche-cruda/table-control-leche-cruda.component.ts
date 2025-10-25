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

        // ✅ NUEVO: Actualizar cache de empleados en el servicio
        this.controlLecheCrudaService.actualizarCacheEmpleados(this.empleados);

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
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la fecha seleccionada',
            key: 'tr',
            life: 2000,
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.dataControlLecheCruda = [];
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

  /**
   * Guardar cambios en el registro editado
   */
  onRowEditSave(dataRow: ControlLecheCrudaData, index: number, event: MouseEvent): void {
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    // ✅ NUEVO: Manejar fechas que vienen como objetos Date del DatePicker
    this.procesarFechasAntesDeguardar(dataRow);

    // Validar campos requeridos
    const invalidField = this.requiredFields.find(field => this.isFieldInvalid(field, dataRow));
    if (invalidField) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El campo "${this.getFieldDisplayName(invalidField)}" es obligatorio.`,
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // Recalcular fecha de vencimiento si cambió la gaveta (aunque no debería ser editable)
    if (dataRow.fechaExtraccion) {
      dataRow.fechaVencimiento = this.calcularFechaVencimiento(dataRow.fechaExtraccion);
    }

    // Preparar datos para enviar al backend
    const datosParaActualizar = this.controlLecheCrudaService.mapearDatosParaActualizar(dataRow);

    console.log('Datos a enviar al backend:', datosParaActualizar); // Para debugging

    // Mostrar loading
    this.loading = true;

    // Llamar al servicio para actualizar
    this.controlLecheCrudaService.putEntradaSalidaLecheCruda(dataRow.id!, datosParaActualizar)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.editingRow = null;
          delete this.clonedDataControlLecheCruda[dataRow.id as number];

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos actualizados correctamente',
            key: 'tr',
            life: 3000,
          });

          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.loading = false;

          // Restaurar datos originales en caso de error
          if (this.clonedDataControlLecheCruda[dataRow.id as number]) {
            this.dataControlLecheCruda[index] = { ...this.clonedDataControlLecheCruda[dataRow.id as number] };
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un error al actualizar los datos',
            key: 'tr',
            life: 3000,
          });

          console.error('Error al actualizar:', error);
        }
      });
  }

  /**
   * ✅ NUEVO: Manejar selección de fechas desde el DatePicker
   */
  onDateSelect(selectedDate: Date, rowData: ControlLecheCrudaData, field: string): void {
    if (selectedDate) {
      // Convertir inmediatamente a string para evitar problemas de tipo
      const fechaFormateada = this.convertirDateAString(selectedDate);

      if (field === 'fechaEntrada') {
        rowData.fechaEntrada = fechaFormateada;
      } else if (field === 'fechaSalida') {
        rowData.fechaSalida = fechaFormateada;
      }
    }
  }

  /**
   * ✅ CORREGIDO: Procesar fechas antes de guardar (simplificado)
   */
  private procesarFechasAntesDeguardar(dataRow: ControlLecheCrudaData): void {
    // Si por alguna razón las fechas siguen siendo objetos Date, convertirlas
    if (dataRow.fechaEntrada instanceof Date) {
      dataRow.fechaEntrada = this.convertirDateAString(dataRow.fechaEntrada);
    }

    if (dataRow.fechaSalida instanceof Date) {
      dataRow.fechaSalida = this.convertirDateAString(dataRow.fechaSalida);
    }
  }

  /**
   * ✅ NUEVO: Convertir objeto Date a string DD/MM/YYYY sin problemas de zona horaria
   */
  private convertirDateAString(fecha: Date): string {
    if (!fecha) return '';

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  /**
   * Calcular fecha de vencimiento (15 días después de la fecha de extracción)
   */
  private calcularFechaVencimiento(fechaExtraccion: string): string {
    if (!fechaExtraccion) return '';

    // Convertir la fecha de extracción a Date
    let fecha: Date;

    if (fechaExtraccion.includes('/')) {
      // Formato DD/MM/YYYY
      const partes = fechaExtraccion.split('/');
      fecha = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    } else {
      // Formato YYYY-MM-DD
      fecha = new Date(fechaExtraccion);
    }

    // Agregar 15 días
    fecha.setDate(fecha.getDate() + 15);

    // Formatear de vuelta a DD/MM/YYYY
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Obtener nombre amigable para mostrar en validaciones
   */
  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'gaveta': 'Gaveta',
      'fechaEntrada': 'Fecha de Entrada',
      'responsableEntrada': 'Responsable de Entrada',
      'procedencia': 'Procedencia'
    };

    return fieldNames[field] || field;
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
