import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-button-distribucion',
  imports: [ButtonModule],
  templateUrl: './new-register-button.component.html',
  styleUrl: './new-register-button.component.scss',
})
export class NewRegisterButtonComponent {
  @Input() disabled = false;
  @Output() nuevoRegistro = new EventEmitter<void>();

  crearNuevoRegistro(): void {
    this.nuevoRegistro.emit();
  }
}
