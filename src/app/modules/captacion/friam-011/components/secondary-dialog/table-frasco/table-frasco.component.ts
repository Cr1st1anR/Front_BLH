import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';



@Component({
  selector: 'table-frasco',
  imports: [TableModule, FormsModule, CommonModule],
  templateUrl: './table-frasco.component.html',
  styleUrl: './table-frasco.component.scss',
  providers: [],
})
export class TableFrascoComponent {
  @Input() frascosData: any[] = [];
  @Input() editingFrascoRow: any = null;

  @Output() editarFrasco = new EventEmitter<any>();
  @Output() guardarFrasco = new EventEmitter<void>();
  @Output() cancelarEdicionFrasco = new EventEmitter<void>();

  constructor() {}

  // Función para cargar los datos de la nueva tabla en el tercer Dialog
  cargarFrascosData(casaNo: number) {
    // this.customerService.getFrascosData(casaNo).then((data: any[]) => {
    //   this.frascosData = data; // Carga los datos de los frascos
    // });
  }

  onEditarFrasco(row: any) {
    this.editarFrasco.emit(row);
  }

  onGuardarFrasco() {
    this.guardarFrasco.emit();
  }

  onCancelarEdicionFrasco() {
    this.cancelarEdicionFrasco.emit();
  }
}
