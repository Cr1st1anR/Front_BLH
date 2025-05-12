import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'new-register-temperatura',
  imports: [ButtonModule],
  templateUrl: './new-register-temperatura.component.html',
  styleUrl: './new-register-temperatura.component.scss',
})
export class NewRegisterTemperaturaComponent {
  @Output() nuevaColumna = new EventEmitter<string>();

  private contadorColumnas = 1; // Inicia en 5 porque ya tienes T° CASA 1 a T° CASA 5

  crearColumna() {
    this.contadorColumnas++;
    const nuevaColumna = `T° CASA ${this.contadorColumnas}`;
    this.nuevaColumna.emit(nuevaColumna); // Emitimos el nombre de la nueva columna
  }
}
