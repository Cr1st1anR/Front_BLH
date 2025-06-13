import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { rutaRecoleccion } from '../table-list/interfaces/ruta-recoleccion';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { catchError, concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse, empleados } from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TableService } from './services/table.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'principal-table',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [
    MessageService,
    TableService
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit, OnChanges {
  @Input() datesSelected: { year: number; month: number } = {} as { year: number; month: number };
  @Output() openRowSelected = new EventEmitter<rutaRecoleccion>();

  selectedRow: rutaRecoleccion[] | null = [];
  editingRow: rutaRecoleccion | null = null;

  dataTableRutaRecoleccion: rutaRecoleccion[] = [];
  clonedTableRutaRecoleccion: { [s: number]: rutaRecoleccion } = {};

  headersRutaRecoleccion: any[] = [
    { header: 'FECHA', field: 'fecha_registro', width: '200px', tipo: "date" },
    { header: 'RUTA', field: 'jornada', width: '300px', tipo: "text" },
    { header: 'PLACA VEHICULO', field: 'placa_vehiculo', width: '200px', tipo: "text" },
    { header: 'CONDUCTOR', field: 'nombre_conductor', width: '200px', tipo: "text" },
    { header: 'KM.INICIAL', field: 'kilometraje_inicial', width: '200px', tipo: "number" },
    { header: 'KM.FINAL', field: 'kilometraje_final', width: '200px', tipo: "number" },
    { header: 'HORA DE SALIDA', field: 'hora_salida', width: '200px', tipo: "time" },
    { header: 'HORA DE LLEGADA', field: 'hora_llegada', width: '200px', tipo: "time" },
    {
      header: 'RESPONSABLE TECNICO', field: 'nombreEmpleado', width: '200px', tipo: "select",
      options: null, label: "nombre", placeholder: "Seleccione el responsable"
    },
    { header: 'CARGO', field: 'cargo', width: '200px' },
    { header: 'TOTAL VISITAS', field: 'total_visitas', width: '200px', tipo: "number" },
    { header: 'VOLUMEN DE LECHE RECOLECTADA', field: 'volumen_total', width: '200px', tipo: "number" },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  requiredFields: string[] = ['ruta', 'placaVehiculo', 'conductor', 'kmInicial', 'horaSalida', 'responsable', 'cargo'];
  loading: boolean = false;

  constructor(
    private _tableServices: TableService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loading = true;
    of(null).pipe(
      concatMap(() => this.loadDataEmpleados()),
    ).subscribe({
      complete: () => {
        setTimeout(() => {
          this.loading = false;
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en la secuencia de peticiones', err);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datesSelected']) {
      const nuevaFecha = changes['datesSelected'].currentValue;
      this.loadDataRutaRecoleccion(nuevaFecha.month, nuevaFecha.year).subscribe();
    }
  }

  loadDataRutaRecoleccion(mes: number, anio: number): Observable<ApiResponse | null> {
    return this._tableServices.getDataRutaRecoleccion(mes, anio).pipe(
      tap((data) => {
        if (data) {
          this.dataTableRutaRecoleccion = this.formatData(data.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la fecha seleccionada',
            key: 'tr',
            life: 3000
          });
        } else {
          this.dataTableRutaRecoleccion = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la fecha seleccionada',
            key: 'tr',
            life: 3000
          });
        }
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000
        });
        console.error('Error en getDataFriam041:', error);
        return of(null);
      })
    );
  }

  loadDataEmpleados(): Observable<ApiResponse> {
    return this._tableServices.getDataEmpleados().pipe(
      tap((data) => {
        if (data) {
          this.headersRutaRecoleccion[8].options = data.data;
        }
      })
    );
  }

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.loadDataRutaRecoleccion(filtro.month, filtro.year).subscribe();
  }

  formatData(data: rutaRecoleccion[]): rutaRecoleccion[] {
    return data.map((item) => {
      return {
        ...item,
        fecha_registro: item.fecha_registro ? new Date(item.fecha_registro) : null,
        nombreEmpleado: this.headersRutaRecoleccion[8].options.find((empleado: empleados) => empleado.id === item.id_empleado) || '',
        hora_salida: item.hora_salida ? this.convertHoursADate(item.hora_salida as string) : "",
        hora_llegada: item.hora_llegada ? this.convertHoursADate(item.hora_llegada as string) : "",
        temperatura_llegada : item.temperatura_llegada ? item.temperatura_llegada+"°C" : "",
        temperatura_salida: item.temperatura_salida ? item.temperatura_salida+"°C" : "",
        kilometraje_inicial: item.kilometraje_inicial ? item.kilometraje_inicial.toLocaleString('de-DE'):"",
        kilometraje_final: item.kilometraje_final ? item.kilometraje_final.toLocaleString('de-DE'):"",
      };
    });
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null) {
      this.selectedRow = [];
      return;
    }

    this.openRowSelected.emit(event.data); 
  }

  onRowEditInit(dataRow: rutaRecoleccion): void {
    this.clonedTableRutaRecoleccion[dataRow.id_ruta as number] = { ...dataRow };
    this.editingRow = dataRow;
    // this.modoEdicionCambiado.emit(true);
  }

  onRowEditSave(data: any, inex: number, event: any) {
    this.editingRow = null;
    // this.clonedTableRutaRecoleccion = null;
    // this.modoEdicionCambiado.emit(false);
  }

  onRowEditCancel(dataRow: rutaRecoleccion, index: number): void {
    this.dataTableRutaRecoleccion[index] = this.clonedTableRutaRecoleccion[dataRow.id_ruta as number];
    delete this.clonedTableRutaRecoleccion[dataRow.id_ruta as number];
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }

  convertHoursADate(hora: string ): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  limpiarSeleccion() {
    this.selectedRow = null;
  }

}
