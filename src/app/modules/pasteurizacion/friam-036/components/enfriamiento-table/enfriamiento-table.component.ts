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

import { EnfriamientoService } from '../../services/enfriamiento.service';
import type {
  EnfriamientoData,
  TableColumn,
  BackendApiResponse,
  ControlTemperaturaCompleta,
  EnfriamientoAPIResponse
} from '../../interfaces/enfriamiento.interface';

@Component({
  selector: 'enfriamiento-table',
  standalone: true,
  imports: [
    TableModule, CommonModule, HttpClientModule, ProgressSpinnerModule, ToastModule,
    FormsModule, ButtonModule, InputTextModule, TooltipModule
  ],
  templateUrl: './enfriamiento-table.component.html',
  styleUrl: './enfriamiento-table.component.scss',
  providers: [MessageService]
})
export class EnfriamientoTableComponent implements OnInit, OnChanges {
  @Input() idControlTemperatura: number | null = null;
  @ViewChild('tableEnfriamiento') table!: Table;

  loading: boolean = false;
  editingRow: EnfriamientoData | null = null;
  clonedEnfriamiento: { [s: string]: EnfriamientoData } = {};
  dataEnfriamiento: EnfriamientoData[] = [];
  private isInitialLoad: boolean = true;

  readonly headersEnfriamiento: TableColumn[] = [
    { header: '0', field: 'temp_0', width: '100px', tipo: 'number' },
    { header: '5', field: 'temp_5', width: '100px', tipo: 'number' },
    { header: '10', field: 'temp_10', width: '100px', tipo: 'number' },
    { header: '15', field: 'temp_15', width: '100px', tipo: 'number' },
    { header: '20', field: 'temp_20', width: '100px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '120px', tipo: 'actions' }
  ];

  constructor(
    private readonly enfriamientoService: EnfriamientoService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.idControlTemperatura) {
      this.loadDataEnfriamiento();
      this.isInitialLoad = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idControlTemperatura']?.currentValue && !this.isInitialLoad) {
      this.loadDataEnfriamiento();
    } else if (changes['idControlTemperatura']?.currentValue && this.isInitialLoad) {
      this.loadDataEnfriamiento();
      this.isInitialLoad = false;
    }
  }

