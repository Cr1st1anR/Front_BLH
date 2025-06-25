import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableFrascoComponent } from './table-frasco/table-frasco.component';
import { NewRegisterFrascoComponent } from './new-register-frasco/new-register-frasco.component';
import { casasVisitaData } from '../primary-dialog/interfaces/primaryDialog.interface';


@Component({
  selector: 'secondary-dialog',
  imports: [DialogModule, TableFrascoComponent],
  templateUrl: './secondary-dialog.component.html',
  styleUrl: './secondary-dialog.component.scss',
  providers: [],
})
export class SecondaryDialogComponent implements OnChanges {

  @Input() casaNo: casasVisitaData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  dialogVisible:boolean = false;

  frascosData: casasVisitaData | null = null;
  editingFrascoRow: any = null;
  clonedFrascoRow: any = null;
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['casaNo'] && this.casaNo !== null) {
      this.frascosData = changes['casaNo'].currentValue;
      this.dialogVisible = true;
    }
  }

  cerrarDialogo() {
    this.dialogVisible = false;
    this.casaNo = null;
    this.dialogClosed.emit()
  }


}
