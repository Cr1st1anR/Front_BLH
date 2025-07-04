import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import {
  casasVisitaData,
  MadresDonantes,
} from '../interfaces/primaryDialog.interface';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { concatMap, Observable, of, tap, Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { NewRegisterCasaComponent } from '../new-register-casa/new-register-casa.component';
import { EditingStateService } from '../../shared/services/editing-state.service';

@Component({
  selector: 'table-casa',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    ToastModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    NewRegisterCasaComponent,
  ],
  templateUrl: './table-casa.component.html',
  styleUrl: './table-casa.component.scss',
  providers: [MessageService, primaryDialogServices],
})
export class TableCasaComponent implements OnChanges, OnInit, OnDestroy {
  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;
  @Output() openDialogFrascosL = new EventEmitter<casasVisitaData>();
  @Output() dataLoaded = new EventEmitter<boolean>();
  @ViewChild('tableCasas') table!: Table;
  dataTableCasas: any[] = [];
  clonedTableCasasVisita: { [s: number]: casasVisitaData } = {};

  headerTableCasasVisita: any[] = [
    {
      header: 'CASA No.',
      field: 'id_casa_visita',
      width: '200px',
      tipo: 'text',
      disable: true,
    },
    {
      header: 'CODIGO',
      field: 'id_madre_donante',
      width: '200px',
      tipo: 'select',
      disable: false,
      options: null,
      label: 'id_madre_donante',
      placeholder: 'Seleccione una madre',
    },
    {
      header: 'NOMBRE',
      field: 'nombre',
      width: '200px',
      tipo: 'text',
      disable: true,
    },
    {
      header: 'DIRECCION',
      field: 'direccion',
      width: '200px',
      tipo: 'text',
      disable: true,
    },
    {
      header: 'TELEFONO',
      field: 'celular',
      width: '200px',
      tipo: 'text',
      disable: true,
    },
    {
      header: 'OBSERVACIONES',
      field: 'observacion',
      width: '200px',
      tipo: 'text',
      disable: false,
    },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  selectedRow: casasVisitaData[] | null = [];
  editingRow: casasVisitaData | null = null;
  hasNewRowInEditing: boolean = false;
  tercerDialogVisible: boolean = false;
  selectedCasaNo: number | null = null;
  frascosData: any[] = [];
  loading: boolean = false;
  requiredFields: string[] = ['id_madre_donante'];
  private readonly componentId = 'table-casa';
  private editingStateSubscription: Subscription | null = null;

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices,
    private editingStateService: EditingStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.editingStateService.registerCancelCallback(this.componentId, () => {
      this.cancelCurrentEditing();
    });
  }

ngOnChanges(changes: SimpleChanges) {
  if (
    changes['dataRutaRecoleccion'] &&
    changes['dataRutaRecoleccion'].currentValue
  ) {
    of(null)
      .pipe(
        concatMap(() => this.loadDataMadresDonanates()),
        concatMap(() =>
          this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!)
        )
      )
      .subscribe({
        complete: () => {
          console.log('Opciones después de cargar:', this.headerTableCasasVisita[1].options);
          setTimeout(() => {
            this.loading = false;
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la data de las casas de visita.',
          });
        },
      });
  }
}

