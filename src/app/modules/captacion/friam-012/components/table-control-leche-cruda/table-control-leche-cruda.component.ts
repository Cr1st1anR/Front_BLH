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
import { forkJoin } from 'rxjs';

import type {
  ControlLecheCrudaData,
  EmpleadoResponse,
  SelectOption,
  TableHeader,
  RequiredField,
  CongeladoresResponse
} from './interfaces/control-leche-cruda.interface';

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
    RippleModule
  ],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [ControlLecheCrudaService, MessageService]
})
export class TableControlLecheCrudaComponent implements OnInit {
  private readonly DIAS_VENCIMIENTO = 15;
  private readonly FIELD_DISPLAY_NAMES = {
    gaveta: 'Gaveta',
    fechaEntrada: 'Fecha de Entrada',
    responsableEntrada: 'Responsable de Entrada',
    procedencia: 'Procedencia'
  };

  @ViewChild('tableControl') table!: Table;

  loading = false;
  editingRow: ControlLecheCrudaData | null = null;
  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();

  dataControlLecheCruda: ControlLecheCrudaData[] = [];
  empleados: EmpleadoResponse[] = [];
  congeladores: CongeladoresResponse[] = [];
  opcionesResponsables: SelectOption[] = [];
  opcionesDonantes: SelectOption[] = [];
  opcionesCongeladores: SelectOption[] = [];

  private clonedDataControlLecheCruda: { [id: number]: ControlLecheCrudaData } = {};

  readonly opcionesUbicacion: SelectOption[] = [
    { label: 'BLH- area de almacenamiento', value: 'BLH - área de almacenamiento' }
  ];

  readonly requiredFields: ReadonlyArray<RequiredField> = ['gaveta', 'fechaEntrada', 'responsableEntrada'];

