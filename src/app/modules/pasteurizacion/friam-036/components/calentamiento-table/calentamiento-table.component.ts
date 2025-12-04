import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { CalentamientoService } from '../../services/calentamiento.service';
import type {
  CalentamientoData,
  CalentamientoBackendRequest,
  CalentamientoBackendResponse,
  TableColumn,
  BackendApiResponse,
  ControlTemperaturaCompleta,
  CalentamientoAPIResponse
} from '../../interfaces/calentamiento.interface';

@Component({
  selector: 'calentamiento-table',
  standalone: true,
  imports: [
    TableModule, CommonModule, HttpClientModule, ProgressSpinnerModule, ToastModule,
    FormsModule, ButtonModule, InputTextModule, TooltipModule
  ],
  templateUrl: './calentamiento-table.component.html',
  styleUrl: './calentamiento-table.component.scss',
  providers: [MessageService]
})
export class CalentamientoTableComponent implements OnInit, OnChanges {
  @Input() idControlTemperatura: number | null = null;
  @ViewChild('tableCalentamiento') table!: Table;

  loading: boolean = false;
  editingRow: CalentamientoData | null = null;
  clonedCalentamiento: { [s: string]: CalentamientoData } = {};
  dataCalentamiento: CalentamientoData[] = [];
  private isInitialLoad: boolean = true;

  readonly headersCalentamiento: TableColumn[] = [
    { header: '0', field: 'temp_0', width: '80px', tipo: 'number' },
    { header: '5', field: 'temp_5', width: '80px', tipo: 'number' },
    { header: '10', field: 'temp_10', width: '80px', tipo: 'number' },
    { header: '15', field: 'temp_15', width: '80px', tipo: 'number' },
    { header: '20', field: 'temp_20', width: '80px', tipo: 'number' },
    { header: '25', field: 'temp_25', width: '80px', tipo: 'number' },
    { header: '30', field: 'temp_30', width: '80px', tipo: 'number' },
    { header: '35', field: 'temp_35', width: '80px', tipo: 'number' },
    { header: '40', field: 'temp_40', width: '80px', tipo: 'number' },
    { header: '45', field: 'temp_45', width: '80px', tipo: 'number' },
    { header: '50', field: 'temp_50', width: '80px', tipo: 'number' },
    { header: '55', field: 'temp_55', width: '80px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly calentamientoService: CalentamientoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idControlTemperatura) {
      this.loadDataCalentamiento();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idControlTemperatura']?.currentValue && !this.isInitialLoad) {
      this.loadDataCalentamiento();
    } else if (changes['idControlTemperatura']?.currentValue && this.isInitialLoad) {
      this.loadDataCalentamiento();
      this.isInitialLoad = false;
    }
  }

