import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-pasterizacion',
  imports: [ButtonModule],
  templateUrl: './new-register-pasterizacion.component.html',
  styleUrl: './new-register-pasterizacion.component.scss',
})
export class NewRegisterPasterizacionComponent {
  @Input() disabled: boolean = false;
  @Output() nuevaPasterizacion = new EventEmitter<void>();

  crearNuevaPasterizacion(): void {
    this.nuevaPasterizacion.emit();
  }
}
