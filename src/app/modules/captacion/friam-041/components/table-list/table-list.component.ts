import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { Customer } from './interfaces/customer';
import { CustomerService } from './services/customerservice';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { NewRegisterComponent } from '../new-register/new-register.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-list',
  imports: [
    TableModule,
    HttpClientModule,
    HeaderComponent,
    MonthPickerComponent,
    NewRegisterComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss',
  providers: [CustomerService],
})
export class TableListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = []; // Nueva propiedad para los datos filtrados
  editingRow: Customer | null = null;
  clonedCustomer: Customer | null = null;
  headersTableLineaAmiga: any[] = [
    { header: 'REMITE', field: 'remite', rowspan: 2, width: '200px' },
    { header: 'NOMBRES', field: 'nombres', rowspan: 2, width: '200px' },
    { header: 'APELLIDOS', field: 'apellidos', rowspan: 2, width: '200px' },
    { header: 'FECHA PARTO', field: 'fechaParto', rowspan: 2, width: '200px' },
    { header: 'NO. DOC', field: 'documento', rowspan: 2, width: '200px' },
    { header: 'EDAD', field: 'edad', rowspan: 2, width: '200px' },
    { header: 'TELEFONO', field: 'telefono', rowspan: 2, width: '200px' },
    { header: 'BARRIO', field: 'barrio', rowspan: 2, width: '200px' },
    { header: 'DIRECCION', field: 'direccion', rowspan: 2, width: '200px' },
    { header: 'EDUCACION PRESENCIAL', field: 'educacion', rowspan: 2, width: '200px' },
    { header: 'FECHA LLAMADA', field: 'fechaLlamada', rowspan: 2, width: '200px' },
    { header: 'LLAMADA', colspan: 2, align: 'center', width: '400px' },
    { header: 'RESPONSABLE', field: 'responsable', rowspan: 2, width: '200px' },
    { header: 'RECIBE ASESORIA', colspan: 2, align: 'center', width: '400px' },
    { header: 'POSIBLE DONANTE', colspan: 2, align: 'center', width: '400px' },
    { header: 'FECHA VISITA', field: 'fechaVisita', rowspan: 2, width: '200px' },
    { header: 'OBSERVACIONES', field: 'observaciones', rowspan: 2, width: '200px' },
    { header: 'ACCIONES', field: 'acciones', rowspan: 2, width: '200px' }
  ];
  subeHeaderTable:any[] = [
    { header: 'ENTRANTE', field: 'llamadaSI' },
    { header: 'SALIENTE', field: 'llamadaNO' },
    { header: 'SI', field: 'asesoriaSI' },
    { header: 'NO', field: 'asesoriaNO' },
    { header: 'SI', field: 'donanteSI' },
    { header: 'NO', field: 'donanteNO' },
  ]

  constructor(private customerService: CustomerService) { }

  ngOnInit() {
    this.customerService.getCustomersMedium().then((data: Customer[]) => {
      this.customers = data;
      this.filteredCustomers = [...this.customers]; // Inicializa los datos filtrados
    });
  }

  agregarFilaVacia() {
    const nuevoRegistro: Customer = {
      remite: '',
      nombres: '',
      apellidos: '',
      fecha_parto: '',
      no_doc: '',
      edad: '',
      telefono: '',
      barrio: '',
      direccion: '',
      educacion_presencial: '',
      fecha_llamada: '',
      llamada_entrante: false,
      llamada_saliente: false,
      responsable: '',
      recibe_asesoria_si: false,
      recibe_asesoria_no: false,
      posible_donante_si: false,
      posible_donante_no: false,
      fecha_visita: '',
      observaciones: '',
    };
    this.customers.push(nuevoRegistro);
    const fechaParto = nuevoRegistro.fecha_parto
      ? new Date(nuevoRegistro.fecha_parto)
      : null;
    if (
      !fechaParto || // Si no hay filtro activo
      (fechaParto.getFullYear() === this.filtroActual?.year &&
        fechaParto.getMonth() + 1 === this.filtroActual?.month)
    ) {
      this.filteredCustomers.push(nuevoRegistro); // Agrega el registro a la lista filtrada si cumple con el filtro
    }
    this.editarFila(nuevoRegistro); // Empieza en edición al darle al btn de nuevo registro
  }

  editarFila(customer: Customer) {
    this.clonedCustomer = { ...customer };
    this.editingRow = customer;
  }

  guardarFila() {
    this.editingRow = null;
    this.clonedCustomer = null;
  }

  // guardarFila() {
  //   if (this.editingRow) {
  //     if (!this.editingRow.nombres || !this.editingRow.apellidos) {
  //       alert('Los campos "nombres" y "apellidos" no pueden estar vacíos.');
  //       return;
  //     }
  //   }
  //   this.editingRow = null;
  //   this.clonedCustomer = null;
  // }

  cancelarEdicion() {
    if (this.editingRow && this.clonedCustomer) {
      Object.assign(this.editingRow, this.clonedCustomer);
    }
    this.editingRow = null;
    this.clonedCustomer = null;
  }

  filtroActual: { year: number; month: number } | null = null; // Nueva propiedad para guardar el filtro actual

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.filtroActual = filtro; // Guardaa el filtro actual
    this.filteredCustomers = this.customers.filter((customer) => {
      if (!customer.fecha_parto) {
        return false; // Excluyye los registros sin fecha
      }

      const fechaParto = new Date(customer.fecha_parto); // Asegúrate de que sea una fecha válida
      return (
        fechaParto.getFullYear() === filtro.year &&
        fechaParto.getMonth() + 1 === filtro.month
      );
    });
  }
}
