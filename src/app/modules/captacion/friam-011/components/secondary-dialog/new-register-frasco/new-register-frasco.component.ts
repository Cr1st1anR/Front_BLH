import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-frasco',
  imports: [ButtonModule],
  templateUrl: './new-register-frasco.component.html',
  styleUrl: './new-register-frasco.component.scss',
})
export class NewRegisterFrascoComponent {
  frascosData: any[] = []; // Datos para la nueva tabla en el tercer Dialog
  editingFrascoRow: any = null; // Fila en edición en la nueva tabla
  clonedFrascoRow: any = null; // Copia de la fila en edición en la nueva tabla

  @Output() nuevoRegistroFrasco = new EventEmitter<void>();

  crearRegistroFrasco() {
    this.nuevoRegistroFrasco.emit(); // Emite el evento para crear un nuevo registro
  }

  // // Función para activar el modo de edición en la nueva tabla
  // editarFrasco(row: any) {
  //   this.clonedFrascoRow = { ...row }; // Crea una copia de la fila en edición
  //   this.editingFrascoRow = row; // Establece la fila en edición
  // }

  // // Función para crear un nuevo registro en la tabla de frascos
  // crearNuevoRegistroFrasco() {
  //   const nuevoFrasco = {
  //     noFrasco: null,
  //     volumenEstimado: null,
  //     fechaExtraccion: '',
  //     tipoFrasco: '',
  //     noTermo: null,
  //     congelador: '',
  //     gaveta: null,
  //   };

  //   this.frascosData.push(nuevoFrasco); // Agrega la nueva fila
  //   this.editarFrasco(nuevoFrasco); // Activa el modo de edición para la nueva fila
  // }
}
