import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { NewRouteComponent } from './new-route/new-route.component';
import { Customer } from './interfaces/customer';
import { CustomerService } from './services/customerservice';
import { NewRegisterTemperaturaComponent } from './primary-dialog/new-register-temperatura/new-register-temperatura.component';
import { NewRegisterCasaComponent } from './primary-dialog/new-register-casa/new-register-casa.component';
import { NewRegisterFrascoComponent } from './secondary-dialog/new-register-frasco/new-register-frasco.component';
import { TableComponent } from './table/table.component';
import { SecondaryDialogComponent } from './secondary-dialog/secondary-dialog.component';
import { PrimaryDialogComponent } from './primary-dialog/primary-dialog.component';

@Component({
  selector: 'app-table-list',
  imports: [
    TableModule,
    DialogModule, // Importación del Dialog
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
  providers: [CustomerService],
})
export class TableListComponent {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = []; // Datos filtrados para la tabla principal
  editingRow: Customer | null = null; // Fila en edición en la tabla principal
  filaEnEdicion: Customer | null = null;
  clonedCustomer: Customer | null = null; // Copia de la fila en edición

  // Propiedad para controlar si estamos en modo edición
  enModoEdicion: boolean = false;
  // Propiedad para almacenar la fila seleccionada
  selectedCustomer: Customer | null = null;

  // dialogVisible: boolean = false; // Controla la visibilidad del Dialog primary dialoggggggggggggggggg
  // selectedRow: Customer[] = []; // Fila seleccionada en la tabla principal

  // dialogRow: Customer | null = null; // Fila seleccionada para la tabla del Dialog

  // dynamicColumns: string[] = ['T° CASA 1']; // Columnas dinámicas iniciales

  // // Segunda tabla dentro del Dialog
  // secondaryTableData: any[] = []; // Datos de la nueva tabla dentro del Dialog
  // selectedSecondaryRow: any = null; // Fila seleccionada en la nueva tabla
  // editingSecondaryRow: any = null; // Fila en edición en la nueva tabla
  // clonedSecondaryRow: any = null; // Copia de la fila en edición en la nueva tabla

  // // Nuevo Dialog
  // tercerDialogVisible: boolean = false; // Controla la visibilidad del nuevo Dialog
  // selectedCasaNo: number | null = null; // Almacena el casaNo de la fila seleccionada
  // frascosData: any[] = []; // Datos para la nueva tabla en el tercer Dialog
  // editingFrascoRow: any = null; // Fila en edición en la nueva tabla
  // clonedFrascoRow: any = null; // Copia de la fila en edición en la nueva tabla

  // headersTableLineaAmiga: any[] = [
  //   { header: 'FECHA', field: 'fecha', width: '200px' },
  //   { header: 'RUTA', field: 'ruta', width: '200px' },
  //   { header: 'PLACA VEHICULO', field: 'placaVehiculo', width: '200px' },
  //   { header: 'CONDUCTOR', field: 'conductor', width: '200px' },
  //   { header: 'KM.INICIAL', field: 'kmInicial', width: '200px' },
  //   { header: 'KM.FINAL', field: 'kmFinal', width: '200px' },
  //   { header: 'HORA DE SALIDA', field: 'horaSalida', width: '200px' },
  //   { header: 'HORA DE LLEGADA', field: 'horaLlegada', width: '200px' },
  //   {
  //     header: 'RESPONSABLE TECNICO',
  //     field: 'responsableTecnico',
  //     width: '200px',
  //   },
  //   { header: 'CARGO', field: 'cargo', width: '200px' },
  //   { header: 'TOTAL VISITAS', field: 'totalVisitas', width: '200px' },
  //   {
  //     header: 'VOLUMEN DE LECHE RECOLECTADA',
  //     field: 'volumenLecheRecolectada',
  //     width: '200px',
  //   },
  //   { header: 'ACCIONES', field: 'acciones', width: '200px' },
  // ];

  // constructor(private customerService: CustomerService) {}

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    // Carga los datos de la tabla principal
    this.customerService.getCustomersMedium().then((data: Customer[]) => {
      this.customers = data;
      this.filteredCustomers = [...this.customers]; // Inicializa los datos filtrados
    });

    // // Carga los datos para la nueva tabla dentro del Dialog
    // this.customerService.getCustomersMedium().then((data: any[]) => {
    //   this.secondaryTableData = data.map((item) => ({
    //     casaNo: item.casaNo,
    //     codigo: item.codigo,
    //     nombre: item.nombre,
    //     direccion: item.direccion,
    //     telefono1: item.telefono1,
    //     telefono2: item.telefono2,
    //     observaciones: item.observaciones,
    //   }));
    // });
  }

  agregarFilaVacia() {
    // Obtener la fecha actual o usar el filtro seleccionado
    let fechaStr = '';
    if (this.filtroActual) {
      // Formato DD/MM/YYYY con mes y año del filtro actual
      const dia = new Date().getDate().toString().padStart(2, '0');
      const mes = this.filtroActual.month.toString().padStart(2, '0');
      const año = this.filtroActual.year;
      fechaStr = `${dia}/${mes}/${año}`;
    } else {
      // Si no hay filtro, usar la fecha actual
      const hoy = new Date();
      const dia = hoy.getDate().toString().padStart(2, '0');
      const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const año = hoy.getFullYear();
      fechaStr = `${dia}/${mes}/${año}`;
    }

    const nuevaRuta: Customer = {
      fecha: fechaStr, // Usa la fecha formateada como string
      ruta: '',
      placaVehiculo: '',
      conductor: '',
      kmInicial: 0, // Inicializado como número
      kmFinal: 0, // Inicializado como número
      horaSalida: '',
      horaLlegada: '',
      responsableTecnico: '',
      cargo: '',
      totalVisitas: 0, // Inicializado como número
      volumenLecheRecolectada: 0, // Inicializado como número
    };
    this.customers.push(nuevaRuta);

    // Si hay un filtro activo, verificamos si el nuevo registro cumple con él
    if (this.filtroActual) {
      const partesFecha = fechaStr.split('/');
      const mes = parseInt(partesFecha[1], 10);
      const año = parseInt(partesFecha[2], 10);

      if (año === this.filtroActual.year && mes === this.filtroActual.month) {
        this.filteredCustomers.push(nuevaRuta); // Agrega el registro a la lista filtrada
      }
    } else {
      this.filteredCustomers.push(nuevaRuta); // Sin filtro, siempre se añade
    }

    this.filaEnEdicion = nuevaRuta;
  }

  editarFila(customer: Customer) {
    this.clonedCustomer = { ...customer };
    this.editingRow = customer;
  }

  // guardarFila() {
  //   this.editingRow = null;
  //   this.clonedCustomer = null;
  // }

  // cancelarEdicion() {
  //   if (this.editingRow && this.clonedCustomer) {
  //     Object.assign(this.editingRow, this.clonedCustomer);
  //   }
  //   this.editingRow = null;
  //   this.clonedCustomer = null;
  // }

  filtroActual: { year: number; month: number } | null = null; // Nueva propiedad para guardar el filtro actual

  filtrarPorFecha(filtro: { year: number; month: number }): void {
    this.filtroActual = filtro; // Guarda el filtro actual
    this.filteredCustomers = this.customers.filter((customer) => {
      if (!customer.fecha) {
        return false; // Excluye los registros sin fecha
      }

      // Formato esperado: DD/MM/YYYY
      const fechaStr = String(customer.fecha); // Asegurarse de que sea string
      const partesFecha = fechaStr.split('/');
      if (partesFecha.length !== 3) {
        return false; // Formato inválido
      }

      const dia = parseInt(partesFecha[0], 10);
      const mes = parseInt(partesFecha[1], 10);
      const año = parseInt(partesFecha[2], 10);

      return año === filtro.year && mes === filtro.month;
    });
  }

  // Evento al seleccionar una fila
  // onRowSelect(event: any) {
  //   // Evitar que el evento se dispare si hay una fila en edición
  //   if (this.editingRow) {
  //     return;
  //   }

  //   this.selectedRow = [event.data]; // Almacena la fila seleccionada
  //   this.dialogRow = { ...event.data }; // Crea una copia de la fila seleccionada para el Dialog
  //   this.dialogVisible = true; // Muestra el Dialog
  // }

  // // Agregar una nueva columna dinámica
  // agregarColumna(nuevaColumna: string) {
  //   this.dynamicColumns.push(nuevaColumna); // Agrega la nueva columna al arreglo de columnas dinámicas

  //   // Agrega el nuevo campo a la fila seleccionada en el Dialog
  //   if (this.dialogRow) {
  //     (this.dialogRow as any)[nuevaColumna] = null; // Inicializa el nuevo campo con un valor nulo
  //     this.editarFilaDialog(this.dialogRow); // Activa el modo de edición en la fila del Dialog
  //   }
  // }

  // // Activa el modo de edición en la tabla del Dialog
  // editarFilaDialog(row: Customer) {
  //   this.clonedCustomer = { ...row }; // Crea una copia de la fila en edición
  //   this.dialogRow = row; // Establece la fila en edición para el Dialog
  // }

  // // Guardar cambios en la fila del Dialog
  // guardarFilaDialog() {
  //   this.dialogRow = null; // Finaliza el modo de edición en el Dialog
  //   this.clonedCustomer = null;
  // }

  // // Cancelar edición en la tabla del Dialog
  // cancelarEdicionDialog() {
  //   if (this.dialogRow && this.clonedCustomer) {
  //     Object.assign(this.dialogRow, this.clonedCustomer); // Restaura los datos originales
  //   }
  //   this.dialogRow = null;
  //   this.clonedCustomer = null;
  // }

  // // Función para manejar la selección de filas en la nueva tabla
  // onSecondaryRowSelect(event: any) {
  //   console.log('Fila seleccionada en la nueva tabla:', event.data);
  //   this.selectedCasaNo = event.data.casaNo; // Guarda el casaNo de la fila seleccionada

  //   if (this.selectedCasaNo !== null) {
  //     this.cargarFrascosData(this.selectedCasaNo); // Carga los datos para la nueva tabla
  //     this.tercerDialogVisible = true; // Muestra el nuevo Dialog
  //   } else {
  //     console.error(
  //       'selectedCasaNo es null. No se puede cargar la información.'
  //     );
  //   }
  // }

  // // Función para activar el modo de edición en la nueva tabla
  // editarFilaSecondary(row: any) {
  //   this.clonedSecondaryRow = { ...row }; // Crea una copia de la fila en edición
  //   this.editingSecondaryRow = row; // Establece la fila en edición
  // }

  // // Función para guardar los cambios en la nueva tabla
  // guardarFilaSecondary() {
  //   this.editingSecondaryRow = null; // Finaliza el modo de edición
  //   this.clonedSecondaryRow = null;
  // }

  // // Función para cancelar la edición en la nueva tabla
  // cancelarEdicionSecondary() {
  //   if (this.editingSecondaryRow && this.clonedSecondaryRow) {
  //     Object.assign(this.editingSecondaryRow, this.clonedSecondaryRow); // Restaura los datos originales
  //   }
  //   this.editingSecondaryRow = null;
  //   this.clonedSecondaryRow = null;
  // }

  // Método que se llama cuando se selecciona una fila en la tabla
  onFilaSeleccionada(customer: Customer): void {
    // Solo procesamos la selección si no estamos en modo edición
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
      // Aquí puedes implementar la lógica para mostrar el diálogo principal
      // por ejemplo, activar una propiedad que controle la visibilidad del diálogo
    }
  }

  // Método que se llama cuando cambia el modo de edición en la tabla
  onModoEdicionCambiado(enEdicion: boolean): void {
    this.enModoEdicion = enEdicion;
  }

  // Método que se llama cuando cambia la visibilidad del diálogo
  onDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.selectedCustomer = null;
    }
  }
}
