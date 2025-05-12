import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-frasco',
  imports: [ButtonModule],
  templateUrl: './new-register-frasco.component.html',
  styleUrl: './new-register-frasco.component.scss',
})
export class NewRegisterFrascoComponent {
    @Output() nuevoRegistroFrasco = new EventEmitter<void>();

  crearRegistroFrasco() {
    this.nuevoRegistroFrasco.emit(); // Emite el evento para crear un nuevo registro
  }
}
