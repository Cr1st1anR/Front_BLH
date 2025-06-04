import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableFrascoComponent } from './table-frasco/table-frasco.component';
import { NewRegisterFrascoComponent } from './new-register-frasco/new-register-frasco.component';


@Component({
  selector: 'secondary-dialog',
  imports: [DialogModule, TableFrascoComponent, NewRegisterFrascoComponent],
  templateUrl: './secondary-dialog.component.html',
  styleUrl: './secondary-dialog.component.scss',
  providers: [],
})
export class SecondaryDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() casaNo: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onHide = new EventEmitter<void>();

  frascosData: any[] = [];
  editingFrascoRow: any = null;
  clonedFrascoRow: any = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['casaNo'] && this.casaNo !== null) {
      this.cargarFrascosData(this.casaNo);
    }
  }

  cargarFrascosData(casaNo: number) {
    console.log('Cargando frascos para casa:', casaNo);
    // this.customerService.getFrascosData(casaNo).then((data: any[]) => {
    //   this.frascosData = data;
    //   console.log('Frascos cargados:', this.frascosData);
    // });
  }

  onDialogHide() {
    this.visibleChange.emit(false);
    this.onHide.emit();
  }

  crearNuevoRegistroFrasco() {
    const nuevoFrasco = {
      noFrasco: 1, // Por defecto, el número de frasco es 1
      volumenEstimado: null,
      fechaExtraccion: '',
      tipoFrasco: '',
      noTermo: null,
      congelador: '',
      gaveta: null,
      casaNo: this.casaNo // Asociamos el frasco con la casa seleccionada
    };

    this.frascosData.push(nuevoFrasco);
    this.editarFrasco(nuevoFrasco);
  }

  editarFrasco(row: any) {
    this.clonedFrascoRow = { ...row };
    this.editingFrascoRow = row;
  }

  guardarFrasco() {
    this.editingFrascoRow = null;
    this.clonedFrascoRow = null;
  }

  cancelarEdicionFrasco() {
    if (this.editingFrascoRow && this.clonedFrascoRow) {
      Object.assign(this.editingFrascoRow, this.clonedFrascoRow);
    }
    this.editingFrascoRow = null;
    this.clonedFrascoRow = null;
  }
}
