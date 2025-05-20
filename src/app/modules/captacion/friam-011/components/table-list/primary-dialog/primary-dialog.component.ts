import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { NewRegisterTemperaturaComponent } from './new-register-temperatura/new-register-temperatura.component';
import { Customer } from '../interfaces/customer';
import { TableTemperaturaComponent } from './table-temperatura/table-temperatura.component';
import { NewRegisterCasaComponent } from './new-register-casa/new-register-casa.component';
import { TableCasaComponent } from "./table-casa/table-casa.component";
import { CustomerService } from '../services/customerservice';
import { SecondaryDialogComponent } from '../secondary-dialog/secondary-dialog.component';

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
  providers: [CustomerService],
})
export class PrimaryDialogComponent implements OnChanges {
  @Input() dialogVisible: boolean = false; // Controla la visibilidad del Dialog
  @Input() dialogRow: Customer | null = null; // Fila seleccionada para la tabla del Dialog
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() nuevaColumnaAgregada = new EventEmitter<string>();

  dynamicColumns: string[] = ['T° CASA 1']; // Columnas dinámicas iniciales
  clonedCustomer: Customer | null = null; // Copia de la fila en edición
  nuevaColumna: string | null = null;

  secondaryTableData: any[] = []; // Datos de la nueva tabla dentro del Dialog
  editingSecondaryRow: any = null; // Fila en edición en la nueva tabla
  clonedSecondaryRow: any = null; // Copia de la fila en edición en la nueva tabla

  // Propiedades para el diálogo secundario
  secondaryDialogVisible: boolean = false;
  selectedCasaNo: number | null = null;

  constructor(private customerService: CustomerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dialogRow'] && this.dialogRow) {
      // Cargar datos relacionados o inicializar el diálogo cuando cambia la fila seleccionada
      this.loadRelatedData();
    }
  }

  loadRelatedData() {
    if (!this.dialogRow) return;

    console.log('Fila seleccionada en el diálogo:', this.dialogRow);

    // No necesitamos filtrar por ID, ya que la fila seleccionada ya contiene los datos necesarios
    // para la tabla de temperatura

    // Para la tabla secundaria (tabla de casas), cargamos TODOS los datos disponibles,
    // independientemente de la fila seleccionada en la tabla principal
    this.customerService.getCustomersMedium().then((data: any[]) => {
      // Extraer todos los registros únicos de casas, sin filtrar por ID
      // Usamos un Map para eliminar duplicados basados en casaNo
      const casasMap = new Map();

      data.forEach(item => {
        if (item.casaNo !== undefined) {
          // Usar casaNo + codigo como clave única para evitar duplicados
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

      // Convertir el Map a un array
      this.secondaryTableData = Array.from(casasMap.values());

      console.log('Datos de casas cargados (todos los registros):', this.secondaryTableData);
    });
  }

  onDialogHide() {
    this.visibilityChange.emit(false);
  }

  onCasaSeleccionada(event: { casaNo: number, visible: boolean }) {
    console.log('Casa seleccionada en primary-dialog:', event);
    this.selectedCasaNo = event.casaNo;
    this.secondaryDialogVisible = event.visible;
  }

  onSecondaryDialogHide() {
    this.secondaryDialogVisible = false;
    this.selectedCasaNo = null;
  }

  agregarColumna(evento: { nombre: string }) {
    const nuevaColumna = evento.nombre;
    this.dynamicColumns.push(nuevaColumna);
    if (this.dialogRow) {
      (this.dialogRow as any)[nuevaColumna] = null;
      this.nuevaColumna = nuevaColumna;
      // Resetear nuevaColumna después de un breve momento para permitir que se detecte el cambio
      setTimeout(() => {
        this.nuevaColumna = null;
      }, 0);
    }
  }
  // Activa el modo de edición en la tabla del Dialog
  editarFilaDialog(row: Customer) {
    this.clonedCustomer = { ...row }; // Crea una copia de la fila en edición
    this.dialogRow = row; // Establece la fila en edición para el Dialog
  }

  crearNuevoRegistroCasa() {
    // Función para crear un nuevo registro en la segunda tabla
    const nuevoRegistro = {
      casaNo: null,
      codigo: null,
      nombre: '',
      direccion: '',
      telefono1: null,
      telefono2: null,
      observaciones: '',
    };

    this.secondaryTableData.push(nuevoRegistro); // Agrega la nueva fila
    this.editarFilaSecondary(nuevoRegistro); // Activa el modo de edición para la nueva fila
  }
  // Función para activar el modo de edición en la nueva tabla
  editarFilaSecondary(row: any) {
    this.clonedSecondaryRow = { ...row }; // Crea una copia de la fila en edición
    this.editingSecondaryRow = row; // Establece la fila en edición
  }

  editarColumna(columna: string) {
    if (this.dialogRow) {
      this.dialogRow = { ...this.dialogRow };
      (this.dialogRow as any)[columna] = null;
    }
  }

  onNuevaColumnaAgregada(columna: string) {
    if (this.dialogRow) {
      this.dialogRow = { ...this.dialogRow };
      (this.dialogRow as any)[columna] = null;
    }
  }

  onRowEditInit(customer: Customer) {
    this.clonedCustomer = { ...customer };
  }

  onRowEditSave(customer: Customer) {
    if (this.dialogRow) {
      Object.assign(this.dialogRow, customer);
      this.clonedCustomer = null;
    }
  }

  onRowEditCancel() {
    if (this.dialogRow && this.clonedCustomer) {
      Object.assign(this.dialogRow, this.clonedCustomer);
      this.clonedCustomer = null;
    }
  }
}
