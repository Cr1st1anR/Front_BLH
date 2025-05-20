import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MonthPickerComponent } from '../month-picker/month-picker.component';
import { NewRouteComponent } from '../new-route/new-route.component';
import { Customer } from './interfaces/customer';
import { CustomerService } from './services/customerservice';
import { SecondaryDialogComponent } from '../secondary-dialog/secondary-dialog.component';
import { PrimaryDialogComponent } from '../primary-dialog/primary-dialog.component';
import { TableComponent } from '../principal-table/table.component';
import { RutaRecoleccionService } from './services/ruta-recoleccion.service';

@Component({
  selector: 'app-table-list',
  imports: [
    TableModule,
    DialogModule,
    HttpClientModule,
    HeaderComponent,
    MonthPickerComponent,
    NewRouteComponent,
    FormsModule,
    CommonModule,
    TableComponent,
    SecondaryDialogComponent,
    PrimaryDialogComponent,
  ],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss',
  providers: [CustomerService, RutaRecoleccionService],
})
export class TableListComponent {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = []; 
  editingRow: Customer | null = null; 
  filaEnEdicion: Customer | null = null;
  clonedCustomer: Customer | null = null; 
  enModoEdicion: boolean = false;
  selectedCustomer: Customer | null = null;
  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getCustomersMedium().then((data: Customer[]) => {
      this.customers = data;
      this.filteredCustomers = [...this.customers]; 
    });

  }

  agregarFilaVacia() {
    let fechaStr = '';
    if (this.filtroActual) {
      const dia = new Date().getDate().toString().padStart(2, '0');
      const mes = this.filtroActual.month.toString().padStart(2, '0');
      const año = this.filtroActual.year;
      fechaStr = `${dia}/${mes}/${año}`;
    } else {

      const hoy = new Date();
      const dia = hoy.getDate().toString().padStart(2, '0');
      const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const año = hoy.getFullYear();
      fechaStr = `${dia}/${mes}/${año}`;
    }

    const nuevaRuta: Customer = {
      fecha: fechaStr, 
      ruta: '',
      placaVehiculo: '',
      conductor: '',
      kmInicial: 0,
      kmFinal: 0, 
      horaSalida: '',
      horaLlegada: '',
      responsableTecnico: '',
      cargo: '',
      totalVisitas: 0, 
      volumenLecheRecolectada: 0, 
    };
    this.customers.push(nuevaRuta);

    if (this.filtroActual) {
      const partesFecha = fechaStr.split('/');
      const mes = parseInt(partesFecha[1], 10);
      const año = parseInt(partesFecha[2], 10);

      if (año === this.filtroActual.year && mes === this.filtroActual.month) {
        this.filteredCustomers.push(nuevaRuta); 
      }
    } else {
      this.filteredCustomers.push(nuevaRuta); 
    }

    this.filaEnEdicion = nuevaRuta;
  }

  editarFila(customer: Customer) {
    this.clonedCustomer = { ...customer };
    this.editingRow = customer;
  }

  filtroActual: { year: number; month: number } | null = null; 

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.filtroActual = filtro; 
    this.filteredCustomers = this.customers.filter((customer) => {
      if (!customer.fecha) {
        return false; 
      }

      const fechaStr = String(customer.fecha); 
      const partesFecha = fechaStr.split('/');
      if (partesFecha.length !== 3) {
        return false; 
      }

      const dia = parseInt(partesFecha[0], 10);
      const mes = parseInt(partesFecha[1], 10);
      const año = parseInt(partesFecha[2], 10);

      return año === filtro.year && mes === filtro.month;
    });
  }


  onFilaSeleccionada(customer: Customer): void {
    if (!this.enModoEdicion) {
      console.log('TableListComponent - Fila seleccionada:', customer);
      console.log('TableListComponent - ID y propiedades importantes:', {
        id: customer.id,
        noCaja: customer.noCaja,
        tSalida: customer.tSalida,
        hSalida: customer.hSalida,
        tCasa1: customer.tCasa1
      });

      this.selectedCustomer = customer;
 
    }
  }

  onModoEdicionCambiado(enEdicion: boolean): void {
    this.enModoEdicion = enEdicion;
  }

  onDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.selectedCustomer = null;
    }
  }
}
