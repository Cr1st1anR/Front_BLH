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

import type { ControlLecheCrudaData } from './interfaces/control-leche-cruda.interface';

@Component({
  selector: 'table-control-leche-cruda',
  imports: [HeaderComponent, CommonModule, TableModule, ProgressSpinnerModule, ToastModule, FormsModule, InputTextModule, Select, DatePickerModule, MonthPickerComponent, ButtonModule, RippleModule],
  templateUrl: './table-control-leche-cruda.component.html',
  styleUrl: './table-control-leche-cruda.component.scss',
  providers: [ControlLecheCrudaService, MessageService]
})
export class TableControlLecheCrudaComponent implements OnInit {

  @ViewChild('tableControl') table!: Table;

  loading = false;

  editingRow: ControlLecheCrudaData | null = null;
  clonedDataControlLecheCruda: { [s: number]: ControlLecheCrudaData } = {};

  opcionesUbicacion = [
    { label: 'BLH- area de almacenamiento', value: 'BLH - área de almacenamiento' }
  ];

  opcionesResponsables = [
    { label: 'Stephania M', value: 'Stephania M' },
    { label: 'Alejandra L', value: 'Alejandra L' },
    { label: 'María García', value: 'María García' },
    { label: 'Carlos Rodriguez', value: 'Carlos Rodriguez' },
    { label: 'Ana López', value: 'Ana López' },
    { label: 'Luis Martinez', value: 'Luis Martinez' }
  ];

  opcionesDonantes = [
    { label: '1836', value: '1836' },
    { label: '1837', value: '1837' },
    { label: '1838', value: '1838' },
    { label: '1839', value: '1839' },
    { label: '1840', value: '1840' },
    { label: '1841', value: '1841' },
    { label: '1842', value: '1842' },
    { label: '1843', value: '1843' }
  ];

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

    // Lógica de actualización cuando se implemente el backend
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
