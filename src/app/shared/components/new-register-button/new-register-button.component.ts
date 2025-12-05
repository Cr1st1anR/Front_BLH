import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'shared-new-register-button',
  imports: [ButtonModule],
  templateUrl: './new-register-button.component.html',
  styleUrl: './new-register-button.component.scss',
})
export class NewRegisterButtonComponent {
  @Input() disabled = false;
  @Input() label = 'NUEVO REGISTRO';
  @Input() icon = 'pi pi-plus';
  @Input() ariaLabel = 'Nuevo';

  @Output() nuevoRegistro = new EventEmitter<void>();

  crearNuevoRegistro(): void {
    this.nuevoRegistro.emit();
  }
}