  loadDataCalentamiento(): void {
    if (!this.idControlTemperatura) return;
    if (this.loading) return;

    this.loading = true;

    this.calentamientoService.getAllControlTemperatura().subscribe({
      next: (response: BackendApiResponse<ControlTemperaturaCompleta[]>) => {
        const registro = response.data?.find(item => item.id === this.idControlTemperatura);

        if (registro && registro.calentamientos && registro.calentamientos.length > 0) {
          this.dataCalentamiento = [this.transformarArrayCalentamientoAFrontend(registro.calentamientos, registro)];
          this.mostrarExito('Calentamiento cargado correctamente');
        } else {
          this.dataCalentamiento = [this.construirRegistroVacio()];
          this.mostrarInfo('No hay calentamiento registrado. Complete los campos.');
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.manejarErrorCarga(error);
      }
    });
  }

  // ============= TRANSFORMACIONES DE DATOS =============

  private transformarArrayCalentamientoAFrontend(
    calentamientos: CalentamientoAPIResponse[],
    registro: ControlTemperaturaCompleta
  ): CalentamientoData {
    const resultado: CalentamientoData = {
      id: registro.id,
      temp_0: null, temp_5: null, temp_10: null, temp_15: null,
      temp_20: null, temp_25: null, temp_30: null, temp_35: null,
      temp_40: null, temp_45: null, temp_50: null, temp_55: null,
      id_control_temperatura: registro.id,
      isNew: false
    };

    calentamientos.forEach(cal => {
      switch (cal.minuto) {
        case '0': resultado.temp_0 = cal.valor; break;
        case '5': resultado.temp_5 = cal.valor; break;
        case '10': resultado.temp_10 = cal.valor; break;
        case '15': resultado.temp_15 = cal.valor; break;
        case '20': resultado.temp_20 = cal.valor; break;
        case '25': resultado.temp_25 = cal.valor; break;
        case '30': resultado.temp_30 = cal.valor; break;
        case '35': resultado.temp_35 = cal.valor; break;
        case '40': resultado.temp_40 = cal.valor; break;
        case '45': resultado.temp_45 = cal.valor; break;
        case '50': resultado.temp_50 = cal.valor; break;
        case '55': resultado.temp_55 = cal.valor; break;
      }
    });

    return resultado;
  }

  private transformarFrontendAArray(datos: CalentamientoData): any[] {
    const resultado: any[] = [];
    const campos = [
      { campo: 'temp_0', minuto: '0' }, { campo: 'temp_5', minuto: '5' },
      { campo: 'temp_10', minuto: '10' }, { campo: 'temp_15', minuto: '15' },
      { campo: 'temp_20', minuto: '20' }, { campo: 'temp_25', minuto: '25' },
      { campo: 'temp_30', minuto: '30' }, { campo: 'temp_35', minuto: '35' },
      { campo: 'temp_40', minuto: '40' }, { campo: 'temp_45', minuto: '45' },
      { campo: 'temp_50', minuto: '50' }, { campo: 'temp_55', minuto: '55' }
    ];

    campos.forEach(({ campo, minuto }) => {
      const valor = (datos as any)[campo];
      if (valor !== null && valor !== undefined) {
        resultado.push({
          minuto,
          valor,
          temperaturaPasteurizadorId: this.idControlTemperatura!
        });
      }
    });

    return resultado;
  }

  private async obtenerIDsExistentes(): Promise<{ [minuto: string]: number }> {
    return new Promise((resolve, reject) => {
      this.calentamientoService.getAllControlTemperatura().subscribe({
        next: (response: BackendApiResponse<ControlTemperaturaCompleta[]>) => {
          const registro = response.data?.find(item => item.id === this.idControlTemperatura);
          const idsMap: { [minuto: string]: number } = {};

          if (registro?.calentamientos) {
            registro.calentamientos.forEach(cal => {
              idsMap[cal.minuto] = cal.id;
            });
          }

          resolve(idsMap);
        },
        error: (error) => reject(error)
      });
    });
  }

  private async transformarFrontendAArrayConIDs(datos: CalentamientoData): Promise<any[]> {
    const idsExistentes = await this.obtenerIDsExistentes();
    const resultado: any[] = [];
    const campos = [
      { campo: 'temp_0', minuto: '0' }, { campo: 'temp_5', minuto: '5' },
      { campo: 'temp_10', minuto: '10' }, { campo: 'temp_15', minuto: '15' },
      { campo: 'temp_20', minuto: '20' }, { campo: 'temp_25', minuto: '25' },
      { campo: 'temp_30', minuto: '30' }, { campo: 'temp_35', minuto: '35' },
      { campo: 'temp_40', minuto: '40' }, { campo: 'temp_45', minuto: '45' },
      { campo: 'temp_50', minuto: '50' }, { campo: 'temp_55', minuto: '55' }
    ];

    campos.forEach(({ campo, minuto }) => {
      const valor = (datos as any)[campo];
      if (valor !== null && valor !== undefined) {
        const item: any = {
          minuto,
          valor,
          temperaturaPasteurizadorId: this.idControlTemperatura!
        };

        if (idsExistentes[minuto]) {
          item.id = idsExistentes[minuto];
        }

        resultado.push(item);
      }
    });

    return resultado;
  }

  // ============= MÉTODOS DE CRUD =============

  onRowEditSave(dataRow: CalentamientoData, index: number, event: MouseEvent): void {
    if (!this.validarAlMenosUnCampo(dataRow)) {
      this.mostrarError('Debe ingresar al menos una temperatura');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionCalentamiento(dataRow, rowElement);
    } else {
      this.procesarActualizacionCalentamiento(dataRow, rowElement);
    }
  }

  private procesarCreacionCalentamiento(dataRow: CalentamientoData, rowElement: HTMLTableRowElement): void {
    const arrayCalentamiento = this.transformarFrontendAArray(dataRow);
    console.log('Creando calentamiento con array:', arrayCalentamiento);

    this.calentamientoService.postCalentamiento(arrayCalentamiento).subscribe({
      next: (response) => {
        console.log('Respuesta POST:', response);
        dataRow.isNew = false;
        dataRow.id = Date.now(); // ID temporal
        this.editingRow = null;
        this.table.saveRowEdit(dataRow, rowElement);
        this.mostrarExito('Calentamiento creado correctamente');
      },
      error: (error) => {
        console.error('Error al crear calentamiento:', error);
        this.mostrarError('Error al crear el calentamiento');
      }
    });
  }

  private async procesarActualizacionCalentamiento(dataRow: CalentamientoData, rowElement: HTMLTableRowElement): Promise<void> {
    try {
      const arrayCalentamiento = await this.transformarFrontendAArrayConIDs(dataRow);
      console.log('Actualizando calentamiento con array:', arrayCalentamiento);

      this.calentamientoService.putCalentamiento(arrayCalentamiento).subscribe({
        next: (response) => {
          console.log('Respuesta PUT:', response);
          const rowId = this.getRowId(dataRow);
          delete this.clonedCalentamiento[rowId];
          this.editingRow = null;
          this.table.saveRowEdit(dataRow, rowElement);
          this.mostrarExito('Calentamiento actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar calentamiento:', error);
          this.mostrarError('Error al actualizar el calentamiento');
        }
      });
    } catch (error) {
      console.error('Error al preparar datos para actualización:', error);
      this.mostrarError('Error al preparar los datos para actualización');
    }
  }

  // ============= MÉTODOS AUXILIARES =============

  private construirRegistroVacio(): CalentamientoData {
    return {
      id: null,
      temp_0: null, temp_5: null, temp_10: null, temp_15: null,
      temp_20: null, temp_25: null, temp_30: null, temp_35: null,
      temp_40: null, temp_45: null, temp_50: null, temp_55: null,
      id_control_temperatura: this.idControlTemperatura!,
      isNew: true
    };
  }

  onRowEditInit(dataRow: CalentamientoData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedCalentamiento[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditCancel(dataRow: CalentamientoData, index: number): void {
    if (dataRow.isNew) {
      this.dataCalentamiento[index] = this.construirRegistroVacio();
      this.dataCalentamiento = [...this.dataCalentamiento];
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataCalentamiento[index] = this.clonedCalentamiento[rowId];
      delete this.clonedCalentamiento[rowId];
    }
    this.editingRow = null;
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarAlMenosUnCampo(dataRow: CalentamientoData): boolean {
    return !!(
      dataRow.temp_0 !== null || dataRow.temp_5 !== null ||
      dataRow.temp_10 !== null || dataRow.temp_15 !== null ||
      dataRow.temp_20 !== null || dataRow.temp_25 !== null ||
      dataRow.temp_30 !== null || dataRow.temp_35 !== null ||
      dataRow.temp_40 !== null || dataRow.temp_45 !== null ||
      dataRow.temp_50 !== null || dataRow.temp_55 !== null
    );
  }

  private getRowId(dataRow: CalentamientoData): string {
    return dataRow.id?.toString() || 'new';
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      this.dataCalentamiento = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay calentamiento registrado. Complete los campos.');
    } else {
      console.error('Error al cargar calentamiento:', error);
      this.mostrarError('Error al cargar el calentamiento');
    }
  }

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje, key: 'tr', life: 2000 });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje, key: 'tr', life: 3000 });
  }

  private mostrarInfo(mensaje: string): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: mensaje, key: 'tr', life: 2000 });
  }
}
