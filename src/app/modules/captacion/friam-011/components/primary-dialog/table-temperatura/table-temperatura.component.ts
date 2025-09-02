import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import { MessageService } from 'primeng/api';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { TemperaturaData } from '../interfaces/primaryDialog.interface';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { NewRegisterTemperaturaComponent } from '../new-register-temperatura/new-register-temperatura.component';

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
    NewRegisterTemperaturaComponent,
  ],
  providers: [primaryDialogServices, MessageService],
  templateUrl: './table-temperatura.component.html',
  styleUrl: './table-temperatura.component.scss',
})
export class TableTemperaturaComponent implements OnInit, OnChanges {
  @Input() nuevaColumna: string | null = null;
  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;
  @Output() dataLoaded = new EventEmitter<boolean>();
  @ViewChild('tableTemp') table!: Table;

  dataTableTemp: any[] = [];
  clonedTableTemp: { [s: number]: TemperaturaData } = {};

  headerTableTemperatura: any[] = [
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

  editingColumn: string | null = null;
  editingRow: TemperaturaData | null = null;
  numerosDatos: number = 0;
  editValidate: boolean = false;

  requiredFields: string[] = ['caja'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices
  ) {}

  ngOnInit(): void {}

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
          this.dataTableTemp = this.formatData(response.data);
          this.dataLoaded.emit(true);
        } else {
          this.dataLoaded.emit(false);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la data de temperatura.',
        });
      },
    });
  }

  formatData(data: TemperaturaData[]): any[] {
    this.numerosDatos = data.length;

    this.headerTableTemperatura = [
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

    let dataAux = [
      {
        caja: 1,
        hora_salida: this.dataRutaRecoleccion?.hora_salida,
        t_salida:
          this.dataRutaRecoleccion?.temperatura_salida != null
            ? parseFloat(
                (
                  this.dataRutaRecoleccion?.temperatura_salida?.toString() ?? ''
                ).split('°')[0]
              )
            : null,
        hora_llegada: this.dataRutaRecoleccion?.hora_llegada,
        t_llegada:
          this.dataRutaRecoleccion?.temperatura_llegada != null
            ? parseFloat(
                (
                  this.dataRutaRecoleccion?.temperatura_llegada?.toString() ??
                  ''
                ).split('°')[0]
              )
            : null,
      },
    ];

    if (data.length > 0) {
      const temperatura = Array.from({ length: data.length }, (_, i) => ({
        header: `TEMPERATURA ${i + 1} (°C)`,
        field: `temperature_${i + 1}`,
        width: '200px',
        tipo: 'number',
        nCasa: i + 1,
      }));

      this.headerTableTemperatura.splice(3, 0, ...temperatura);

      this.headerTableTemperatura.forEach((header) => {
        if (header.nCasa) {
          const tempFilter = data.filter((x) => x.numeroCasa === header.nCasa);
          if (tempFilter.length > 0) {
            (dataAux[0] as any)['temperature_' + tempFilter[0].numeroCasa] =
              tempFilter[0].temperatura;
          }
        }
      });
    }

    return dataAux;
  }

  onRowEditInit(dataRow: TemperaturaData): void {
    const cloneKey = 0;
    this.clonedTableTemp[cloneKey] = { ...dataRow };
    this.editingRow = dataRow;
    this.editValidate = false;
  }

  onRowEditSave(dataRow: TemperaturaData, inex: number, event: any) {
    this.editingRow = null;
    const rowElement = (event.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement;

    if (this.editValidate) {
      const invalidField = this.requiredFields.find((field) =>
        this.isFieldInvalid(field, dataRow)
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

    if (this.editValidate) {
      const bodyFormat = this.formatInputBody(dataRow);
      this._primaryService.postDataTemperatura(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Exito',
            detail: 'Nueva temperatura guardada',
            key: 'tr',
            life: 3000,
          });
          this.table.saveRowEdit(dataRow, rowElement);
          this.editValidate = false;
          this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: 'Hubo un error al guardar',
            key: 'tr',
            life: 3000,
          });
        },
      });
    } else {
      this.saveTemperaturaUpdates(dataRow, rowElement);
    }
  }

  onRowEditCancel(dataRow: any, index: number): void {
    if (this.editValidate) {
      delete this.dataTableTemp[0]['temperature_' + this.numerosDatos];
      this.headerTableTemperatura.splice(3 + this.numerosDatos - 1, 1);
      this.editingRow = null;
      this.numerosDatos -= 1;
    } else {
      if (this.clonedTableTemp[0]) {
        Object.assign(dataRow, this.clonedTableTemp[0]);
        delete this.clonedTableTemp[0];
      }
      this.editingRow = null;
    }
    this.editValidate = false;
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    this.requiredFields = ['caja'];

    for (let index = 0; index < this.numerosDatos; index++) {
      this.requiredFields.push('temperature_' + (index + 1));
    }

    return (
      this.requiredFields.includes(field) &&
      (dataRow[field] === null ||
        dataRow[field] === undefined ||
        dataRow[field] === '')
    );
  }

  agregarColumna() {
    const temperatura = {
      header: `TEMPERATURA ${this.numerosDatos + 1} (°C)`,
      field: `temperature_${this.numerosDatos + 1}`,
      width: '200px',
      tipo: 'number',
      nCasa: this.numerosDatos + 1,
    };
    const temperaturaDataAux = {
      caja: 1,
      hora_salida: this.dataRutaRecoleccion?.hora_salida,
      t_salida: this.dataRutaRecoleccion?.temperatura_salida,
      hora_llegada: this.dataRutaRecoleccion?.hora_llegada,
      t_llegada: this.dataRutaRecoleccion?.temperatura_llegada,
    };

    this.headerTableTemperatura.splice(3 + this.numerosDatos, 0, temperatura);

    if (this.dataTableTemp.length == 0) {
      this.dataTableTemp.push(temperaturaDataAux);
    }
    this.dataTableTemp[0][temperatura.field] = null;

    this.editValidate = true;
    this.numerosDatos += 1;
    this.editingRow = this.dataTableTemp[0];

    this.clonedTableTemp[0] = { ...this.dataTableTemp[0] };

    setTimeout(() => {
      this.table.initRowEdit(this.dataTableTemp[0]);
    });
  }

  formatInputBody(body: any) {
    return {
      numeroCasa: this.numerosDatos,
      temperatura: body['temperature_' + this.numerosDatos]
        ? parseFloat(body['temperature_' + this.numerosDatos])
        : null,
      ruta: this.dataRutaRecoleccion?.id_ruta,
    };
  }

  saveTemperaturaUpdates(dataRow: any, rowElement: HTMLTableRowElement) {
    const originalData = this.clonedTableTemp[0];

    if (!originalData) {
      this.table.saveRowEdit(dataRow, rowElement);
      delete this.clonedTableTemp[0];
      return;
    }

    const temperaturasModificadas = [];

    for (let i = 1; i <= this.numerosDatos; i++) {
      const fieldName = `temperature_${i}`;
      const valorOriginal = (originalData as any)[fieldName];
      const valorActual = dataRow[fieldName];

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

    if (temperaturasModificadas.length > 0) {
      let actualizacionesCompletadas = 0;
      const totalActualizaciones = temperaturasModificadas.length;

      temperaturasModificadas.forEach((tempData, index) => {
        this._primaryService.updateDataTemperatura(tempData).subscribe({
          next: (data) => {
            actualizacionesCompletadas++;

            if (actualizacionesCompletadas === totalActualizaciones) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exito',
                detail: 'Temperaturas actualizadas correctamente',
                key: 'tr',
                life: 3000,
              });
              this.table.saveRowEdit(dataRow, rowElement);
              delete this.clonedTableTemp[0];
              this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'danger',
              summary: 'Error',
              detail: `Error al actualizar temperatura ${tempData.numeroCasa}`,
              key: 'tr',
              life: 3000,
            });
            actualizacionesCompletadas++;
            if (actualizacionesCompletadas === totalActualizaciones) {
              this.table.saveRowEdit(dataRow, rowElement);
              delete this.clonedTableTemp[0];
            }
          },
        });
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No se detectaron cambios para guardar',
        key: 'tr',
        life: 3000,
      });
      this.table.saveRowEdit(dataRow, rowElement);
      delete this.clonedTableTemp[0];
    }
  }
}
