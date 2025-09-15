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
import { MonthPickerComponent } from "src/app/shared/components/month-picker/month-picker.component";
import { NewRegisterControlComponent } from "../new-register-control/new-register-control.component";
import { ControlLecheCrudaService } from './services/control-leche-cruda.service';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import type { ControlLecheCrudaData } from './interfaces/control-leche-cruda.interface';

@Component({
  selector: 'table-control-leche-cruda',
  imports: [HeaderComponent, CommonModule, TableModule, ProgressSpinnerModule, ToastModule, FormsModule, InputTextModule, Select, MonthPickerComponent, NewRegisterControlComponent, ButtonModule, RippleModule],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [ControlLecheCrudaService, MessageService]
})
export class TableControlLecheCrudaComponent implements OnInit {

  @ViewChild('tableControl') table!: Table;

  loading = false;

  editingRow: ControlLecheCrudaData | null = null;
  hasNewRowInEditing: boolean = false;
  clonedDataControlLecheCruda: { [s: number]: ControlLecheCrudaData } = {};

  opcionesUbicacion = [
    { label: 'BLH- area de almacenamiento', value: 'BLH - área de almacenamiento' }
  ];

  headersControlLecheCruda: { header: string; field: string; width: string; tipo?: string }[] = [
    { header: 'CONGELADOR N°', field: 'nCongelador', width: '150px', tipo: 'text' },
    { header: 'UBICACIÓN', field: 'ubicacion', width: '200px', tipo: 'select' },
    { header: 'N° GAVETA', field: 'gaveta', width: '120px', tipo: 'text' },
    { header: 'DIAS POSPARTO', field: 'diasPosparto', width: '140px', tipo: 'text' },
    { header: 'DONANTE', field: 'donante', width: '220px', tipo: 'text' },
    { header: 'N° FRASCO DE LECHE CRUDA', field: 'numFrasco', width: '220px', tipo: 'text' },
    { header: 'EDAD GESTACIONAL', field: 'edadGestacional', width: '160px', tipo: 'text' },
    { header: 'VOLUMEN', field: 'volumen', width: '120px', tipo: 'text' },
    { header: 'FECHA DE EXTRACCIÓN', field: 'fechaExtraccion', width: '170px', tipo: 'text' },
    { header: 'FECHA DE VENCIMIENTO', field: 'fechaVencimiento', width: '170px', tipo: 'text' },
    { header: 'FECHA DE PARTO', field: 'fechaParto', width: '150px', tipo: 'text' },
    { header: 'PROCEDENCIA', field: 'procedencia', width: '180px', tipo: 'text' },
    { header: 'FECHA DE ENTRADA', field: 'fechaEntrada', width: '150px', tipo: 'text' },
    { header: 'RESPONSABLE', field: 'responsableEntrada', width: '200px', tipo: 'text' },
    { header: 'FECHA DE SALIDA', field: 'fechaSalida', width: '150px', tipo: 'text' },
    { header: 'RESPONSABLE', field: 'responsableSalida', width: '200px', tipo: 'text' },
    { header: 'ACCIONES', field: 'acciones', width: '150px' }
  ];

  dataControlLecheCruda: ControlLecheCrudaData[] = [];

  requiredFields: string[] = ['nCongelador', 'ubicacion', 'gaveta', 'donante', 'numFrasco', 'volumen', 'fechaEntrada', 'responsableEntrada'];

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

  onRowEditInit(dataRow: ControlLecheCrudaData): void {
    if (this.hasNewRowInEditing && (!this.editingRow || this.editingRow.id === undefined)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la fila nueva antes de editar otra.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

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
    this.hasNewRowInEditing = false;
    delete this.clonedDataControlLecheCruda[dataRow.id as number];

    // logica de guardado cuando se implemente el backend
    if (dataRow.id === undefined) {
      // aquivcd simulamos creacion de nuevo registroo
      dataRow.id = Math.max(...this.dataControlLecheCruda.map(d => d.id || 0)) + 1;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos guardados',
        key: 'tr',
        life: 3000,
      });
    } else {
      // sim actualizacion
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos actualizados',
        key: 'tr',
        life: 3000,
      });
    }

    this.table.saveRowEdit(dataRow, rowElement);
  }

  onRowEditCancel(dataRow: ControlLecheCrudaData, index: number): void {
    if (dataRow.id === undefined) {
      // es una nueva fila, eliminarla
      this.dataControlLecheCruda.splice(index, 1);
      this.dataControlLecheCruda = [...this.dataControlLecheCruda];
      this.hasNewRowInEditing = false;
    } else {
      // restaurar datos originales
      this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[dataRow.id as number];
      delete this.clonedDataControlLecheCruda[dataRow.id as number];
    }
    this.editingRow = null;
  }

  agregarFilaVacia(): void {
    if (this.hasNewRowInEditing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la fila actual antes de crear una nueva',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    if (this.editingRow && this.table) {
      this.cancelCurrentEditing();
    }

    const nuevoRegistro: ControlLecheCrudaData = {
      nCongelador: '',
      ubicacion: 'BLH - área de almacenamiento',
      gaveta: '',
      diasPosparto: '',
      donante: '',
      numFrasco: '',
      edadGestacional: '',
      volumen: '',
      fechaExtraccion: '',
      fechaVencimiento: '',
      fechaParto: '',
      procedencia: '',
      fechaEntrada: '',
      responsableEntrada: '',
      fechaSalida: '',
      responsableSalida: ''
    };

    this.dataControlLecheCruda.push(nuevoRegistro);
    this.dataControlLecheCruda = [...this.dataControlLecheCruda];
    this.hasNewRowInEditing = true;

    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    }, 100);
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
        // iggnorar errores del cancelrowedit
      }

      const index = this.dataControlLecheCruda.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        if (this.editingRow.id === undefined) {
          // es una nueva fila, eliminarla
          this.dataControlLecheCruda.splice(index, 1);
          this.dataControlLecheCruda = [...this.dataControlLecheCruda];
        } else {
          // restaurar datos originales si existen
          if (this.clonedDataControlLecheCruda[this.editingRow.id as number]) {
            this.dataControlLecheCruda[index] = this.clonedDataControlLecheCruda[this.editingRow.id as number];
            delete this.clonedDataControlLecheCruda[this.editingRow.id as number];
          }
        }
      }
      this.editingRow = null;
      this.hasNewRowInEditing = false;
    }
  }

  isAnyRowEditing(): boolean {
    return this.editingRow !== null || this.hasNewRowInEditing;
  }

  isEditButtonDisabled(rowData: ControlLecheCrudaData): boolean {
    return this.isAnyRowEditing() && this.editingRow !== rowData;
  }
}
