import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
    NewRegisterTemperaturaComponent,
    TableTemperaturaComponent,
    NewRegisterCasaComponent,
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

  cerrarDialogo() {
    this.dialogVisible = false;
    this.rowDataDialog = null;
    this.dialogClosed.emit()
  }

  onSecondaryDialogHide() {
    this.secondaryDialogVisible = false;
    this.selectedCasaNo = null;
  }

  agregarColumna(evento: { nombre: string }) {
    // const nuevaColumna = evento.nombre;
    // this.dynamicColumns.push(nuevaColumna);
    // if (this.rowDataDialog) {
    //   (this.rowDataDialog as any)[nuevaColumna] = null;
    //   this.nuevaColumna = nuevaColumna;
    //   // Resetear nuevaColumna después de un breve momento para permitir que se detecte el cambio
    //   setTimeout(() => {
    //     this.nuevaColumna = null;
    //   }, 0);
    // }
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


}
