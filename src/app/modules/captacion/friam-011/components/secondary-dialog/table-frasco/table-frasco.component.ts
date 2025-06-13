import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { secondaryDialogServices } from '../services/secondaryDialog.service';
import { FrascosLeche } from '../interface/secondaryDialog.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { casasVisitaData } from '../../primary-dialog/interfaces/primaryDialog.interface';

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
    ToastModule
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
  editingRow: FrascosLeche | null = null; 

  dataTableFrascosLeche: FrascosLeche[] = [];
  clonedTableRutaRecoleccion: { [s: number]: FrascosLeche } = {};
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
    private secondaryDialogServices: secondaryDialogServices
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    debugger
    if (changes['frascosData'] && changes['frascosData'].currentValue) {
      this.dataTableFrascosLeche = changes['frascosData'].currentValue;
      this.LoadDataFrascosLeche(this.frascosData!.id_casa_visita || 0);
    }
  }

  LoadDataFrascosLeche(casaNo: number) {
    this.secondaryDialogServices.getDataFrascosLeche(casaNo).subscribe({
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
    this.clonedTableRutaRecoleccion[dataRow.id_frascos_recolectados as number] = { ...dataRow };
    this.editingRow = dataRow;
    // this.modoEdicionCambiado.emit(true);
  }

  onRowEditSave(data: any, inex: number, event: any) {
    this.editingRow = null;
    // this.clonedTableRutaRecoleccion = null;
    // this.modoEdicionCambiado.emit(false);
  }

  onRowEditCancel(dataRow: FrascosLeche, index: number): void {
    this.dataTableFrascosLeche[index] = this.clonedTableRutaRecoleccion[dataRow.id_frascos_recolectados as number];
    delete this.clonedTableRutaRecoleccion[dataRow.id_frascos_recolectados as number];
  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }

 

}
