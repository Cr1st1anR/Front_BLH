import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import { casasVisitaData, MadresDonantes } from '../interfaces/primaryDialog.interface';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from 'src/app/modules/captacion/friam-041/components/table-list/interfaces/linea-amiga.interface';

@Component({
  selector: 'table-casa',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    ToastModule,
    ButtonModule,
    SelectModule,
    InputTextModule
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
  // @Input() editingSecondaryRow: any = null;
  // @Output() casaSeleccionada = new EventEmitter<{casaNo: number, visible: boolean}>();

  dataTable: any[] = [];
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

  clonedSecondaryRow: any = null;


  tercerDialogVisible: boolean = false;
  selectedCasaNo: number | null = null;
  frascosData: any[] = [];

  loading: boolean = false;



  // requiredFields: string[] = ['observacion', 'hora_salida', 't_salida'];

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
        }else{
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
          this.dataTable = this.formatData(data.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados para la ruta seleccionada',
            key: 'tr',
            life: 3000
          });
        } else {
          this.dataTable = [];
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
    this.dataTable[index].nombre = event.value.nombre;
    this.dataTable[index].direccion = event.value.direccion;
    this.dataTable[index].celular = event.value.celular;
  }

  onRowSelect(event: any) {
    if (this.editingRow !== null) {
      this.selectedRow = [];
      return;
    }
    this.openDialogFrascosL.emit(event.data);
  }

  onRowEditInit(dataRow: any): void {

  }

  onRowEditSave(data: any, inex: number, event: any) {

  }

  onRowEditCancel(dataRow: rutaRecoleccion, index: number): void {

  }

  // isFieldInvalid(field: string, dataRow: any): boolean {
  //   return this.requiredFields.includes(field) &&
  //     (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  // }


}
