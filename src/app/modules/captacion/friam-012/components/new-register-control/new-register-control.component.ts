import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-control',
  imports: [ButtonModule],
  templateUrl: './new-register-control.component.html',
  styleUrl: './new-register-control.component.scss',
})
export class NewRegisterControlComponent {
  @Output() nuevoRegistro = new EventEmitter<void>();
  @Input() disabled: boolean = false;

  crearRegistro() {
    this.nuevoRegistro.emit();
  }
}
