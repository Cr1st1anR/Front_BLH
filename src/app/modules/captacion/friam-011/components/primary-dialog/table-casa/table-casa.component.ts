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
  // clones indexed by _uid (string) para mantener key estable
  clonedTableCasasVisita: { [s: string]: casasVisitaData } = {};
  private tempIdCounter = -1; // id temporal para _uid de filas nuevas

  headerTableCasasVisita: any[] = [
    {
      header: 'CASA No.',
      field: 'numero_casa',
      width: '200px',
      tipo: 'text',
      disable: false,
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
  allMadresDonantes: MadresDonantes[] = []; // Lista completa de madres donantes

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices,
    private editingStateService: EditingStateService,
    private cdr: ChangeDetectorRef
  ) { }

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
          this.allMadresDonantes = data.data;
          this.updateAvailableMadres();
        } else {
          this.allMadresDonantes = [];
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
          // asegurar el tipo real de data.data para TypeScript
          this.dataTableCasas = this.formatData(data.data as casasVisitaData[]);
          // Actualizar madres disponibles después de cargar los datos
          this.updateAvailableMadres();
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
        // _uid estable por fila: prefijo con 'c_' para evitar colisiones con ids numéricos
        _uid: item.id_casa_visita !== null && item.id_casa_visita !== undefined ? `c_${item.id_casa_visita}` : `tmp_${this.tempIdCounter--}`,
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
      // ...existing code...
      return;
    }
    if (this.editingRow && this.table) {
      this.table.cancelRowEdit(this.editingRow);
      this.editingRow = null;
    }
    const nuevoRegistro: any = {
      id_ruta: this.dataRutaRecoleccion?.id_ruta || null,
      id_casa_visita: null,
      id_madre_donante: null,
      nombre: null,
      direccion: null,
      celular: null,
      observacion: null,
      _uid: `tmp_${this.tempIdCounter--}`, // uid temporal estable
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

  onRowEditInit(dataRow: any): void {
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
    const uid = dataRow._uid;
    this.editingStateService.startEditing(this.componentId, uid);
    // clonar por _uid
    this.clonedTableCasasVisita[uid] = { ...dataRow };
    this.editingRow = dataRow;
    this.selectedRow = null;
  }

  onRowEditSave(dataRow: any, index: number, event: MouseEvent) {
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

    const uid = dataRow._uid as string | undefined;
    const bodyFormat = this.formatInputBody(dataRow);

    // NUEVO registro -> POST
    if (dataRow.id_casa_visita === undefined || dataRow.id_casa_visita === null) {
      this._primaryService.postDataCasasVisitas(bodyFormat).subscribe({
        next: (res) => {
          // si backend devuelve id, asignarlo sin tocar _uid
          let created: any = (res as any)?.data;
          // si el backend retorna lista, tomar el primer elemento
          if (Array.isArray(created)) created = created[0];
          if (created && created.id_casa_visita !== undefined) {
            dataRow.id_casa_visita = created.id_casa_visita;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos guardados',
            key: 'tr',
            life: 3000,
          });
          this.table.saveRowEdit(dataRow, rowElement);
          // limpieza: eliminar clon asociado al _uid
          if (uid && this.clonedTableCasasVisita[uid]) {
            delete this.clonedTableCasasVisita[uid];
          }
          this.hasNewRowInEditing = false;
          this.editingRow = null;
          this.editingStateService.cancelEditing();
          // Actualizar madres disponibles después de guardar
          this.updateAvailableMadres();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: 'Hubo un error al guardar',
            key: 'tr',
            life: 3000,
          });
          // dejar en edición para reintentar
        },
      });
    } else {
      // EXISTENTE -> PUT usando id real
      const idToUpdate = dataRow.id_casa_visita as number;
      this._primaryService.updateDataCasas(idToUpdate, bodyFormat).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos actualizados',
            key: 'tr',
            life: 3000,
          });
          this.table.saveRowEdit(dataRow, rowElement);
          // limpiar clon y cancelar edición
          if (uid && this.clonedTableCasasVisita[uid]) {
            delete this.clonedTableCasasVisita[uid];
          }
          this.editingRow = null;
          this.hasNewRowInEditing = false;
          this.editingStateService.cancelEditing();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: 'Hubo un error al actualizar',
            key: 'tr',
            life: 3000,
          });
          // restaurar clon por _uid si existe
          if (uid && this.clonedTableCasasVisita[uid]) {
            const idx = this.dataTableCasas.findIndex((r) => r._uid === uid);
            if (idx !== -1) {
              this.dataTableCasas[idx] = this.clonedTableCasasVisita[uid];
            }
            delete this.clonedTableCasasVisita[uid];
          }
        },
      });
    }
  }

  onRowEditCancel(dataRow: any, index: number): void {
    const uid = dataRow._uid as string | undefined;
    if (dataRow.id_casa_visita === null) {
      // fila nueva -> eliminar
      this.dataTableCasas.splice(index, 1);
      this.dataTableCasas = [...this.dataTableCasas];
      this.hasNewRowInEditing = false;
    } else {
      // restaurar por _uid
      if (uid && this.clonedTableCasasVisita[uid]) {
        this.dataTableCasas[index] = this.clonedTableCasasVisita[uid];
        delete this.clonedTableCasasVisita[uid];
      }
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
      numeroCasa: Number(body.numero_casa) || null,
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
      } catch (error) { }
      const index = this.dataTableCasas.findIndex((row) => row === this.editingRow);
      if (index !== -1) {
        const uid = (this.editingRow._uid as string | undefined);
        if (this.editingRow.id_casa_visita === null) {
          this.dataTableCasas.splice(index, 1);
        } else {
          if (uid && this.clonedTableCasasVisita[uid]) {
            this.dataTableCasas[index] = this.clonedTableCasasVisita[uid];
            delete this.clonedTableCasasVisita[uid];
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

  /**
   * Actualiza la lista de madres donantes disponibles
   * Filtra las madres que ya tienen registros en la tabla
   */
  updateAvailableMadres(): void {
    if (!this.allMadresDonantes || this.allMadresDonantes.length === 0) {
      this.headerTableCasasVisita[1].options = [];
      return;
    }

    // Obtener IDs de madres donantes que ya están en la tabla
    const madresEnUso = new Set<number>();
    this.dataTableCasas.forEach(row => {
      const madreId = typeof row.id_madre_donante === 'object'
        ? row.id_madre_donante?.id_madre_donante
        : row.id_madre_donante;

      if (madreId !== null && madreId !== undefined) {
        madresEnUso.add(madreId);
      }
    });

    // Filtrar madres que no están en uso
    const madresDisponibles = this.allMadresDonantes.filter(
      madre => !madresEnUso.has(madre.id_madre_donante)
    );

    this.headerTableCasasVisita[1].options = madresDisponibles;
  }

  /**
   * Obtiene las opciones disponibles para una fila específica en edición
   * Incluye la madre actual de la fila si existe
   */
  getAvailableOptionsForRow(rowData: any): MadresDonantes[] {
    if (!this.allMadresDonantes || this.allMadresDonantes.length === 0) {
      return [];
    }

    const currentMadreId = typeof rowData.id_madre_donante === 'object'
      ? rowData.id_madre_donante?.id_madre_donante
      : rowData.id_madre_donante;

    // Obtener IDs de madres en uso, excluyendo la actual
    const madresEnUso = new Set<number>();
    this.dataTableCasas.forEach(row => {
      // Saltar la fila actual
      if (row._uid === rowData._uid) return;

      const madreId = typeof row.id_madre_donante === 'object'
        ? row.id_madre_donante?.id_madre_donante
        : row.id_madre_donante;

      if (madreId !== null && madreId !== undefined) {
        madresEnUso.add(madreId);
      }
    });

    // Filtrar madres disponibles
    return this.allMadresDonantes.filter(
      madre => !madresEnUso.has(madre.id_madre_donante) || madre.id_madre_donante === currentMadreId
    );
  }
}
