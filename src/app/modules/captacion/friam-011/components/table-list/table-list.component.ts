import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  input,
  Output,
  output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { NewRouteComponent } from '../new-route/new-route.component';
import { rutaRecoleccion } from './interfaces/ruta-recoleccion';
import { SecondaryDialogComponent } from '../secondary-dialog/secondary-dialog.component';
import { PrimaryDialogComponent } from '../primary-dialog/primary-dialog.component';
import { TableComponent } from '../principal-table/table.component';

@Component({
  selector: 'app-table-list',
  imports: [
    TableModule,
    DialogModule,
    HeaderComponent,
    FormsModule,
    CommonModule,
    TableComponent,
    PrimaryDialogComponent,
  ],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss',
})
export class TableListComponent {
  @ViewChild(TableComponent) tableMain!: TableComponent;

  rowSelected: any = null;
  datesSelected: { year: number; month: number } = {} as {
    year: number;
    month: number;
  };

  constructor() {}

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.datesSelected = filtro;
  }

  onRowSelected(dataSelect: rutaRecoleccion): void {
    this.rowSelected = dataSelect;
  }

  onClosedDialog() {
    this.rowSelected = null;
    if (this.tableMain) {
      this.tableMain.limpiarSeleccion();
    }
  }
}
