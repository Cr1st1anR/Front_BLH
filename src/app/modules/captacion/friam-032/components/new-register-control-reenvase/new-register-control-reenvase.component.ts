import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-control-reenvase',
  imports: [ButtonModule],
  templateUrl: './new-register-control-reenvase.component.html',
  styleUrl: './new-register-control-reenvase.component.scss',
})
export class NewRegisterButtonComponent {
  @Input() disabled = false;
  @Output() nuevoRegistro = new EventEmitter<void>();

  crearNuevoRegistro(): void {
    this.nuevoRegistro.emit();
  }
}
