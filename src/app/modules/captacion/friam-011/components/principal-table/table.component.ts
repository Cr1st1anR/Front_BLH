import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Customer } from '../table-list/interfaces/customer';
import { CustomerService } from '../table-list/services/customerservice';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { concat, concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { RutaRecoleccionService } from '../table-list/services/ruta-recoleccion.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'principal-table',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule
  ],
  providers:[
    MessageService,
    RutaRecoleccionService
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() customers: Customer[] = [];
  @Input() filteredCustomers: Customer[] = [];
  @Input() filaEnEdicion: Customer | null = null;
  @Output() filaSeleccionada = new EventEmitter<Customer>();
  @Output() modoEdicionCambiado = new EventEmitter<boolean>();

  selectedRow: Customer[] = [];
  editingRow: Customer | null = null;

  clonedCustomer: Customer | null = null;
  dialogVisible: boolean = false;
  dialogRow: Customer | null = null;

  headersRutaRecoleccion: any[] = [
    { header: 'FECHA', field: 'fecha', width: '200px', tipo: "date" },
    { header: 'RUTA', field: 'ruta', width: '200px', tipo: "text" },
    { header: 'PLACA VEHICULO', field: 'placaVehiculo', width: '200px', tipo: "text" },
    { header: 'CONDUCTOR', field: 'conductor', width: '200px', tipo: "text" },
    { header: 'KM.INICIAL', field: 'kmInicial', width: '200px', tipo: "number" },
    { header: 'KM.FINAL', field: 'kmFinal', width: '200px', tipo: "number" },
    { header: 'HORA DE SALIDA', field: 'horaSalida', width: '200px', tipo: "time" },
    { header: 'HORA DE LLEGADA', field: 'horaLlegada', width: '200px', tipo: "time" },
    {
      header: 'RESPONSABLE TECNICO',
      field: 'responsable',
      width: '200px',
      tipo: "select",
      options: null,
      label: "nombre",
      placeholder: "Seleccione el responsable"
    },
    { header: 'CARGO', field: 'cargo', width: '200px' },
    { header: 'TOTAL VISITAS', field: 'totalVisitas', width: '200px', tipo: "number" },
    {
      header: 'VOLUMEN DE LECHE RECOLECTADA',
      field: 'volumenLecheRecolectada',
      width: '200px',
      tipo: "number"
    },
    { header: 'ACCIONES', field: 'acciones', width: '200px' },
  ];

  constructor(
    private _rutaRecoleccionService: RutaRecoleccionService,
    private messageService: MessageService
  ) { }

  ngOnInit() {

    of(null).pipe(
      // concatMap(() => this._rutaRecoleccionService.getCustomersMedium()),
      concatMap(() => this.loadDataEmpleados()),
    )
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filaEnEdicion'] && this.filaEnEdicion) {
      this.editarFila(this.filaEnEdicion);
      // Limpia la referencia para que no se quede en modo edición indefinidamente
      this.filaEnEdicion = null;
    }
  }

  loadDataEmpleados(): Observable<ApiResponse> {
    return this._rutaRecoleccionService.getDataEmpleados().pipe(
      tap((data) => {
        if (data) {
          this.headersRutaRecoleccion[8].options = data.data;
        }
      })
    );
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

  onRowEditInit(data: any) {

  }

  onRowEditSave(data: any, inex: number, event: any) {

  }

  onRowEditCancel(data: any, index: number) {

  }

  isFieldInvalid(field: string, dataRow: any): boolean {
    return false
  }

}
