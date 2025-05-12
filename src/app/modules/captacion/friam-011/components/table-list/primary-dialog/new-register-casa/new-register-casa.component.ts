import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-casa',
  imports: [ButtonModule],
  templateUrl: './new-register-casa.component.html',
  styleUrl: './new-register-casa.component.scss',
})
export class NewRegisterCasaComponent {
  @Output() nuevoRegistro = new EventEmitter<void>();

  crearNuevoRegistroCasa() {
    this.nuevoRegistro.emit(); // Emite el evento para crear una nueva fila
  }
}
