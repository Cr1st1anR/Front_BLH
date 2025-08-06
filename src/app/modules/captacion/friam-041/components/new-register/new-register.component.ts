import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-new-register',
  imports: [ButtonModule],
  templateUrl: './new-register.component.html',
  styleUrl: './new-register.component.scss',
})
export class NewRegisterComponent {
  @Output() nuevoRegistro = new EventEmitter<void>();
  @Input() disabled: boolean = false;

  crearRegistro() {
    this.nuevoRegistro.emit();
  }

}
