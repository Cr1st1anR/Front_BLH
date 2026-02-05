import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { secondaryDialogServices } from '../services/secondaryDialog.service';
import {
  Congeladores,
  FrascosLeche,
} from '../interface/secondaryDialog.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { casasVisitaData } from '../../primary-dialog/interfaces/primaryDialog.interface';
import { NewRegisterFrascoComponent } from '../new-register-frasco/new-register-frasco.component';
import { concatMap, Observable, of, tap, Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { EditingStateService } from '../../shared/services/editing-state.service';

@Component({
  selector: 'table-frasco',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    NewRegisterFrascoComponent,
  ],
  templateUrl: './table-frasco.component.html',
  styleUrl: './table-frasco.component.scss',
  providers: [MessageService, secondaryDialogServices],
})
export class TableFrascoComponent implements OnChanges, OnDestroy {
  @Input() frascosData: casasVisitaData | null = null;
  @ViewChild('tableFrascos') table!: Table;

  selectedRow: FrascosLeche[] | null = [];
  editingRow: any | null = null; // Cambiar a any para permitir _uid
  hasNewRowInEditing: boolean = false;
  dataTableFrascosLeche: any[] = [];
  dataCongeladores: Congeladores[] = [];
  clonedTableFrascos: { [s: string]: any } = {}; // Cambiar a string para usar _uid
  loading: boolean = false;
  private readonly componentId = 'table-frasco';
  private editingStateSubscription: Subscription | null = null;
  private tempIdCounter = -1; // Contador para IDs temporales
  requiredFields: string[] = [
    'frasco',
    'volumen',
    'fecha_de_extraccion',
    'tFrasco',
    'termo',
    'id_congelador',
    'gaveta',
  ];

  headersTableFrascosLeche: any[] = [
    { header: 'No. FRASCOS', field: 'frasco', width: '200px', tipo: 'number' },
    {
      header: 'VOLUMEN ESTIMADO',
      field: 'volumen',
      width: '200px',
      tipo: 'number',
    },
    {
      header: 'FECHA DE EXTRACCION',
      field: 'fecha_de_extraccion',
      width: '200px',
      tipo: 'date',
    },
    {
      header: 'TIPO DE FRASCO',
      field: 'tFrasco',
      width: '200px',
      tipo: 'text',
    },
    { header: 'N° DE TERMO', field: 'termo', width: '200px', tipo: 'number' },
    {
      header: 'CONGELADOR',
      field: 'id_congelador',
      width: '200px',
      tipo: 'select',
      options: null,
      label: 'id',
      placeholder: 'Seleccione un congeladdor',
    },
    {
      header: 'DESCRIPCION',
      field: 'descripcion',
      width: '200px',
      tipo: 'text',
    },
    { header: 'GAVETA', field: 'gaveta', width: '200px', tipo: 'number' },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  constructor(
    private messageService: MessageService,
    private _secondaryDialogServices: secondaryDialogServices,
    private editingStateService: EditingStateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frascosData'] && changes['frascosData'].currentValue) {
      of(null)
        .pipe(
          concatMap(() => this.loadDataCongeladores()),
          concatMap(() =>
            this.LoadDataFrascosLeche(this.frascosData!.id_casa_visita || 0)
          )
        )
        .subscribe({
          complete: () => {
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

    this.editingStateService.registerCancelCallback(this.componentId, () => {
      this.cancelCurrentEditing();
    });
  }

  loadDataCongeladores(): Observable<ApiResponse> {
    return this._secondaryDialogServices.getDataCongeladores().pipe(
      tap((response) => {
        if (response && response.data.length > 0) {
          this.dataCongeladores = response.data;
          this.messageService.add({
            severity: 'success',
            summary: 'Datos Cargados',
            detail:
              'Los datos de los congeladores se han cargado correctamente.',
            life: 3000,
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se encontraron datos de congeladores.',
            life: 3000,
          });
        }
      })
    );
  }

  LoadDataFrascosLeche(casaNo: number): Observable<ApiResponse> {
    return this._secondaryDialogServices.getDataFrascosLeche(casaNo).pipe(
      tap((response) => {
        if (response && response.data.length > 0) {
          this.dataTableFrascosLeche = this.formatData(response.data);
        } else {
          this.dataTableFrascosLeche = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail:
              'No se encontraron datos de frascos de leche para la casa seleccionada.',
            life: 3000,
          });
        }

        this.headersTableFrascosLeche[5].options = this.dataCongeladores;

        if (response && response.data.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Datos Cargados',
            detail:
              'Los datos de los frascos de leche se han cargado correctamente.',
            life: 3000,
          });
        }
      })
    );
  }

  formatData(data: FrascosLeche[]): any[] {
    return data.map((item: FrascosLeche) => {
      return {
        ...item,
        _uid: item.id_frascos_recolectados !== null && item.id_frascos_recolectados !== undefined
          ? `f_${item.id_frascos_recolectados}`
          : `tmp_${this.tempIdCounter--}`,
        frasco: 1,
        fecha_de_extraccion: item.fecha_de_extraccion
          ? new Date(item.fecha_de_extraccion)
          : null,
        tFrasco: 'Vidrio',
        id_congelador:
          this.dataCongeladores.find(
            (congelador) => congelador.id === item.id_congelador
          ) || null,
        descripcion:
          this.dataCongeladores.find(
            (congelador) => congelador.id === item.id_congelador
          )?.descripcion || null,
      };
    });
  }

