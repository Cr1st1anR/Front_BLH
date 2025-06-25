import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { NewRegisterTemperaturaComponent } from './new-register-temperatura/new-register-temperatura.component';
import { TableTemperaturaComponent } from './table-temperatura/table-temperatura.component';
import { NewRegisterCasaComponent } from './new-register-casa/new-register-casa.component';
import { TableCasaComponent } from "./table-casa/table-casa.component";
import { SecondaryDialogComponent } from '../secondary-dialog/secondary-dialog.component';
import { rutaRecoleccion } from '../table-list/interfaces/ruta-recoleccion';
import { casasVisitaData } from './interfaces/primaryDialog.interface';

@Component({
  selector: 'primary-dialog',
  imports: [
    DialogModule,
    TableTemperaturaComponent,
    TableCasaComponent,
    SecondaryDialogComponent
  ],
  templateUrl: './primary-dialog.component.html',
  styleUrl: './primary-dialog.component.scss',
  providers: [],
})
export class PrimaryDialogComponent implements OnChanges {

  @Input() rowDataDialog: rutaRecoleccion | null = null; 
  @Output() dialogClosed = new EventEmitter<void>();
  @ViewChild(TableCasaComponent) tableMain!: TableCasaComponent;


  dialogVisible:boolean = false;
  dataRutaRecoleccion: any = null; 

  secondaryDialogVisible: boolean = false;
  selectedCasaNo: casasVisitaData | null = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges):void {
    if (changes['rowDataDialog'] && changes['rowDataDialog'].currentValue) {
      this.dataRutaRecoleccion = changes['rowDataDialog'].currentValue;
      this.dialogVisible = true;
    }
  }

  onClosedDialog() {
    this.selectedCasaNo = null;
    if (this.tableMain) {
      this.tableMain.limpiarSeleccion();
    }
  }

  crearNuevoRegistroCasa() {
    // Función para crear un nuevo registro en la segunda tabla
    // const nuevoRegistro = {
    //   casaNo: null,
    //   codigo: null,
    //   nombre: '',
    //   direccion: '',
    //   telefono1: null,
    //   telefono2: null,
    //   observaciones: '',
    // };

    // this.secondaryTableData.push(nuevoRegistro); // Agrega la nueva fila
    // this.editarFilaSecondary(nuevoRegistro); // Activa el modo de edición para la nueva fila
  }

  openDialogFrascosL(data: casasVisitaData) {
    this.selectedCasaNo = data;
  }

  onClosedDialogPrimary(){
    this.dialogClosed.emit();
    this.dialogVisible = false;
  }


}
