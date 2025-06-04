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
export class TableCasaComponent implements OnChanges, OnInit{

  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;
  // @Input() editingSecondaryRow: any = null;
  // @Output() casaSeleccionada = new EventEmitter<{casaNo: number, visible: boolean}>();

  dataTable: any[] = [];
  headerTableCasasVisita: any[] = [
    { header: 'CASA No.', field: 'id_casa_visita', width: '200px', tipo: "text", disable: true },
    { header: 'CODIGO', field: 'id_madre_donante', width: '200px', tipo: "select",disable: false,
      options: null, label: "id_madre_donante", placeholder: "Seleccione una madre"
    },
    { header: 'NOMBRE', field: 'nombre', width: '200px', tipo: "text", disable: true },
    { header: 'DIRECCION', field: 'direccion', width: '200px', tipo: "text", disable: true },
    { header: 'TELEFONO', field: 'celular', width: '200px', tipo: "text", disable: true},
    { header: 'OBSERVACIONES', field: 'observacion', width: '200px', tipo: "text", disable: false},
    { header: 'ACCIONES', field: 'acciones', width: '200px' }
  ];

  selectedSecondaryRow: any = null;
  clonedSecondaryRow: any = null;


  tercerDialogVisible: boolean = false;
  selectedCasaNo: number | null = null;
  frascosData: any[] = [];

  
  // requiredFields: string[] = ['observacion', 'hora_salida', 't_salida'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices
  ) { }


  ngOnInit(): void {
    this.loadDataMadresDonanates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataRutaRecoleccion'] && changes['dataRutaRecoleccion'].currentValue) {
      this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
    }
  }

  loadDataMadresDonanates(){
     this._primaryService.getMadresDonantes().subscribe({
      next: (response) => {
        this.headerTableCasasVisita[1].options = response.data;
        console.log(this.headerTableCasasVisita[1].options);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data de las madres donantes.' });
      }
    })
  }

  loadDataforTable(idRuta: number) {
    this._primaryService.getDataCasasRuta(idRuta).subscribe({
      next: (response) => {
        this.dataTable = this.formatData(response.data);
        console.log(this.dataTable);

      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data de temperatura.' });
      }
    })
  }

  formatData(data: casasVisitaData[]): any[] {
    return data.map((item) => {
      return {
        ...item,
        nombre: item.nombre && item.apellido ? item.nombre + ' ' + item.apellido : ' ',
      }
    })
  }

  fillText(event:{originalEvent:any,value:MadresDonantes}, index:number) {
    this.dataTable[index].nombre = event.value.nombre;
    this.dataTable[index].direccion = event.value.direccion;
    this.dataTable[index].celular = event.value.celular;
  }

  onRowSelect(event: any) {

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