  onRowEditInit(dataRow: any): void {
    if (
      this.hasNewRowInEditing &&
      this.editingRow &&
      this.editingRow.id_frascos_recolectados === null
    ) {
      const index = this.dataTableFrascosLeche.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        this.dataTableFrascosLeche.splice(index, 1);
        this.dataTableFrascosLeche = [...this.dataTableFrascosLeche];
      }
      this.table.cancelRowEdit(this.editingRow);
      this.editingRow = null;
      this.hasNewRowInEditing = false;
    }

    const uid = dataRow._uid;
    this.editingStateService.startEditing(this.componentId, uid);
    this.clonedTableFrascos[uid] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: FrascosLeche, inex: number, event: MouseEvent) {
    this.editingRow = null;
    this.hasNewRowInEditing = false;
    this.editingStateService.cancelEditing();

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

    const bodyFormat = this.formatInputBody(dataRow);

    if (
      dataRow.id_frascos_recolectados === undefined ||
      dataRow.id_frascos_recolectados === null
    ) {
      this._secondaryDialogServices
        .postDataFrascosRecolectados(bodyFormat)
        .subscribe({
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
      // existente -> actualizar usando tu servicio updateDataFrascos
      const idToUpdate = dataRow.id_frascos_recolectados as number;
      const index = this.dataTableFrascosLeche.findIndex((r) => r === dataRow);

      this._secondaryDialogServices.updateDataFrascos(idToUpdate, bodyFormat).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos actualizados',
            key: 'tr',
            life: 3000,
          });
          // aplicar cambios visibles y limpiar clon
          if (index !== -1) {
            this.dataTableFrascosLeche[index] = dataRow;
            this.dataTableFrascosLeche = [...this.dataTableFrascosLeche];
          }
          try {
            this.table.saveRowEdit(dataRow, rowElement);
          } catch (err) { }
          delete this.clonedTableFrascos[idToUpdate];
        },
        error: (err) => {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: 'Hubo un error al actualizar',
            key: 'tr',
            life: 3000,
          });
          // restaurar clon si existe
          if (index !== -1 && this.clonedTableFrascos[idToUpdate]) {
            this.dataTableFrascosLeche[index] = this.clonedTableFrascos[idToUpdate];
            delete this.clonedTableFrascos[idToUpdate];
            this.dataTableFrascosLeche = [...this.dataTableFrascosLeche];
          }
        },
      });
    }
  }

  onRowEditCancel(dataRow: any, index: number): void {
    const uid = dataRow._uid;

    if (dataRow.id_frascos_recolectados === null) {
      this.dataTableFrascosLeche.splice(index, 1);
      this.dataTableFrascosLeche = [...this.dataTableFrascosLeche];
      this.hasNewRowInEditing = false;
    } else {
      if (uid && this.clonedTableFrascos[uid]) {
        this.dataTableFrascosLeche[index] = this.clonedTableFrascos[uid];
        delete this.clonedTableFrascos[uid];
      }
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

  crearNuevoRegistroFrasco() {
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

    const nuevoRegistro: any = {
      _uid: `tmp_${this.tempIdCounter--}`,
      id_frascos_recolectados: null,
      frasco: 1,
      volumen: null,
      descripcion: null,
      fecha_de_extraccion: null,
      tFrasco: 'Vidrio',
      termo: null,
      id_congelador: null,
      gaveta: null,
    };

    this.dataTableFrascosLeche.push(nuevoRegistro);
    this.hasNewRowInEditing = true;

    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    }, 100);
  }

  formatInputBody(body: FrascosLeche) {
    return {
      volumen: body.volumen,
      fechaDeExtraccion: body.fecha_de_extraccion
        ? new Date(body.fecha_de_extraccion).toISOString().split('T')[0]
        : null,
      termo: body.termo,
      gaveta: body.gaveta,
      // si el campo id_congelador es un objeto, enviar su id
      congelador:
        body.id_congelador && typeof body.id_congelador === 'object'
          ? (body.id_congelador as any).id
          : body.id_congelador,
      casaVisita: this.frascosData?.id_casa_visita,
      madreDonante: this.frascosData?.id_madre_donante["id_madre_donante"],
      recoleccion: 1
    };
  }

  fillText(event: { originalEvent: any; value: Congeladores }, index: number) {
    this.dataTableFrascosLeche[index].descripcion = event.value.descripcion;
  }

  private cancelCurrentEditing(): void {
    if (this.editingRow && this.table) {
      try {
        this.table.cancelRowEdit(this.editingRow);
      } catch (error) { }

      const index = this.dataTableFrascosLeche.findIndex(
        (row) => row === this.editingRow
      );
      if (index !== -1) {
        const uid = this.editingRow._uid;
        if (this.editingRow.id_frascos_recolectados === null) {
          this.dataTableFrascosLeche.splice(index, 1);
        } else {
          if (uid && this.clonedTableFrascos[uid]) {
            this.dataTableFrascosLeche[index] = this.clonedTableFrascos[uid];
            delete this.clonedTableFrascos[uid];
          }
        }
      }
      this.editingRow = null;
    }
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null) {
      this.selectedRow = [];
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.editingStateSubscription) {
      this.editingStateSubscription.unsubscribe();
    }
    this.editingStateService.unregisterCancelCallback(this.componentId);
  }
}
