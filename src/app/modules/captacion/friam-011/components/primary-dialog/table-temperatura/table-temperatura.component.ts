import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { rutaRecoleccion } from '../../table-list/interfaces/ruta-recoleccion';
import { MessageService } from 'primeng/api';
import { primaryDialogServices } from '../services/primaryDialog.service';
import { TemperaturaData } from '../interfaces/primaryDialog.interface';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'table-temperatura',
  imports: [
    TableModule, 
    FormsModule, 
    CommonModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    ToastModule
  ],
  providers: [
    primaryDialogServices, 
    MessageService
  ],
  templateUrl: './table-temperatura.component.html',
  styleUrl: './table-temperatura.component.scss',
})
export class TableTemperaturaComponent implements OnInit, OnChanges {

  @Input() nuevaColumna: string | null = null;
  @Input() dataRutaRecoleccion: rutaRecoleccion | null = null;

  dataTable: any[] = [];
  headerTableTemperatura: any[] = [
    { header: 'No. CAJA', field: 'caja', width: '200px', tipo: "number" },
    { header: 'HORA DE SALIDA', field: 'hora_salida', width: '200px', tipo: "time" },
    { header: 'T° DE SALIDA', field: 't_salida', width: '200px', tipo: "number" },
    { header: 'HORA DE LLEGADA', field: 'hora_llegada', width: '200px', tipo: "time" },
    { header: 'T° DE LLEGADA', field: 't_llegada', width: '200px', tipo: "number" },
    { header: 'ACCIONES', field: 'acciones', width: '200px' }
  ];

  clonedCustomer: rutaRecoleccion | null = null;
  editingColumn: string | null = null;
  editingRow: rutaRecoleccion | null = null;

  requiredFields: string[] = ['caja', 'hora_salida', 't_salida'];

  constructor(
    private messageService: MessageService,
    private _primaryService: primaryDialogServices
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataRutaRecoleccion'] && changes['dataRutaRecoleccion'].currentValue) {
      this.loadDataforTable(this.dataRutaRecoleccion?.id_ruta!);
    }
  }

  loadDataforTable(idRuta: number) {
    this._primaryService.getDataTemperaturaRuta(idRuta).subscribe({
      next: (response) => {
        this.dataTable = this.formatData(response.data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data de temperatura.' });
      }
    })
  }

  formatData(data: TemperaturaData[]): any[] {

    let dataAux = [
      {
        caja: 1,
        hora_salida: this.dataRutaRecoleccion?.hora_salida,
        t_salida: parseFloat((this.dataRutaRecoleccion?.temperatura_salida?.toString() ?? '').split('°')[0]),
        hora_llegada: this.dataRutaRecoleccion?.hora_llegada,
        t_llegada: parseFloat((this.dataRutaRecoleccion?.temperatura_llegada?.toString() ?? '').split('°')[0]),
      }
    ];
    const temperatura = Array.from({ length: data.length }, (_, i) => ({
      header: `TEMPERATURA ${i + 1} (°C)`,
      field: `temperature_${i + 1}`,
      width: '200px',
      tipo: 'number',
      nCasa: i+1
    }));

    
    this.headerTableTemperatura.splice(3, 0, ...temperatura);
    
    this.headerTableTemperatura.forEach((header) => {
      if(header.nCasa){
        const tempFilter = data.filter((x) => x.numeroCasa === header.nCasa);
        (dataAux[0] as any)['temperature_' + tempFilter[0].numeroCasa] = tempFilter[0].temperatura;
      }
    });
    
    return dataAux
  }

  guardarEdicion(customer: rutaRecoleccion) {
    this.editingColumn = null;
    this.clonedCustomer = null;
  }

  onRowEditInit(dataRow: any): void {

  }

  onRowEditSave(data: any, inex: number, event: any) {

  }

  onRowEditCancel(dataRow: rutaRecoleccion, index: number): void {

  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return this.requiredFields.includes(field) &&
      (dataRow[field] === null || dataRow[field] === undefined || dataRow[field] === '');
  }
}

