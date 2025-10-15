import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-extraccion',
  imports: [ButtonModule],
  templateUrl: './new-register-extraccion.component.html',
  styleUrl: './new-register-extraccion.component.scss',
})
export class NewRegisterExtraccionComponent {
  @Input() disabled: boolean = false;
  @Output() nuevaExtraccion = new EventEmitter<void>();

  crearNuevaExtraccion() {
    this.nuevaExtraccion.emit();
  }
}
