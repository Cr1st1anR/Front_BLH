import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnInit,
  OnChanges,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { rutaRecoleccion } from '../table-list/interfaces/ruta-recoleccion';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { catchError, concatMap, Observable, of, tap, Subscription } from 'rxjs';
import {
  ApiResponse,
  empleados,
} from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TableService } from './services/table.service';
import { ToastModule } from 'primeng/toast';
import { NewRouteComponent } from '../new-route/new-route.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EditingStateService } from '../shared/services/editing-state.service';

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
    ToastModule,
    NewRouteComponent,
    MonthPickerComponent,
    ProgressSpinnerModule,
  ],
  providers: [MessageService, TableService],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() datesSelected: { year: number; month: number } = {} as {
    year: number;
    month: number;
  };
  @Output() openRowSelected = new EventEmitter<rutaRecoleccion>();

  @ViewChild('tableRuta') table!: Table;

  selectedRow: rutaRecoleccion[] | null = [];
  editingRow: rutaRecoleccion | null = null;
  hasNewRowInEditing: boolean = false;
  private readonly componentId = 'principal-table';
  private editingStateSubscription: Subscription | null = null;

  dataTableRutaRecoleccion: rutaRecoleccion[] = [];
  clonedTableRutaRecoleccion: { [s: number]: rutaRecoleccion } = {};

  headersRutaRecoleccion: any[] = [
    { header: 'FECHA', field: 'fecha_registro', width: '200px', tipo: 'date' },
    { header: 'RUTA', field: 'jornada', width: '300px', tipo: 'text' },
    {
      header: 'PLACA VEHICULO',
      field: 'placa_vehiculo',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'CONDUCTOR',
      field: 'nombre_conductor',
      width: '200px',
      tipo: 'text',
    },
    {
      header: 'KM.INICIAL',
      field: 'kilometraje_inicial',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'KM.FINAL',
      field: 'kilometraje_final',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'HORA DE SALIDA',
      field: 'hora_salida',
      width: '200px',
      tipo: 'time',
    },
    {
      header: 'HORA DE LLEGADA',
      field: 'hora_llegada',
      width: '200px',
      tipo: 'time',
    },
    {
      header: 'RESPONSABLE TECNICO',
      field: 'nombreEmpleado',
      width: '200px',
      tipo: 'select',
      options: null,
      label: 'nombre',
      placeholder: 'Seleccione el responsable',
    },
    {
      header: 'CARGO',
      field: 'cargo',
      width: '200px',
      tipo: 'text',
      disable: true,
    },
    {
      header: 'TOTAL VISITAS',
      field: 'total_visitas',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'VOLUMEN DE LECHE RECOLECTADA',
      field: 'volumen_total',
      width: '200px',
      tipo: 'number',
    },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  requiredFields: string[] = [
    'jornada',
    'placa_vehiculo',
    'nombre_conductor',
    'kilometraje_inicial',
    'hora_salida',
    'nombreEmpleado',
    'cargo',
  ];
  loading: boolean = false;

  constructor(
    private _tableServices: TableService,
    private messageService: MessageService,
    private editingStateService: EditingStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();
    of(null)
      .pipe(
        concatMap(() => this.loadDataEmpleados()),
        concatMap(() => this.loadDataRutaRecoleccion(mesActual, anioActual))
      )
      .subscribe({
        complete: () => {
          setTimeout(() => {
            this.loading = false;
          }, 1200);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
        },
      });

    this.editingStateService.registerCancelCallback(this.componentId, () => {
      this.cancelCurrentEditing();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['datesSelected'] &&
      changes['datesSelected'].currentValue.month != undefined
    ) {
      const nuevaFecha = changes['datesSelected'].currentValue;
      this.loadDataRutaRecoleccion(
        nuevaFecha.month,
        nuevaFecha.year
      ).subscribe();
    }
  }

  loadDataRutaRecoleccion(
    mes: number,
    anio: number
  ): Observable<ApiResponse | null> {
    return this._tableServices.getDataRutaRecoleccion(mes, anio).pipe(
      tap((data) => {
        if (data) {
          this.dataTableRutaRecoleccion = this.formatData(data.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la fecha seleccionada',
            key: 'tr',
            life: 3000,
          });
        } else {
          this.dataTableRutaRecoleccion = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la fecha seleccionada',
            key: 'tr',
            life: 3000,
          });
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
        fecha_registro: item.fecha_registro
          ? new Date(item.fecha_registro)
          : null,
        nombreEmpleado:
          this.headersRutaRecoleccion[8].options.find(
            (empleado: empleados) => empleado.id === item.id_empleado
          ) || '',
        hora_salida: item.hora_salida
          ? this.convertHoursADate(item.hora_salida as string)
          : '',
        hora_llegada: item.hora_llegada
          ? this.convertHoursADate(item.hora_llegada as string)
          : '',
        temperatura_llegada: item.temperatura_llegada
          ? item.temperatura_llegada
          : null,
        temperatura_salida: item.temperatura_salida
          ? item.temperatura_salida
          : null,
        kilometraje_inicial: item.kilometraje_inicial
          ? item.kilometraje_inicial
          : null,
        kilometraje_final: item.kilometraje_final
          ? item.kilometraje_final
          : null,
      };
    });
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null || this.hasNewRowInEditing) {
      this.selectedRow = [];
      return;
    }
    this.openRowSelected.emit(event.data);
    this.selectedRow = [];
  }

  onRowEditInit(dataRow: rutaRecoleccion): void {
    if (
      this.hasNewRowInEditing &&
      (!this.editingRow || this.editingRow.id_ruta === null)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe guardar o cancelar la fila nueva antes de editar otra.',
        key: 'tr',
        life: 3000,
      });
      return;
    }
    this.editingStateService.startEditing(this.componentId, dataRow.id_ruta);
    this.clonedTableRutaRecoleccion[dataRow.id_ruta as number] = { ...dataRow };
    this.editingRow = dataRow;
    this.selectedRow = null;
  }

  onRowEditSave(dataRow: rutaRecoleccion, inex: number, event: MouseEvent) {
    const rowElement = (event.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement;
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

    this.editingRow = null;
    this.hasNewRowInEditing = false;
    this.editingStateService.cancelEditing();

    const bodyFormat = this.formatInputBody(dataRow);
    delete this.clonedTableRutaRecoleccion[dataRow.id_ruta as number];

    if (dataRow.id_ruta === undefined || dataRow.id_ruta === null) {
      this._tableServices.postDataRutaRecoleccion(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Exito',
            detail: 'Datos guardados',
            key: 'tr',
            life: 3000,
          });
          this.table.saveRowEdit(dataRow, rowElement);
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
      this._tableServices.putDataRutaRecoleccion(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Exito',
            detail: 'Datos actualizados',
            key: 'tr',
            life: 3000,
          });
          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: 'Hubo un error al actualizar',
            key: 'tr',
            life: 3000,
          });
        },
      });
    }
  }

  onRowEditCancel(dataRow: rutaRecoleccion, index: number): void {
    if (dataRow.id_ruta === null) {
      this.dataTableRutaRecoleccion.splice(index, 1);
      this.dataTableRutaRecoleccion = [...this.dataTableRutaRecoleccion];
      this.hasNewRowInEditing = false;
    } else {
      this.dataTableRutaRecoleccion[index] =
        this.clonedTableRutaRecoleccion[dataRow.id_ruta as number];
      delete this.clonedTableRutaRecoleccion[dataRow.id_ruta as number];
    }
    this.editingRow = null;
    this.editingStateService.cancelEditing();
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return (
      this.requiredFields.includes(field) &&
      (dataRow[field] === null ||
        dataRow[field] === undefined ||
        dataRow[field] === '')
    );
  }

  convertHoursADate(hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  limpiarSeleccion() {
    this.selectedRow = null;
  }

  agregarFilaVacia() {
    if (this.hasNewRowInEditing) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail:
          'Debe guardar o cancelar la fila actual antes de crear una nueva',
        key: 'tr',
        life: 3000,
      });
      return;
    }

    if (this.editingRow && this.table) {
      this.table.cancelRowEdit(this.editingRow);
      this.editingRow = null;
    }

    const nuevoRegistro: rutaRecoleccion = {
      id_ruta: null,
      fecha_registro: new Date(),
      jornada: '',
      nombre_conductor: '',
      placa_vehiculo: '',
      kilometraje_inicial: '',
      kilometraje_final: null,
      hora_salida: '',
      hora_llegada: null,
      temperatura_llegada: null,
      temperatura_salida: null,
      total_visitas: null,
      volumen_total: null,
      id_empleado: null,
      nombreEmpleado: '',
      cargo: '',
    };

    this.dataTableRutaRecoleccion.push(nuevoRegistro);
    this.dataTableRutaRecoleccion = [...this.dataTableRutaRecoleccion];
    this.selectedRow = null;
    this.hasNewRowInEditing = true;

    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    }, 100);
  }

  fillText(event: { originalEvent: any; value: empleados }, index: number) {
    this.dataTableRutaRecoleccion[index].cargo = event.value.cargo;
  }

  formatInputBody(body: rutaRecoleccion) {
    return {
      id: body.id_ruta,
      jornada: body.jornada,
      nombreConductor: body.nombre_conductor,
      placa: body.placa_vehiculo,
      kilometrajeInicial:
        body.kilometraje_inicial != ''
          ? parseFloat((body.kilometraje_inicial ?? '').toString())
          : null,
      kilometrajeFinal:
        body.kilometraje_final != null
          ? parseFloat((body.kilometraje_final ?? '').toString())
          : null,
      horaSalida: body.hora_salida
        ? new Date(body.hora_salida).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : null,
      horaLlegada: body.hora_llegada
        ? new Date(body.hora_llegada).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : null,
      temperaturaLlegada: body.temperatura_llegada,
      temperaturaSalida: body.temperatura_salida,
      totalVisitas: body.total_visitas,
      volumenTotal: body.volumen_total,
      empleado:
        typeof body.nombreEmpleado === 'object' && body.nombreEmpleado !== null
          ? (body.nombreEmpleado as { id: number }).id
          : body.id_empleado ?? null,
    };
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow && this.table) {
      try {
        this.table.cancelRowEdit(this.editingRow);
      } catch (error) {}
      const index = this.dataTableRutaRecoleccion.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        if (this.editingRow.id_ruta === null) {
          this.dataTableRutaRecoleccion.splice(index, 1);
          this.dataTableRutaRecoleccion = [...this.dataTableRutaRecoleccion];
        } else {
          if (
            this.clonedTableRutaRecoleccion[this.editingRow.id_ruta as number]
          ) {
            this.dataTableRutaRecoleccion[index] =
              this.clonedTableRutaRecoleccion[
                this.editingRow.id_ruta as number
              ];
            delete this.clonedTableRutaRecoleccion[
              this.editingRow.id_ruta as number
            ];
          }
        }
      }
      this.editingRow = null;
    }
  }

  ngOnDestroy(): void {
    if (this.editingStateSubscription) {
      this.editingStateSubscription.unsubscribe();
    }
    this.editingStateService.unregisterCancelCallback(this.componentId);
  }
}