loadDataMadresDonanates(): Observable<ApiResponse> {
  return this._primaryService.getMadresDonantes().pipe(
    tap((data) => {
      if (data && data.data && data.data.length > 0) {
        this.headerTableCasasVisita[1].options = data.data;
      } else {
        this.headerTableCasasVisita[1].options = [];
        this.messageService.add({
          severity: 'info',
          summary: 'Sin datos',
          detail: 'No hay madres donantes registradas en el sistema.',
          life: 3000
        });
      }
    })
  );
}

  loadDataforTable(idRuta: number): Observable<ApiResponse> {
    return this._primaryService.getDataCasasRuta(idRuta).pipe(
      tap((data) => {
        if (data) {
          this.dataTableCasas = this.formatData(data.data);
          if (this.dataTableCasas.length > 0) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Datos cargados para la ruta seleccionada',
              key: 'tr',
              life: 3000,
            });
          }
          this.dataLoaded.emit(true);
        } else {
          this.dataTableCasas = [];
          this.dataLoaded.emit(false);
        }
      })
    );
  }

  formatData(data: casasVisitaData[]): any[] {
    return data.map((item) => {
      return {
        ...item,
        nombre:
          item.nombre && item.apellido
            ? item.nombre + ' ' + item.apellido
            : ' ',
        id_madre_donante:
          this.headerTableCasasVisita[1].options.find(
            (madre: MadresDonantes) =>
              madre.id_madre_donante === item.id_madre_donante
          ) || null,
      };
    });
  }

  fillText(
    event: { originalEvent: any; value: MadresDonantes },
    index: number
  ) {
    this.dataTableCasas[index].nombre = event.value.nombre;
    this.dataTableCasas[index].direccion = event.value.direccion;
    this.dataTableCasas[index].celular = event.value.celular;
  }

  crearNuevoRegistroCasa() {
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
    const nuevoRegistro: casasVisitaData = {
      id_ruta: null,
      id_casa_visita: null,
      id_madre_donante: null,
      nombre: null,
      direccion: null,
      celular: null,
      observacion: null,
    };
    this.dataTableCasas.unshift(nuevoRegistro);
    this.selectedRow = [nuevoRegistro];
    this.hasNewRowInEditing = true;
    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    }, 100);
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null || this.hasNewRowInEditing) {
      this.selectedRow = [];
      return;
    }
    this.openDialogFrascosL.emit(event.data);
    this.selectedRow = [];
  }

  onRowEditInit(dataRow: casasVisitaData): void {
    if (
      this.hasNewRowInEditing &&
      (!this.editingRow || this.editingRow.id_casa_visita === null)
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
    this.editingStateService.startEditing(
      this.componentId,
      dataRow.id_casa_visita
    );
    this.clonedTableCasasVisita[dataRow.id_casa_visita as number] = {
      ...dataRow,
    };
    this.editingRow = dataRow;
    this.selectedRow = null;
  }

  onRowEditSave(dataRow: casasVisitaData, index: number, event: MouseEvent) {
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
    delete this.clonedTableCasasVisita[dataRow.id_casa_visita as number];
    const bodyFormat = this.formatInputBody(dataRow);
    if (
      dataRow.id_casa_visita === undefined ||
      dataRow.id_casa_visita === null
    ) {
      this._primaryService.postDataCasasVisitas(bodyFormat).subscribe({
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
      // this._primaryService.putDataRutaRecoleccion(bodyFormat).subscribe({
      //   next: (data) => {
      //     this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Datos actualizados', key: 'tr', life: 3000 });
      //     this.table.saveRowEdit(dataRow, rowElement);
      //   },
      //   error: (error) => {
      //     this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Hubo un error al actualizar', key: 'tr', life: 3000 });
      //   }
      // })
    }
  }

  onRowEditCancel(dataRow: casasVisitaData, index: number): void {
    if (dataRow.id_casa_visita === null) {
      this.dataTableCasas.splice(index, 1);
      this.dataTableCasas = [...this.dataTableCasas];
      this.hasNewRowInEditing = false;
    } else {
      this.dataTableCasas[index] =
        this.clonedTableCasasVisita[dataRow.id_casa_visita as number];
      delete this.clonedTableCasasVisita[dataRow.id_casa_visita as number];
    }
    this.editingRow = null;
    this.editingStateService.cancelEditing();
  }

  formatInputBody(body: any) {
    return {
      madreDonante:
        typeof body.id_madre_donante === 'object'
          ? body.id_madre_donante?.id_madre_donante
          : body.id_madre_donante,
      ruta: this.dataRutaRecoleccion?.id_ruta || null,
      observacion: body.observacion || null,
    };
  }

  limpiarSeleccion() {
    this.selectedRow = null;
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return (
      this.requiredFields.includes(field) &&
      (dataRow[field] === null ||
        dataRow[field] === undefined ||
        dataRow[field] === '')
    );
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow && this.table) {
      try {
        this.table.cancelRowEdit(this.editingRow);
      } catch (error) {}
      const index = this.dataTableCasas.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        if (this.editingRow.id_casa_visita === null) {
          this.dataTableCasas.splice(index, 1);
        } else {
          if (
            this.clonedTableCasasVisita[
              this.editingRow.id_casa_visita as number
            ]
          ) {
            this.dataTableCasas[index] =
              this.clonedTableCasasVisita[
                this.editingRow.id_casa_visita as number
              ];
            delete this.clonedTableCasasVisita[
              this.editingRow.id_casa_visita as number
            ];
          }
        }
      }
      this.editingRow = null;
      this.selectedRow = null;
    }
  }

  ngOnDestroy(): void {
    if (this.editingStateSubscription) {
      this.editingStateSubscription.unsubscribe();
    }
    this.editingStateService.unregisterCancelCallback(this.componentId);
  }
}
