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
import { TemperaturaData, CajaTable, TemperaturaRutas, BodyTemperaturaRutas, ResponseTemperaturaCasas, ResponseDataRuta } from '../interfaces/primaryDialog.interface';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { NewRegisterCajaComponent } from '../new-register-caja/new-register-caja.component';
import { catchError, concatMap, forkJoin, lastValueFrom, Observable, of, switchMap, tap } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';

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

  @ViewChildren(Table) primeNgTables!: QueryList<Table>;

  cajaTables: CajaTable[] = [];
  globalCajaCounter: number = 1;
  isAnyTableEditing: boolean = false;
  hasNewEmptyCaja: boolean = false;
  temperaturasRuta: TemperaturaRutas[] = [];
  dataRuta: any = {} as ResponseDataRuta;
  tableAuxCaja: CajaTable[] = [];

  requiredFields: string[] = ['caja'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initComponent(changes);
  }

  async initComponent(changes?: SimpleChanges, flat: boolean = false): Promise<void>{
    if (
      (changes && changes['dataRutaRecoleccion'] &&
        changes['dataRutaRecoleccion'].currentValue) || flat
    ) {
      const observable$ = of(null).pipe(
        concatMap(() => this.loadDataRuta(this.dataRutaRecoleccion?.id_ruta!)),
        concatMap(() => this.loadDataTemperaturaRuta(this.dataRutaRecoleccion?.id_ruta!)),
        concatMap(() => this.loadDataTemperaturaCasa(this.dataRutaRecoleccion?.id_ruta!))
      );

      // Espera a que se complete toda la secuencia
      await lastValueFrom(observable$);
    }
  }

  loadDataRuta(idRuta: number): Observable<ApiResponse | null> {
    return this._primaryService.getRutaRecoleccionById(idRuta).pipe(
      tap((data) => {
        if (data) {
          this.dataRuta = data.data;
        }
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        return of(null);
      })
    );
  }

  loadDataTemperaturaCasa(idRuta: number): Observable<ApiResponse | null> {
    return this._primaryService.getDataTemperaturaCasa(idRuta).pipe(
      tap((data) => {
        if (data) {
          this.formatData(data.data);
          this.dataLoaded.emit(true);
        } else {
          this.dataLoaded.emit(false);
          // this.initializeFirstTable();
        }
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        return of(null);
      })
    );
  }
  loadDataTemperaturaRuta(idRuta: number): Observable<ApiResponse | null> {
    return this._primaryService.getTemperaturaRuta(idRuta).pipe(
      tap((data) => {
        if (data.data) {
          this.temperaturasRuta = data.data;
        }
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        return of(null);
      })
    )
  }
  formatData(data: TemperaturaData[]): void {
    this.cajaTables = [];
    this.globalCajaCounter = 1;
    const cajaGroupsOne = this.groupDataByCaja(data);
    const cajaGroupsTwo = this.groupDataByTemperaturaRuta(this.temperaturasRuta);
    if (data.length > 0) {
      cajaGroupsOne.forEach((cajaData, index) => {
        const cajaTable = this.createTableForCaja(this.globalCajaCounter, cajaData, true);
        this.cajaTables.push(cajaTable);
        this.globalCajaCounter++;
      });
    }
    this.globalCajaCounter = 1;
    if (cajaGroupsOne.length != cajaGroupsTwo.length && cajaGroupsTwo.length > 0) {
      cajaGroupsTwo.forEach((cajaData, index) => {
        const cajaTable = this.createTableForCaja(this.globalCajaCounter, cajaData, false);
        this.cajaTables.push(cajaTable);
        this.globalCajaCounter++;
      });
    }
    this.globalCajaCounter = data[data.length - 1]?.caja || 1;
    if (data.length > 0) {
      this.globalCajaCounter++;
    }

    const unique = this.cajaTables.filter(
      (obj, index, self) =>
        index === self.findIndex(o => o.cajaNumber === obj.cajaNumber)
    );
    this.cajaTables = unique;
    this.tableAuxCaja = JSON.parse(JSON.stringify(unique));
  }

  groupDataByTemperaturaRuta(data: TemperaturaRutas[]): TemperaturaRutas[][] {
    const grupos = data.reduce((acc, obj) => {
      const key = String(obj.numeroCaja);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {} as Record<string, TemperaturaRutas[]>);
    return Object.values(grupos);
  }

  groupDataByCaja(data: TemperaturaData[]): TemperaturaData[][] {
    const grupos = data.reduce((acc, obj) => {
      const key = String(obj.caja);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {} as Record<string, TemperaturaData[]>);
    return Object.values(grupos);
  }
  createTableForCaja(cajaNumber: number, temperaturaData: any[], flat?: boolean): CajaTable {
    const baseHeaders = [
      { header: 'No. CAJA', field: 'caja', width: '200px', tipo: 'number' },
      {
        header: 'HORA DE SALIDA',
        field: 'horaSalida',
        width: '200px',
        tipo: 'time',
      },
      {
        header: 'T° DE SALIDA',
        field: 'temperaturaSalida',
        width: '200px',
        tipo: 'number',
      },
      {
        header: 'HORA DE LLEGADA',
        field: 'horaLlegada',
        width: '200px',
        tipo: 'time',
      },
      {
        header: 'T° DE LLEGADA',
        field: 'temperaturaLlegada',
        width: '200px',
        tipo: 'number',
      },
      { header: 'ACCIONES', field: 'acciones', width: '200px' },
    ];
    const tempFilter = this.temperaturasRuta.filter(x => x.numeroCaja === cajaNumber)[0];
    const dataRow: any = {
      id: tempFilter?.id || null,
      caja: cajaNumber,
      horaSalida: null,
      temperaturaSalida: null,
      horaLlegada: null,
      temperaturaLlegada: null,
    };
    if (temperaturaData.length > 0) {
      dataRow.horaSalida = this.dataRuta.horaSalida || null;
      dataRow.temperaturaSalida = tempFilter.temperaturaSalida != null
        ? parseFloat(
          (tempFilter.temperaturaSalida?.toString() ?? '').split('°')[0]
        )
        : null;
      dataRow.horaLlegada = this.dataRuta.horaLlegada || null;
      dataRow.temperaturaLlegada = tempFilter.temperaturaLlegada != null
        ? parseFloat(
          (tempFilter.temperaturaLlegada?.toString() ?? '').split('°')[0]
        )
        : null;
    }
    const tempHeaders: any[] = [];
    if (temperaturaData.length > 0 && flat) {
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
        (dataRow as any)["id_" + tempHeader.field] = temp.id;

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

    this.hasNewEmptyCaja = false;

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
    const hasBasicData = dataRow.horaSalida || dataRow.temperaturaSalida || dataRow.horaLlegada || dataRow.temperaturaLlegada;
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

    // CONSTRUCCION BODY PARA GUARDAR LOS CAMBIOS
    const tablaOrigi = this.cajaTables[tableIndex].data[0];
    const tablaCopy = this.tableAuxCaja[tableIndex]?.data[0] || dataRow;
    const diferencias: Record<string, { obj1: any; obj2: any }> = {};
    let inputsBodies: any[] = [];
    let keysAdd: any[] = [];

    for (const key in tablaOrigi) {
      if (tablaCopy[key] !== tablaOrigi[key]) {
        diferencias[key] = { obj1: tablaCopy[key], obj2: tablaOrigi[key] };
      }
    }
    const keys = Object.keys(diferencias).map(k => {
      if (k.split("_").length === 2) {
        return Number(k.split("_")[1])
      }
      else {
        return k;
      }
    });

    for (const key in tablaOrigi) {
      const keyAux = key.toString().split("_");
      if (keyAux.length === 3) {
        for (const id of keys) {

          const existe = keysAdd.includes(id);

          if ((typeof id === "number" && !existe) || (id === "horaSalida" || id === "horaLlegada")) {
            if ((id === Number(keyAux[2]) || (id === "horaSalida" || id === "horaLlegada"))) {
              inputsBodies.push(
                {
                  opt: 0,
                  id: tablaOrigi["id_temperature_" + id] || null,
                  numeroCasa: id,
                  temperatura: tablaOrigi["temperature_" + id] || null,
                  horaSalida: tablaOrigi["horaSalida"] != null ? typeof tablaOrigi["horaSalida"] != "string" ? tablaOrigi["horaSalida"].toTimeString().split(" ")[0].slice(0, 5) : tablaOrigi["horaSalida"] : tablaOrigi["horaSalida"],
                  horaLlegada: tablaOrigi["horaLlegada"] != null ? typeof tablaOrigi["horaLlegada"] != "string" ? tablaOrigi["horaLlegada"].toTimeString().split(" ")[0].slice(0, 5) : tablaOrigi["horaLlegada"] : tablaOrigi["horaLlegada"],
                  caja: tablaOrigi["caja"],
                  ruta: { id: this.dataRutaRecoleccion?.id_ruta! }
                }
              )
              keysAdd.push(id);
            }
          } else if (typeof id === "string" && !existe) {
            inputsBodies.push(
              {
                opt: 1,
                id: tablaOrigi.id || null,
                ruta: { id: this.dataRutaRecoleccion?.id_ruta! },
                numeroCaja: tablaOrigi["caja"],
                temperaturaLlegada: tablaOrigi["temperaturaLlegada"],
                temperaturaSalida: tablaOrigi["temperaturaSalida"],
              }
            )
            keysAdd.push(id);

          }
        }
      }
    }

    if (inputsBodies.length === 0) {
      inputsBodies.push(
        {
          opt: 1,
          id: tablaOrigi.id || null,
          ruta: { id: this.dataRutaRecoleccion?.id_ruta! },
          numeroCaja: tablaOrigi["caja"],
          temperaturaLlegada: tablaOrigi["temperaturaLlegada"],
          temperaturaSalida: tablaOrigi["temperaturaSalida"],
        }
      );
      inputsBodies.push(
        {
          opt: 0,
          id: null,
          numeroCasa: keys[keys.length - 1] != undefined ? keys[keys.length - 1] : 1,
          temperatura: tablaOrigi["temperature_" + keys[keys.length - 1]?.toString()] || null,
          horaSalida: tablaOrigi["horaSalida"] != null ? typeof tablaOrigi["horaSalida"] != "string" ? tablaOrigi["horaSalida"].toTimeString().split(" ")[0].slice(0, 5) : tablaOrigi["horaSalida"] : tablaOrigi["horaSalida"],
          horaLlegada: tablaOrigi["horaLlegada"] != null ? typeof tablaOrigi["horaLlegada"] != "string" ? tablaOrigi["horaLlegada"].toTimeString().split(" ")[0].slice(0, 5) : tablaOrigi["horaLlegada"] : tablaOrigi["horaLlegada"],
          caja: tablaOrigi["caja"],
          ruta: { id: this.dataRutaRecoleccion?.id_ruta! }
        }
      )
      this.procesarBodies(tableIndex, dataRow, inputsBodies);
      return
    }

    const bodiesUniques = inputsBodies.filter(
      (valor, indice, self) =>
        indice === self.findIndex((p) => p.id === valor.id)
    );
    //PROCESAR PETICIONES
    this.procesarBodies(tableIndex, dataRow, bodiesUniques);
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

  async procesarBodies(tableIndex: number, dataRow: any, bodiesUniques: any[]) {

    if (this.saveTemperaturaUpdates(dataRow, tableIndex)) {
      this.finishEditingWithPrimeNG(tableIndex, dataRow);
      return;
    }

    const peticiones: Array<Observable<ApiResponse>> = bodiesUniques.map(item => {
      if (item.opt === 0) {
        return item.id
          ? this._primaryService.updateDataTemperatura(item.id, item) // UPDATE
          : this._primaryService.postDataTemperatura(item); // CREATE
      } else {
        return item.id
          ? this._primaryService.updateTemperaturaRuta(item.id, item) // UPDATE
          : this._primaryService.postCreateTemperaturaRuta(item); // CREATE
      }
    });

    forkJoin(peticiones).subscribe({
      next: (respuestas) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Se procesaron todas las temperaturas',
          key: 'tr',
          life: 3000,
        });

        this.hasNewEmptyCaja = false;
        this.finishEditingWithPrimeNG(tableIndex, dataRow);
        this.initComponent(undefined, true);

      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un problema al guardar',
          key: 'tr',
          life: 3000,
        });
      }
    });
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

    const nuevaTemperaturaIndex = Object.keys(table.data[0]).length > 6 ? table.numeroTemperaturas + 1 : 1;

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

  saveTemperaturaUpdates(dataRow: any, tableIndex: number): boolean {
    const table = this.cajaTables[tableIndex];

    if (!table.clonedRow) {
      this.finishEditingWithPrimeNG(tableIndex, dataRow);
      return true;
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

    const basicFields = ['horaSalida', 'temperaturaSalida', 'horaLlegada', 'temperaturaLlegada'];
    const hasBasicChanges = basicFields.some(field =>
      dataRow[field] !== table.clonedRow![field]
    );

    // CORRECCIÓN: Detectar nueva caja ANTES de cambiar hasNewEmptyCaja
    const isNewCaja = this.hasNewEmptyCaja && table.cajaNumber === this.globalCajaCounter - 1;

    if (temperaturasModificadas.length > 0) {
      return false;
    } else if (hasBasicChanges) {
      return false;
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
        return true;
      }
    }
    return false;

  }
}


