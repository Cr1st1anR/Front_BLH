import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { secondaryDialogServices } from '../services/secondaryDialog.service';
import { FrascosLeche } from '../interface/secondaryDialog.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { casasVisitaData } from '../../primary-dialog/interfaces/primaryDialog.interface';
import { NewRegisterFrascoComponent } from '../new-register-frasco/new-register-frasco.component';

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
    NewRegisterFrascoComponent
  ],
  templateUrl: './table-frasco.component.html',
  styleUrl: './table-frasco.component.scss',
  providers: [
    MessageService,
    secondaryDialogServices
  ],
})
export class TableFrascoComponent implements OnChanges {

  @Input() frascosData: casasVisitaData | null = null;
  @ViewChild('tableFrascos') table!: Table

  editingRow: FrascosLeche | null = null; 
  dataTableFrascosLeche: FrascosLeche[] = [];
  clonedTableFrascos: { [s: number]: FrascosLeche } = {};
  requiredFields: string[] = [''];


  headersTableFrascosLeche: any[] = [
    { header: 'No. FRASCOS', field: 'frasco', width: '200px', tipo: "number" },
    { header: 'VOLUMEN ESTIMADO', field: 'volumen', width: '200px', tipo: "number" },
    { header: 'FECHA DE EXTRACCION', field: 'fecha_de_extraccion', width: '200px', tipo: "date" },
    { header: 'TIPO DE FRASCO', field: 'tFrasco', width: '200px', tipo: "text" },
    { header: 'N° DE TERMO', field: 'termo', width: '200px', tipo: "number" },
    { header: 'CONGELADOR', field: 'id_congelador', width: '200px', tipo: "number" },
    { header: 'GAVETA', field: 'gaveta', width: '200px', tipo: "number" },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  constructor(
    private messageService: MessageService,
    private _secondaryDialogServices: secondaryDialogServices
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frascosData'] && changes['frascosData'].currentValue) {
      this.dataTableFrascosLeche = changes['frascosData'].currentValue;
      this.LoadDataFrascosLeche(this.frascosData!.id_casa_visita || 0);
    }
  }

  LoadDataFrascosLeche(casaNo: number) {
    this._secondaryDialogServices.getDataFrascosLeche(casaNo).subscribe({
      next: (response) => {
        if (response && response.data.length > 0) {
          this.dataTableFrascosLeche = this.formatData(response.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Datos Cargados',
            detail: 'Los datos de los frascos de leche se han cargado correctamente.',
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se encontraron datos de frascos de leche para la casa seleccionada.',
            life: 3000
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos de los frascos de leche.',
          life: 3000
        });
      }
    })
  }

  formatData(data:FrascosLeche[]): FrascosLeche[] {
    return data.map((item: FrascosLeche) => {
      return {
        ...item,
        frasco: 1,
        fecha_de_extraccion: item.fecha_de_extraccion ? new Date(item.fecha_de_extraccion) : null,
        tFrasco: "Vidrio",
      };
    });
  }

  onRowEditInit(dataRow: FrascosLeche): void {
    this.clonedTableFrascos[dataRow.id_frascos_recolectados as number] = { ...dataRow };
    this.editingRow = dataRow;
  }

  onRowEditSave(dataRow: FrascosLeche, inex: number, event: MouseEvent) {
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
    delete this.clonedTableFrascos[dataRow.id_frascos_recolectados as number];
    const bodyFormat = this.formatInputBody(dataRow);

    if (dataRow.id_frascos_recolectados === undefined || dataRow.id_frascos_recolectados === null) {
      this._secondaryDialogServices.postDataFrascosRecolectados(bodyFormat).subscribe({
        next: (data) => {
          this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Datos guardados', key: 'tr', life: 3000 });
          this.table.saveRowEdit(dataRow, rowElement);
        },
        error: (error) => {
          this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Hubo un error al guardar', key: 'tr', life: 3000 });
        }
      })
    } else {

    }
  }

  onRowEditCancel(dataRow: FrascosLeche, index: number): void {
    this.dataTableFrascosLeche[index] = this.clonedTableFrascos[dataRow.id_frascos_recolectados as number];
    delete this.clonedTableFrascos[dataRow.id_frascos_recolectados as number];
    this.editingRow = null;
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }

  crearNuevoRegistroFrasco(){
    const nuevoRegistro: any = {
      id_frascos_recolectados: null,
      frasco: 1,
      volumen: null,
      fecha_de_extraccion: null,
      tFrasco: "Vidrio",
      termo: null,
      id_congelador: null,
      gaveta: null
    };

    this.dataTableFrascosLeche.push(nuevoRegistro);
    this.editingRow = nuevoRegistro;
    setTimeout(() => {
      this.table.initRowEdit(nuevoRegistro);
    });
  }

  formatInputBody(body:any){

  }
 

}