  loadDataEnfriamiento(): void {
    if (!this.idControlTemperatura) return;
    if (this.loading) return;

    this.loading = true;

    this.enfriamientoService.getAllControlTemperatura().subscribe({
      next: (response: BackendApiResponse<ControlTemperaturaCompleta[]>) => {
        const registro = response.data?.find(item => item.id === this.idControlTemperatura);

        if (registro && registro.enfriamientos && registro.enfriamientos.length > 0) {
          this.dataEnfriamiento = [this.transformarArrayEnfriamientoAFrontend(registro.enfriamientos, registro)];
          this.mostrarExito('Enfriamiento cargado correctamente');
        } else {
          this.dataEnfriamiento = [this.construirRegistroVacio()];
          this.mostrarInfo('No hay enfriamiento registrado. Complete los campos.');
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

  private transformarArrayEnfriamientoAFrontend(
    enfriamientos: EnfriamientoAPIResponse[],
    registro: ControlTemperaturaCompleta
  ): EnfriamientoData {
    const resultado: EnfriamientoData = {
      id: registro.id,
      temp_0: null,
      temp_5: null,
      temp_10: null,
      temp_15: null,
      temp_20: null,
      id_control_temperatura: registro.id,
      isNew: false
    };

    enfriamientos.forEach(enf => {
      switch (enf.minuto) {
        case '0': resultado.temp_0 = enf.valor; break;
        case '5': resultado.temp_5 = enf.valor; break;
        case '10': resultado.temp_10 = enf.valor; break;
        case '15': resultado.temp_15 = enf.valor; break;
        case '20': resultado.temp_20 = enf.valor; break;
      }
    });

    return resultado;
  }

  private transformarFrontendAArray(datos: EnfriamientoData): any[] {
    const resultado: any[] = [];
    const campos = [
      { campo: 'temp_0', minuto: '0' },
      { campo: 'temp_5', minuto: '5' },
      { campo: 'temp_10', minuto: '10' },
      { campo: 'temp_15', minuto: '15' },
      { campo: 'temp_20', minuto: '20' }
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
      this.enfriamientoService.getAllControlTemperatura().subscribe({
        next: (response: BackendApiResponse<ControlTemperaturaCompleta[]>) => {
          const registro = response.data?.find(item => item.id === this.idControlTemperatura);
          const idsMap: { [minuto: string]: number } = {};

          if (registro?.enfriamientos) {
            registro.enfriamientos.forEach(enf => {
              idsMap[enf.minuto] = enf.id;
            });
          }

          resolve(idsMap);
        },
        error: (error) => reject(error)
      });
    });
  }

  private async transformarFrontendAArrayConIDs(datos: EnfriamientoData): Promise<any[]> {
    const idsExistentes = await this.obtenerIDsExistentes();
    const resultado: any[] = [];
    const campos = [
      { campo: 'temp_0', minuto: '0' },
      { campo: 'temp_5', minuto: '5' },
      { campo: 'temp_10', minuto: '10' },
      { campo: 'temp_15', minuto: '15' },
      { campo: 'temp_20', minuto: '20' }
    ];

    campos.forEach(({ campo, minuto }) => {
      const valor = (datos as any)[campo];
      if (valor !== null && valor !== undefined) {
        const item: any = {
          minuto,
          valor,
          temperaturaPasteurizadorId: this.idControlTemperatura!
        };

        // Solo agregar ID si existe (para actualización)
        if (idsExistentes[minuto]) {
          item.id = idsExistentes[minuto];
        }

        resultado.push(item);
      }
    });

    return resultado;
  }

  // ============= MÉTODOS DE CRUD =============

  onRowEditSave(dataRow: EnfriamientoData, index: number, event: MouseEvent): void {
    if (!this.validarAlMenosUnCampo(dataRow)) {
      this.mostrarError('Debe ingresar al menos una temperatura');
      return;
    }

    const rowElement = this.obtenerElementoFila(event);

    if (dataRow.isNew) {
      this.procesarCreacionEnfriamiento(dataRow, rowElement);
    } else {
      this.procesarActualizacionEnfriamiento(dataRow, rowElement);
    }
  }

  private procesarCreacionEnfriamiento(dataRow: EnfriamientoData, rowElement: HTMLTableRowElement): void {
    const arrayEnfriamiento = this.transformarFrontendAArray(dataRow);

    this.enfriamientoService.postEnfriamiento(arrayEnfriamiento).subscribe({
      next: (response) => {
        dataRow.isNew = false;
        dataRow.id = Date.now(); // ID temporal
        this.editingRow = null;
        this.table.saveRowEdit(dataRow, rowElement);
        this.mostrarExito('Enfriamiento creado correctamente');
      },
      error: (error) => {
        console.error('Error al crear enfriamiento:', error);
        this.mostrarError('Error al crear el enfriamiento');
      }
    });
  }

  private async procesarActualizacionEnfriamiento(dataRow: EnfriamientoData, rowElement: HTMLTableRowElement): Promise<void> {
    try {
      const arrayEnfriamiento = await this.transformarFrontendAArrayConIDs(dataRow);

      this.enfriamientoService.putEnfriamiento(arrayEnfriamiento).subscribe({
        next: (response) => {
          const rowId = this.getRowId(dataRow);
          delete this.clonedEnfriamiento[rowId];
          this.editingRow = null;
          this.table.saveRowEdit(dataRow, rowElement);
          this.mostrarExito('Enfriamiento actualizado correctamente');
        },
        error: (error) => {
          console.error('Error al actualizar enfriamiento:', error);
          this.mostrarError('Error al actualizar el enfriamiento');
        }
      });
    } catch (error) {
      console.error('Error al preparar datos para actualización:', error);
      this.mostrarError('Error al preparar los datos para actualización');
    }
  }

  // ============= MÉTODOS AUXILIARES =============

  private construirRegistroVacio(): EnfriamientoData {
    return {
      id: null,
      temp_0: null,
      temp_5: null,
      temp_10: null,
      temp_15: null,
      temp_20: null,
      id_control_temperatura: this.idControlTemperatura!,
      isNew: true
    };
  }

  onRowEditInit(dataRow: EnfriamientoData): void {
    const rowId = this.getRowId(dataRow);
    this.clonedEnfriamiento[rowId] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditCancel(dataRow: EnfriamientoData, index: number): void {
    if (dataRow.isNew) {
      this.dataEnfriamiento[index] = this.construirRegistroVacio();
      this.dataEnfriamiento = [...this.dataEnfriamiento];
    } else {
      const rowId = this.getRowId(dataRow);
      this.dataEnfriamiento[index] = this.clonedEnfriamiento[rowId];
      delete this.clonedEnfriamiento[rowId];
    }
    this.editingRow = null;
  }

  private obtenerElementoFila(event: MouseEvent): HTMLTableRowElement {
    return (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
  }

  private validarAlMenosUnCampo(dataRow: EnfriamientoData): boolean {
    return !!(
      dataRow.temp_0 !== null || dataRow.temp_5 !== null ||
      dataRow.temp_10 !== null || dataRow.temp_15 !== null ||
      dataRow.temp_20 !== null
    );
  }

  private getRowId(dataRow: EnfriamientoData): string {
    return dataRow.id?.toString() || 'new';
  }

  private manejarErrorCarga(error: any): void {
    if (error.status === 204 || !error.status) {
      this.dataEnfriamiento = [this.construirRegistroVacio()];
      this.mostrarInfo('No hay enfriamiento registrado. Complete los campos.');
    } else {
      console.error('Error al cargar enfriamiento:', error);
      this.mostrarError('Error al cargar el enfriamiento');
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
