import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Customer } from '../interfaces/customer';
import { CustomerService } from '../services/customerservice';

@Component({
  selector: 'principal-table',
  imports: [TableModule, FormsModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() customers: Customer[] = [];
  @Input() filteredCustomers: Customer[] = [];
  @Input() filaEnEdicion: Customer | null = null;
  @Output() filaSeleccionada = new EventEmitter<Customer>();
  @Output() modoEdicionCambiado = new EventEmitter<boolean>();

  // customers: Customer[] = [];
  // filteredCustomers: Customer[] = []; // Datos filtrados para la tabla principal
  selectedRow: Customer[] = []; // Fila seleccionada en la tabla principal
  editingRow: Customer | null = null; // Fila en edición en la tabla principal

  clonedCustomer: Customer | null = null; // Copia de la fila en edición
  dialogVisible: boolean = false; // Controla la visibilidad del Dialog primary dialoggggggggggggggggg
  dialogRow: Customer | null = null; // Fila seleccionada para la tabla del Dialog

  headersTableLineaAmiga: any[] = [
    { header: 'FECHA', field: 'fecha', width: '200px' },
    { header: 'RUTA', field: 'ruta', width: '200px' },
    { header: 'PLACA VEHICULO', field: 'placaVehiculo', width: '200px' },
    { header: 'CONDUCTOR', field: 'conductor', width: '200px' },
    { header: 'KM.INICIAL', field: 'kmInicial', width: '200px' },
    { header: 'KM.FINAL', field: 'kmFinal', width: '200px' },
    { header: 'HORA DE SALIDA', field: 'horaSalida', width: '200px' },
    { header: 'HORA DE LLEGADA', field: 'horaLlegada', width: '200px' },
    {
      header: 'RESPONSABLE TECNICO',
      field: 'responsableTecnico',
      width: '200px',
    },
    { header: 'CARGO', field: 'cargo', width: '200px' },
    { header: 'TOTAL VISITAS', field: 'totalVisitas', width: '200px' },
    {
      header: 'VOLUMEN DE LECHE RECOLECTADA',
      field: 'volumenLecheRecolectada',
      width: '200px',
    },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  constructor(private customerService: CustomerService) {}

  // ngOnInit() {
  //   // Carga los datos de la tabla principal
  //   this.customerService.getCustomersMedium().then((data: Customer[]) => {
  //     this.customers = data;
  //     this.filteredCustomers = [...this.customers]; // Inicializa los datos filtrados
  //   });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filaEnEdicion'] && this.filaEnEdicion) {
      this.editarFila(this.filaEnEdicion);
      // Limpia la referencia para que no se quede en modo edición indefinidamente
      this.filaEnEdicion = null;
    }
  }

  editarFila(customer: Customer) {
    this.clonedCustomer = { ...customer };
    this.editingRow = customer;
    this.modoEdicionCambiado.emit(true);
  }

  guardarFila() {
    this.editingRow = null;
    this.clonedCustomer = null;
    this.modoEdicionCambiado.emit(false);
  }

  cancelarEdicion() {
    if (this.editingRow && this.clonedCustomer) {
      Object.assign(this.editingRow, this.clonedCustomer);
    }
    this.editingRow = null;
    this.clonedCustomer = null;
    this.modoEdicionCambiado.emit(false);
  }

  // Evento al seleccionar una fila
  onRowSelect(event: any) {
    // Evitar que el evento se dispare si hay una fila en edición
    if (this.editingRow !== null) {
      // Deseleccionar la fila recién seleccionada
      this.selectedRow = [];
      return;
    }

    console.log('TableComponent - Fila seleccionada:', event.data);
    console.log('TableComponent - ID y propiedades importantes:', {
      id: event.data.id,
      noCaja: event.data.noCaja,
      tSalida: event.data.tSalida,
      hSalida: event.data.hSalida,
      tCasa1: event.data.tCasa1
    });

    this.selectedRow = [event.data]; // Almacena la fila seleccionada
    this.dialogRow = { ...event.data }; // Crea una copia de la fila seleccionada para el Dialog
    this.dialogVisible = true; // Muestra el Dialog
    this.filaSeleccionada.emit(event.data); // Emite el evento con la fila seleccionada
  }
}
