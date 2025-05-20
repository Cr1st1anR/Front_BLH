import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CustomerService } from '../../table-list/services/customerservice';


@Component({
  selector: 'table-casa',
  imports: [TableModule, FormsModule, CommonModule],
  templateUrl: './table-casa.component.html',
  styleUrl: './table-casa.component.scss',
  providers: [CustomerService],
})
export class TableCasaComponent implements OnChanges {
  // Segunda tabla dentro del Dialog
  @Input() secondaryTableData: any[] = []; // Datos de la nueva tabla dentro del Dialog
  @Input() editingSecondaryRow: any = null;
  @Output() casaSeleccionada = new EventEmitter<{casaNo: number, visible: boolean}>();

  selectedSecondaryRow: any = null; // Fila seleccionada en la nueva tabla
  clonedSecondaryRow: any = null; // Copia de la fila en edición en la nueva tabla

  // Nuevo Dialog
  tercerDialogVisible: boolean = false; // Controla la visibilidad del nuevo Dialog
  selectedCasaNo: number | null = null; // Almacena el casaNo de la fila seleccionada
  frascosData: any[] = []; // Datos para la nueva tabla en el tercer Dialog

  constructor(private customerService: CustomerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['secondaryTableData']) {
      if (this.secondaryTableData && this.secondaryTableData.length > 0) {
        console.log('TableCasaComponent - Datos recibidos:', this.secondaryTableData);
      } else {
        this.cargarDatosSecundarios();
      }
    }
  }

  cargarDatosSecundarios() {
    console.log('TableCasaComponent - Cargando todos los datos de casas...');
    this.customerService.getCustomersMedium().then((data: any[]) => {
      const casasMap = new Map();

      data.forEach(item => {
        if (item.casaNo !== undefined) {
          const key = `${item.casaNo}-${item.codigo}`;
          if (!casasMap.has(key)) {
            casasMap.set(key, {
              casaNo: item.casaNo,
              codigo: item.codigo,
              nombre: item.nombre,
              direccion: item.direccion,
              telefono1: item.telefono1,
              telefono2: item.telefono2,
              observaciones: item.observaciones,
            });
          }
        }
      });

      this.secondaryTableData = Array.from(casasMap.values());
      console.log('TableCasaComponent - Datos cargados:', this.secondaryTableData);
    });
  }

  onRowSelect(event: any) {
    // No permitir selección si hay una fila en edición
    if (this.editingSecondaryRow) {
      return;
    }
    this.casaSeleccionada.emit({ casaNo: event.data.casaNo, visible: true });
  }

  editarFilaSecondary(row: any) {
    this.clonedSecondaryRow = { ...row };
    this.editingSecondaryRow = row;
  }

  guardarFilaSecondary() {
    this.editingSecondaryRow = null;
    this.clonedSecondaryRow = null;
  }

  cancelarEdicionSecondary() {
    if (this.editingSecondaryRow && this.clonedSecondaryRow) {
      Object.assign(this.editingSecondaryRow, this.clonedSecondaryRow);
    }
    this.editingSecondaryRow = null;
    this.clonedSecondaryRow = null;
  }

  // Función para cargar los datos de la nueva tabla en el tercer Dialog
  cargarFrascosData(casaNo: number) {
    this.customerService.getFrascosData(casaNo).then((data: any[]) => {
      this.frascosData = data; // Carga los datos de los frascos
    });
  }
}
