import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import { casasVisitaData, MadresDonantes } from '../interfaces/primaryDialog.interface';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';
import { NewRegisterCasaComponent } from '../new-register-casa/new-register-casa.component';

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
    NewRegisterCasaComponent
  ],
  templateUrl: './table-casa.component.html',
  styleUrl: './table-casa.component.scss',
  providers: [
    MessageService,
    primaryDialogServices
  ],
})
export class TableCasaComponent implements OnChanges, OnInit {

  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;
  @Output() openDialogFrascosL = new EventEmitter<casasVisitaData>();
  @ViewChild('tableCasas') table!: Table
  dataTableCasas: any[] = [];
  clonedTableCasasVisita: { [s: number]: casasVisitaData } = {};

  headerTableCasasVisita: any[] = [
    { header: 'CASA No.', field: 'id_casa_visita', width: '200px', tipo: "text", disable: true },
    {
      header: 'CODIGO', field: 'id_madre_donante', width: '200px', tipo: "select", disable: false,
      options: null, label: "id_madre_donante", placeholder: "Seleccione una madre"
    },
    { header: 'NOMBRE', field: 'nombre', width: '200px', tipo: "text", disable: true },
    { header: 'DIRECCION', field: 'direccion', width: '200px', tipo: "text", disable: true },
    { header: 'TELEFONO', field: 'celular', width: '200px', tipo: "text", disable: true },
    { header: 'OBSERVACIONES', field: 'observacion', width: '200px', tipo: "text", disable: false },
    { header: 'ACCIONES', field: 'acciones', width: '200px' }
  ];

  selectedRow: casasVisitaData[] | null = [];
  editingRow: casasVisitaData | null = null;
  tercerDialogVisible: boolean = false;
  selectedCasaNo: number | null = null;
  frascosData: any[] = [];
  loading: boolean = false;
  requiredFields: string[] = ['id_madre_donante'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataRutaRecoleccion'] && changes['dataRutaRecoleccion'].currentValue) {

      of(null).pipe(
        concatMap(() => this.loadDataMadresDonanates()),
        concatMap(() => this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!))

      ).subscribe({
        complete: () => {
          setTimeout(() => {
            this.loading = false;
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data de las casas de visita.' });
        }
      });

    }
  }

  loadDataMadresDonanates(): Observable<ApiResponse> {
    return this._primaryService.getMadresDonantes().pipe(
      tap((data) => {
        if (data) {
          this.headerTableCasasVisita[1].options = data.data;
        } else {
          this.headerTableCasasVisita[1].options = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos de madres donantes disponibles',
            key: 'tr',
            life: 3000
          });
        }
      })
    )
  }

  loadDataforTable(idRuta: number): Observable<ApiResponse> {
    return this._primaryService.getDataCasasRuta(idRuta).pipe(
      tap((data) => {
        if (data) {
          this.dataTableCasas = this.formatData(data.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la ruta seleccionada',
            key: 'tr',
            life: 3000
          });
        } else {
          this.dataTableCasas = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para la ruta seleccionada',
            key: 'tr',
            life: 3000
          });
        }
      })
    );
  }

  formatData(data: casasVisitaData[]): any[] {
    return data.map((item) => {
      return {
        ...item,
        nombre: item.nombre && item.apellido ? item.nombre + ' ' + item.apellido : ' ',
        id_madre_donante: this.headerTableCasasVisita[1].options.find((madre: MadresDonantes) => madre.id_madre_donante === item.id_madre_donante) || null,
      }
    })
  }

  fillText(event: { originalEvent: any, value: MadresDonantes }, index: number) {
    this.dataTableCasas[index].nombre = event.value.nombre;
    this.dataTableCasas[index].direccion = event.value.direccion;
    this.dataTableCasas[index].celular = event.value.celular;
  }

  crearNuevoRegistroCasa() {
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
    this.editingRow = nuevoRegistro;
    this.selectedRow = [nuevoRegistro];
    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    });
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null) {
      this.selectedRow = [];
      return;
    }
    this.openDialogFrascosL.emit(event.data);
  }

  onRowEditInit(dataRow: casasVisitaData): void {
    this.clonedTableCasasVisita[dataRow.id_casa_visita as number] = { ...dataRow };
    this.editingRow = dataRow;
    this.selectedRow = null;
  }

  onRowEditSave(dataRow: casasVisitaData, index: number, event: MouseEvent) {
    this.editingRow = null;
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLTableRowElement;
    const invalidField = this.requiredFields.find(field => this.isFieldInvalid(field, dataRow));
    if (invalidField) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `El campo "${invalidField}" es obligatorio.`,
        key: 'tr',
        life: 3000
      });
      return;
    }
    delete this.clonedTableCasasVisita[dataRow.id_casa_visita as number];
    const bodyFormat = this.formatInputBody(dataRow);

    if (dataRow.id_casa_visita === undefined || dataRow.id_casa_visita === null) {
      this._primaryService.postDataCasasVisitas(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Datos guardados', key: 'tr', life: 3000 });
          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Hubo un error al guardar', key: 'tr', life: 3000 });
        }
      })
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

  onRowEditCancel(dataRow: rutaRecoleccion, index: number): void {
    this.dataTableCasas[index] = this.clonedTableCasasVisita[dataRow.id_ruta as number];
    delete this.clonedTableCasasVisita[dataRow.id_ruta as number];
    this.editingRow = null;
  }

  formatInputBody(body:any){
    return {
      madreDonante: body.id_madre_donante.id_madre_donante ? body.id_madre_donante.id_madre_donante : null,
      ruta: this.dataRutaRecoleccion?.id_ruta || null,
      observacion: body.observacion || null,
    };
  }

  limpiarSeleccion() {
    this.selectedRow = null;
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }

}