  readonly headersControlLecheCruda: TableHeader[] = [
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

  constructor(
    private messageService: MessageService,
    private controlLecheCrudaService: ControlLecheCrudaService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga los datos iniciales del componente
   */
  loadInitialData(): void {
    this.loading = true;

    const dataStreams = {
      empleados: this.controlLecheCrudaService.getEmpleados(),
      controlData: this.controlLecheCrudaService.getEntradasSalidasLecheCruda(this.mesActual, this.anioActual),
      congeladores: this.controlLecheCrudaService.getCongeladores()
    };

    forkJoin(dataStreams).subscribe({
      next: (response) => {
        this.procesarCongeladores(response.congeladores);
        this.procesarEmpleados(response.empleados);
        this.procesarDatosControl(response.controlData);
        this.loading = false;
        this.mostrarMensajeCarga(response.controlData.length > 0);
      },
      error: (error) => {
        this.manejarErrorCarga(error);
      }
    });
  }

  private procesarCongeladores(congeladores: CongeladoresResponse[]): void {
    this.congeladores = congeladores;
    this.opcionesCongeladores = congeladores.map(cong => ({
      label: cong.id.toString(),
      value: cong.id.toString()
    }));
  }

  /**
   * Procesa la lista de empleados y configura las opciones
   */
  private procesarEmpleados(empleados: EmpleadoResponse[]): void {
    this.empleados = empleados;
    this.opcionesResponsables = empleados.map(emp => ({
      label: emp.nombre,
      value: emp.nombre
    }));
    this.controlLecheCrudaService.actualizarCacheEmpleados(empleados);
  }

  /**
   * Procesa los datos de control y extrae las opciones de donantes
   */
  private procesarDatosControl(datos: ControlLecheCrudaData[]): void {
    datos.forEach(item => {
      item.nCongelador = this.opcionesCongeladores.find(cong => cong.value === item.nCongelador)!.label;
    });
    this.dataControlLecheCruda = datos;
    this.extractDonantesList(datos);
  }

  /**
   * Muestra el mensaje apropiado después de cargar datos
   */
  private mostrarMensajeCarga(hayDatos: boolean): void {
    const mensaje = hayDatos
      ? { severity: 'success', summary: 'Éxito', detail: 'Datos cargados para la fecha seleccionada' }
      : { severity: 'info', summary: 'Información', detail: 'No hay datos para la fecha seleccionada' };

    this.messageService.add({ ...mensaje, key: 'tr', life: 2000 });
  }

  /**
   * Maneja los errores durante la carga de datos
   */
  private manejarErrorCarga(error: any): void {
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

  /**
   * Carga datos de control de leche cruda por mes y año
   */
  loadDataControlLecheCruda(mes?: number, anio?: number): void {
    this.loading = true;

    const mesConsulta = mes ?? this.mesActual;
    const anioConsulta = anio ?? this.anioActual;

    this.controlLecheCrudaService.getEntradasSalidasLecheCruda(mesConsulta, anioConsulta)
      .subscribe({
        next: (data) => {
          this.procesarDatosControl(data);
          this.loading = false;
          this.mostrarMensajeCarga(data.length > 0);
        },
        error: (error) => {
          this.manejarErrorCarga(error);
        }
      });
  }

  /**
   * Extrae la lista única de donantes de los datos
   */
  private extractDonantesList(data: ControlLecheCrudaData[]): void {
    const donantesUnicos = [...new Set(data.map(item => item.donante))];
    this.opcionesDonantes = donantesUnicos.map(donante => ({
      label: donante,
      value: donante
    }));
  }

  /**
   * Maneja los cambios en el selector de mes y año
   */
  onMonthYearChange(event: { year: number; month: number }): void {
    this.mesActual = event.month;
    this.anioActual = event.year;
    this.loadDataControlLecheCruda(event.month, event.year);
  }

  /**
   * Inicia la edición de una fila
   */
  onRowEditInit(dataRow: ControlLecheCrudaData): void {
    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    this.clonedDataControlLecheCruda[dataRow.id as number] = { ...dataRow };
    this.editingRow = dataRow;
  }

  /**
   * Guarda los cambios en el registro editado
   */
  onRowEditSave(dataRow: ControlLecheCrudaData, index: number, event: MouseEvent): void {
    if (!this.validarCamposRequeridos(dataRow)) return;

    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;

    this.prepararDatosParaGuardar(dataRow);
    this.guardarCambios(dataRow, index, rowElement);
  }

  /**
   * Valida que todos los campos requeridos estén completos
   */
  private validarCamposRequeridos(dataRow: ControlLecheCrudaData): boolean {
    const invalidField = this.requiredFields.find(field => this.isFieldInvalid(field, dataRow));

    if (invalidField) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El campo "${this.getFieldDisplayName(invalidField)}" es obligatorio.`,
        key: 'tr',
        life: 3000,
      });
      return false;
    }

    return true;
  }

  /**
   * Prepara los datos para el guardado
   */
  private prepararDatosParaGuardar(dataRow: ControlLecheCrudaData): void {
    this.procesarFechasAntesDeguardar(dataRow);

    if (dataRow.fechaExtraccion) {
      dataRow.fechaVencimiento = this.calcularFechaVencimiento(dataRow.fechaExtraccion);
    }
  }

  /**
   * Ejecuta el guardado de los cambios
   */
  private guardarCambios(dataRow: ControlLecheCrudaData, index: number, rowElement: HTMLTableRowElement): void {
    const datosParaActualizar = this.controlLecheCrudaService.mapearDatosParaActualizar(dataRow);

    this.loading = true;

    this.controlLecheCrudaService.putEntradaSalidaLecheCruda(dataRow.id!, datosParaActualizar)
      .subscribe({
        next: () => this.manejarExitoGuardado(dataRow, rowElement),
        error: (error) => this.manejarErrorGuardado(dataRow, index, error)
      });
  }

  /**
   * Maneja el éxito en el guardado
   */
  private manejarExitoGuardado(dataRow: ControlLecheCrudaData, rowElement: HTMLTableRowElement): void {
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
  }

  /**
   * Maneja los errores en el guardado
   */
  private manejarErrorGuardado(dataRow: ControlLecheCrudaData, index: number, error: any): void {
    this.loading = false;

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

  /**
   * Maneja la selección de fechas desde el DatePicker
   */
  onDateSelect(selectedDate: Date, rowData: ControlLecheCrudaData, field: string): void {
    if (!selectedDate) return;

    const fechaFormateada = this.convertirDateAString(selectedDate);

    switch (field) {
      case 'fechaEntrada':
        rowData.fechaEntrada = fechaFormateada;
        break;
      case 'fechaSalida':
        rowData.fechaSalida = fechaFormateada;
        break;
    }
  }

  /**
   * Procesa las fechas antes de guardar convirtiéndolas a string si son objetos Date
   */
  private procesarFechasAntesDeguardar(dataRow: ControlLecheCrudaData): void {
    if (dataRow.fechaEntrada instanceof Date) {
      dataRow.fechaEntrada = this.convertirDateAString(dataRow.fechaEntrada);
    }

    if (dataRow.fechaSalida instanceof Date) {
      dataRow.fechaSalida = this.convertirDateAString(dataRow.fechaSalida);
    }
  }

  /**
   * Convierte un objeto Date a string DD/MM/YYYY evitando problemas de zona horaria
   */
  private convertirDateAString(fecha: Date): string {
    if (!fecha) return '';

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  /**
   * Calcula la fecha de vencimiento (15 días después de la extracción)
   */
  private calcularFechaVencimiento(fechaExtraccion: string): string {
    if (!fechaExtraccion) return '';

    const fecha = this.parsearFecha(fechaExtraccion);
    if (!fecha) return '';

    fecha.setDate(fecha.getDate() + this.DIAS_VENCIMIENTO);
    return this.convertirDateAString(fecha);
  }

  /**
   * Parsea una fecha desde formato DD/MM/YYYY o YYYY-MM-DD
   */
  private parsearFecha(fechaStr: string): Date | null {
    if (fechaStr.includes('/')) {
      const [dia, mes, año] = fechaStr.split('/').map(Number);
      return new Date(año, mes - 1, dia);
    }

    if (fechaStr.includes('-')) {
      return new Date(fechaStr);
    }

    return null;
  }

  /**
   * Obtiene el nombre amigable de un campo para mostrar en validaciones
   */
  private getFieldDisplayName(field: string): string {
    return this.FIELD_DISPLAY_NAMES[field as keyof typeof this.FIELD_DISPLAY_NAMES] || field;
  }

  /**
   * Cancela la edición de una fila restaurando los datos originales
   */
  onRowEditCancel(dataRow: ControlLecheCrudaData, index: number): void {
    this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[dataRow.id as number];
    delete this.clonedDataControlLecheCruda[dataRow.id as number];
    this.editingRow = null;
  }

  /**
   * Verifica si un campo es inválido (requerido pero vacío)
   */
  isFieldInvalid(field: string, dataRow: ControlLecheCrudaData): boolean {
    if (!this.requiredFields.includes(field as any)) return false;

    const value = dataRow[field as keyof ControlLecheCrudaData];
    return value === null || value === undefined || value === '';
  }

  /**
   * Cancela la edición actual si existe una fila en edición
   */
  private cancelCurrentEditing(): void {
    if (!this.editingRow || !this.table) return;

    try {
      this.table.cancelRowEdit(this.editingRow);
    } catch (error) {
    }

    const index = this.dataControlLecheCruda.findIndex(row => row === this.editingRow);

    if (index !== -1 && this.clonedDataControlLecheCruda[this.editingRow.id as number]) {
      this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[this.editingRow.id as number];
      delete this.clonedDataControlLecheCruda[this.editingRow.id as number];
    }

    this.editingRow = null;
  }

  /**
   * Determina si el botón de editar debe estar deshabilitado
   */
  isEditButtonDisabled(rowData: ControlLecheCrudaData): boolean {
    return this.editingRow !== null && this.editingRow !== rowData;
  }

}
