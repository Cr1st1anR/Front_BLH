import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-temperatura',
  imports: [ButtonModule],
  templateUrl: './new-register-temperatura.component.html',
  styleUrl: './new-register-temperatura.component.scss',
})
export class NewRegisterTemperaturaComponent {
  @Input() disabled: boolean = false;
  @Output() nuevaColumna = new EventEmitter<{ nombre: string }>();

  private contadorColumnas = 1;

  crearColumna() {
    this.contadorColumnas++;
    const nuevaColumna = `T° CASA ${this.contadorColumnas}`;
    this.nuevaColumna.emit({ nombre: nuevaColumna });
  }
}
