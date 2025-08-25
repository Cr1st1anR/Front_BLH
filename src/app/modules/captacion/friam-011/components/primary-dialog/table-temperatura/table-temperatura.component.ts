import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import { MessageService } from 'primeng/api';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { TemperaturaData, CajaTable } from '../interfaces/primaryDialog.interface';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { NewRegisterCajaComponent } from '../new-register-caja/new-register-caja.component';

@Component({
  selector: 'table-temperatura',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    ToastModule,
    TooltipModule,
    NewRegisterCajaComponent,
  ],
  providers: [primaryDialogServices, MessageService],
  templateUrl: './table-temperatura.component.html',
  styleUrl: './table-temperatura.component.scss',
})
export class TableTemperaturaComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() nuevaColumna: string | null = null;
  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;
  @Output() dataLoaded = new EventEmitter<boolean>();

  // CRÍTICO: Referencias a todas las tablas PrimeNG
  @ViewChildren(Table) primeNgTables!: QueryList<Table>;

  cajaTables: CajaTable[] = [];
  globalCajaCounter: number = 1;
  isAnyTableEditing: boolean = false;
  hasNewEmptyCaja: boolean = false;

  requiredFields: string[] = ['caja'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Asegurar que las referencias están disponibles
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['dataRutaRecoleccion'] &&
      changes['dataRutaRecoleccion'].currentValue
    ) {
      this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
    }
  }

  loadDataforTable(idRuta: number) {
    this._primaryService.getDataTemperaturaRuta(idRuta).subscribe({
      next: (response) => {
        if (response.data.length > 0) {
          this.formatData(response.data);
          this.dataLoaded.emit(true);
        } else {
          this.dataLoaded.emit(false);
          this.initializeFirstTable();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la data de temperatura.',
        });
        this.initializeFirstTable();
      },
    });
  }

  formatData(data: TemperaturaData[]): void {
    const cajaGroups = this.groupDataByCaja(data);

    this.cajaTables = [];
    this.globalCajaCounter = 1;

    cajaGroups.forEach((cajaData, index) => {
      const cajaTable = this.createTableForCaja(this.globalCajaCounter, cajaData);
      this.cajaTables.push(cajaTable);
      this.globalCajaCounter++;
    });
  }

  groupDataByCaja(data: TemperaturaData[]): TemperaturaData[][] {
    return [data];
  }

  createTableForCaja(cajaNumber: number, temperaturaData: TemperaturaData[]): CajaTable {
    const baseHeaders = [
      { header: 'No. CAJA', field: 'caja', width: '200px', tipo: 'number' },
      {
        header: 'HORA DE SALIDA',
        field: 'hora_salida',
        width: '200px',
        tipo: 'time',
      },
      {
        header: 'T° DE SALIDA',
        field: 't_salida',
        width: '200px',
        tipo: 'number',
      },
      {
        header: 'HORA DE LLEGADA',
        field: 'hora_llegada',
        width: '200px',
        tipo: 'time',
      },
      {
        header: 'T° DE LLEGADA',
        field: 't_llegada',
        width: '200px',
        tipo: 'number',
      },
      { header: 'ACCIONES', field: 'acciones', width: '200px' },
    ];

    const dataRow: any = {
      caja: cajaNumber,
      hora_salida: null,
      t_salida: null,
      hora_llegada: null,
      t_llegada: null,
    };

    if (temperaturaData.length > 0) {
      dataRow.hora_salida = this.dataRutaRecoleccion?.hora_salida || null;
      dataRow.t_salida = this.dataRutaRecoleccion?.temperatura_salida != null
        ? parseFloat(
          (this.dataRutaRecoleccion?.temperatura_salida?.toString() ?? '').split('°')[0]
        )
        : null;
      dataRow.hora_llegada = this.dataRutaRecoleccion?.hora_llegada || null;
      dataRow.t_llegada = this.dataRutaRecoleccion?.temperatura_llegada != null
        ? parseFloat(
          (this.dataRutaRecoleccion?.temperatura_llegada?.toString() ?? '').split('°')[0]
        )
        : null;
    }

    const tempHeaders: any[] = [];
    if (temperaturaData.length > 0) {
      temperaturaData.forEach((temp, index) => {
        const tempHeader = {
          header: `TEMPERATURA ${index + 1} (°C)`,
          field: `temperature_${index + 1}`,
          width: '200px',
          tipo: 'number',
          nCasa: index + 1,
        };
        tempHeaders.push(tempHeader);
        (dataRow as any)[tempHeader.field] = temp.temperatura;
      });
    }

    const finalHeaders = [...baseHeaders];
    finalHeaders.splice(5, 0, ...tempHeaders);

    return {
      cajaNumber: cajaNumber,
      data: [dataRow],
      headers: finalHeaders,
      editingRow: null,
      editingRowIndex: -1,
      clonedRow: null,
      editValidate: false,
      isAddingTemperature: false,
      numeroTemperaturas: temperaturaData.length,
    };
  }

  initializeFirstTable(): void {
    if (this.cajaTables.length === 0) {
      const firstTable = this.createTableForCaja(1, []);
      this.cajaTables.push(firstTable);
      this.globalCajaCounter = 2;
    }
  }

  agregarNuevaCaja() {
    if (this.isAnyTableEditing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la edición actual antes de crear una nueva caja',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    if (this.hasNewEmptyCaja) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar algún dato en la caja actual o cancelarla antes de crear una nueva',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    const newTable = this.createTableForCaja(this.globalCajaCounter, []);
    this.cajaTables.push(newTable);
    this.globalCajaCounter++;

    this.hasNewEmptyCaja = true;

    this.messageService.add({
      severity: 'success',
      summary: 'Nueva Caja',
      detail: `Caja ${newTable.cajaNumber} creada. Haga clic en el lápiz para editarla.`,
      key: 'tr',
      life: 3000,
    });
  }

  isNewCajaButtonDisabled(): boolean {
    return this.isAnyTableEditing || this.hasNewEmptyCaja;
  }

  onRowEditInit(dataRow: any, rowIndex: number, tableIndex: number): void {
    const table = this.cajaTables[tableIndex];

    if (table.editingRow === dataRow) {
      return;
    }

    table.clonedRow = { ...dataRow };
    table.editingRow = dataRow;
    table.editingRowIndex = rowIndex;
    table.editValidate = false;
    table.isAddingTemperature = false;
    this.isAnyTableEditing = true;
  }

  onRowEditSave(dataRow: any, rowIndex: number, tableIndex: number, event: any): void {
    const table = this.cajaTables[tableIndex];

    const hasBasicData = dataRow.hora_salida || dataRow.t_salida || dataRow.hora_llegada || dataRow.t_llegada;
    const hasTemperatureData = table.numeroTemperaturas > 0;

    if (!hasBasicData && !hasTemperatureData && !table.isAddingTemperature) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe completar al menos un campo antes de guardar.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    if (table.editValidate) {
      const invalidField = this.requiredFields.find((field) =>
        this.isFieldInvalid(field, dataRow, table)
      );
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
    }

    if (table.isAddingTemperature) {
      const ultimaTemperatura = this.getUltimaTemperaturaEnTabla(tableIndex);
      const temperatureField = `temperature_${ultimaTemperatura}`;
      const temperatureValue = (dataRow as any)[temperatureField];

      if (!temperatureValue || temperatureValue === null || temperatureValue === '') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Debe ingresar un valor para la nueva temperatura o cancelar la operación.',
          key: 'tr',
          life: 3000,
        });
        return;
      }
    }

    if (table.editValidate) {
      const bodyFormat = this.formatInputBody(dataRow, table);
      this._primaryService.postDataTemperatura(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Nueva temperatura guardada',
            key: 'tr',
            life: 3000,
          });
          this.hasNewEmptyCaja = false;
          // CRÍTICO: Usar referencia de PrimeNG para sincronizar
          this.finishEditingWithPrimeNG(tableIndex, dataRow);
          this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un error al guardar',
            key: 'tr',
            life: 3000,
          });
        },
      });
    } else {
      this.saveTemperaturaUpdates(dataRow, rowIndex, tableIndex);
    }
  }

  onRowEditCancel(dataRow: any, rowIndex: number, tableIndex: number): void {
    const table = this.cajaTables[tableIndex];

    if (table.editValidate || table.isAddingTemperature) {
      // CASO: Cancelar nueva temperatura
      const ultimaTemperatura = this.getUltimaTemperaturaEnTabla(tableIndex);

      if (ultimaTemperatura > 0 && table.isAddingTemperature) {
        // Eliminar la nueva columna de temperatura
        delete (dataRow as any)[`temperature_${ultimaTemperatura}`];

        const headerIndex = table.headers.findIndex(h => h.field === `temperature_${ultimaTemperatura}`);
        if (headerIndex > -1) {
          table.headers.splice(headerIndex, 1);
        }
        table.numeroTemperaturas = Math.max(0, table.numeroTemperaturas - 1);
      }

      // CORRECCIÓN CRÍTICA: Restaurar TODOS los valores del clonedRow original
      if (table.clonedRow) {
        // Restaurar campos básicos
        const basicFields = ['caja', 'hora_salida', 't_salida', 'hora_llegada', 't_llegada'];
        basicFields.forEach(field => {
          if (table.clonedRow!.hasOwnProperty(field)) {
            (dataRow as any)[field] = (table.clonedRow as any)[field];
          }
        });

        // Restaurar todas las temperaturas existentes
        for (let i = 1; i <= 10; i++) {
          const tempField = `temperature_${i}`;
          if (table.clonedRow!.hasOwnProperty(tempField)) {
            (dataRow as any)[tempField] = (table.clonedRow as any)[tempField];
          }
        }
      }

      // Verificar si debe eliminar caja vacía
      const hasBasicData = dataRow.hora_salida || dataRow.t_salida || dataRow.hora_llegada || dataRow.t_llegada;
      const hasTemperatureData = table.numeroTemperaturas > 0;

      if (!hasBasicData && !hasTemperatureData && table.cajaNumber === this.globalCajaCounter - 1) {
        this.hasNewEmptyCaja = false;
        this.cajaTables.splice(tableIndex, 1);
        this.globalCajaCounter--;
        this.finishEditing(tableIndex);
        return;
      }
    } else {
      // CASO: Cancelar edición normal
      const isNewEmptyTable = table.cajaNumber === this.globalCajaCounter - 1;
      const hasAnyData = dataRow.hora_salida || dataRow.t_salida || dataRow.hora_llegada || dataRow.t_llegada || table.numeroTemperaturas > 0;

      if (isNewEmptyTable && !hasAnyData) {
        this.hasNewEmptyCaja = false;
        this.cajaTables.splice(tableIndex, 1);
        this.globalCajaCounter--;
        this.finishEditing(tableIndex);
        return;
      }

      // CORRECCIÓN CRÍTICA: Restaurar valores originales correctamente
      if (table.clonedRow) {
        // Restaurar campos básicos
        const basicFields = ['caja', 'hora_salida', 't_salida', 'hora_llegada', 't_llegada'];
        basicFields.forEach(field => {
          if (table.clonedRow!.hasOwnProperty(field)) {
            (dataRow as any)[field] = (table.clonedRow as any)[field];
          }
        });

        // Restaurar todas las temperaturas existentes
        for (let i = 1; i <= 10; i++) {
          const tempField = `temperature_${i}`;
          if (table.clonedRow!.hasOwnProperty(tempField)) {
            (dataRow as any)[tempField] = (table.clonedRow as any)[tempField];
          }
        }
      }
    }

    this.finishEditing(tableIndex);
  }

  // NUEVO MÉTODO: Terminar edición usando referencias de PrimeNG
  private finishEditingWithPrimeNG(tableIndex: number, dataRow?: any): void {
    if (tableIndex < this.cajaTables.length) {
      const table = this.cajaTables[tableIndex];

      // CRÍTICO: Obtener la referencia correcta de PrimeNG
      const primeTable = this.primeNgTables?.toArray()[tableIndex];

      if (primeTable && dataRow) {
        try {
          // OPCIÓN 1: Intentar con cancelRowEdit para limpiar el estado
          primeTable.cancelRowEdit(dataRow);
        } catch (error) {
          console.warn('No se pudo sincronizar con PrimeNG, usando método manual');
          this.forceManualSync(tableIndex);
        }
      } else {
        // Si no hay referencias, usar método manual
        this.forceManualSync(tableIndex);
      }

      // Limpiar estados internos
      table.editingRow = null;
      table.editingRowIndex = -1;
      table.editValidate = false;
      table.isAddingTemperature = false;
      table.clonedRow = null;
    }
    this.isAnyTableEditing = false;

    // Forzar detección de cambios
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // MÉTODO DE EMERGENCIA: Fuerza sincronización manual
  private forceManualSync(tableIndex: number): void {
    // Re-crear el array de headers para forzar re-render
    const table = this.cajaTables[tableIndex];
    table.headers = [...table.headers];

    // Forzar cambio en el data array
    table.data = [...table.data];

    // Múltiple detección de cambios
    this.cdr.detectChanges();
    this.cdr.markForCheck();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 10);

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  // SOLUCIÓN SIMPLIFICADA: Un solo método finishEditing más robusto
  finishEditing(tableIndex: number): void {
    if (tableIndex < this.cajaTables.length) {
      const table = this.cajaTables[tableIndex];
      table.editingRow = null;
      table.editingRowIndex = -1;
      table.editValidate = false;
      table.isAddingTemperature = false;
      table.clonedRow = null;
    }
    this.isAnyTableEditing = false;

    // Usar método de sincronización manual
    this.forceManualSync(tableIndex);
  }

  isFieldInvalid(field: string, dataRow: any, table: CajaTable): boolean {
    this.requiredFields = ['caja'];

    if (table.isAddingTemperature) {
      const ultimaTemperatura = this.getUltimaTemperaturaEnTabla(this.cajaTables.indexOf(table));
      if (ultimaTemperatura > 0) {
        this.requiredFields.push(`temperature_${ultimaTemperatura}`);
      }
    }

    return (
      this.requiredFields.includes(field) &&
      (dataRow[field] === null ||
        dataRow[field] === undefined ||
        dataRow[field] === '')
    );
  }

  getUltimaTemperaturaEnTabla(tableIndex: number): number {
    const table = this.cajaTables[tableIndex];
    const dataRow = table.data[0];
    let ultimaTemperatura = 0;

    for (let i = 1; i <= 10; i++) {
      if ((dataRow as any)[`temperature_${i}`] !== undefined) {
        ultimaTemperatura = i;
      }
    }

    return ultimaTemperatura;
  }

  // CORRECCIÓN 3: Mejorar agregarColumnaTemperatura para preservar clonedRow original
  agregarColumnaTemperatura(tableIndex: number) {
    const table = this.cajaTables[tableIndex];

    if (table.isAddingTemperature) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la temperatura actual antes de agregar otra.',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    // CORRECCIÓN CRÍTICA: Preservar clonedRow original ANTES de agregar nueva temperatura
    if (!table.clonedRow) {
      table.clonedRow = { ...table.data[0] };
    }

    const nuevaTemperaturaIndex = table.numeroTemperaturas + 1;

    const temperatura = {
      header: `TEMPERATURA ${nuevaTemperaturaIndex} (°C)`,
      field: `temperature_${nuevaTemperaturaIndex}`,
      width: '200px',
      tipo: 'number',
      nCasa: nuevaTemperaturaIndex,
    };

    table.headers.splice(5 + nuevaTemperaturaIndex - 1, 0, temperatura);
    table.numeroTemperaturas = nuevaTemperaturaIndex;

    (table.data[0] as any)[temperatura.field] = null;

    table.editValidate = true;
    table.isAddingTemperature = true;

    // NO modificar clonedRow aquí - mantener el original para poder restaurar correctamente
  }

  isEditButtonDisabled(tableIndex: number): boolean {
    return this.cajaTables.some((table, index) =>
      index !== tableIndex && table.editingRow !== null
    );
  }

  formatInputBody(body: any, table: CajaTable) {
    const ultimaTemperatura = this.getUltimaTemperaturaEnTabla(this.cajaTables.indexOf(table));

    return {
      numeroCasa: ultimaTemperatura,
      temperatura: (body as any)[`temperature_${ultimaTemperatura}`]
        ? parseFloat((body as any)[`temperature_${ultimaTemperatura}`])
        : null,
      ruta: this.dataRutaRecoleccion?.id_ruta,
    };
  }

  saveTemperaturaUpdates(dataRow: any, rowIndex: number, tableIndex: number) {
    const table = this.cajaTables[tableIndex];

    if (!table.clonedRow) {
      this.finishEditingWithPrimeNG(tableIndex, dataRow);
      return;
    }

    const temperaturasModificadas = [];
    const temperaturasEnTabla = this.getUltimaTemperaturaEnTabla(tableIndex);

    for (let i = 1; i <= temperaturasEnTabla; i++) {
      const fieldName = `temperature_${i}`;
      const valorOriginal = (table.clonedRow as any)[fieldName];
      const valorActual = (dataRow as any)[fieldName];

      if (
        valorActual !== undefined &&
        valorActual !== null &&
        valorActual !== valorOriginal
      ) {
        temperaturasModificadas.push({
          numeroCasa: i,
          temperatura: parseFloat(valorActual),
          ruta: this.dataRutaRecoleccion?.id_ruta,
        });
      }
    }

    const basicFields = ['hora_salida', 't_salida', 'hora_llegada', 't_llegada'];
    const hasBasicChanges = basicFields.some(field =>
      dataRow[field] !== table.clonedRow![field]
    );

    // CORRECCIÓN: Detectar nueva caja ANTES de cambiar hasNewEmptyCaja
    const isNewCaja = this.hasNewEmptyCaja && table.cajaNumber === this.globalCajaCounter - 1;

    if (temperaturasModificadas.length > 0) {
      this.hasNewEmptyCaja = false;

      let actualizacionesCompletadas = 0;
      const totalActualizaciones = temperaturasModificadas.length;

      temperaturasModificadas.forEach((tempData) => {
        this._primaryService.updateDataTemperatura(tempData).subscribe({
          next: (data) => {
            actualizacionesCompletadas++;

            if (actualizacionesCompletadas === totalActualizaciones) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Temperaturas actualizadas correctamente',
                key: 'tr',
                life: 3000,
              });
              this.finishEditingWithPrimeNG(tableIndex, dataRow);
              this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al actualizar temperatura ${tempData.numeroCasa}`,
              key: 'tr',
              life: 3000,
            });
            actualizacionesCompletadas++;
            if (actualizacionesCompletadas === totalActualizaciones) {
              this.finishEditingWithPrimeNG(tableIndex, dataRow);
            }
          },
        });
      });
    } else if (hasBasicChanges) {
      // CORRECCIÓN: Usar la variable isNewCaja detectada ANTES de cambiar el flag
      const mensaje = isNewCaja ? 'Datos guardados correctamente' : 'Datos de caja actualizados';

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: mensaje,
        key: 'tr',
        life: 3000,
      });

      this.hasNewEmptyCaja = false;
      this.finishEditingWithPrimeNG(tableIndex, dataRow);
    } else {
      const hasExistingData = basicFields.some(field =>
        table.clonedRow![field] !== null && table.clonedRow![field] !== undefined
      ) || temperaturasEnTabla > 0;

      if (hasExistingData) {
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: 'No se detectaron cambios para guardar',
          key: 'tr',
          life: 3000,
        });
        return;
      }

      this.finishEditingWithPrimeNG(tableIndex, dataRow);
    }
  }
}
