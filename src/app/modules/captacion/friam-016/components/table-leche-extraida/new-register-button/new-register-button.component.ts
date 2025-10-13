import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-button-leche-extraida',
  imports: [ButtonModule],
  templateUrl: './new-register-button.component.html',
  styleUrl: './new-register-button.component.scss',
})
export class NewRegisterButtonComponent {
  @Input() disabled: boolean = false;
  @Output() nuevoRegistro = new EventEmitter<void>();

  crearNuevoRegistro() {
    this.nuevoRegistro.emit();
  }
}
