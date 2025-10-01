import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-caja',
  imports: [ButtonModule],
  templateUrl: './new-register-caja.component.html',
  styleUrl: './new-register-caja.component.scss',
})
export class NewRegisterCajaComponent {
  @Input() disabled: boolean = false;
  @Output() nuevaCaja = new EventEmitter<void>();

  crearNuevaCaja() {
    this.nuevaCaja.emit();
  }
}
