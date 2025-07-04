import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-casa',
  imports: [ButtonModule],
  templateUrl: './new-register-casa.component.html',
  styleUrl: './new-register-casa.component.scss',
})
export class NewRegisterCasaComponent {
  @Output() nuevoRegistro = new EventEmitter<void>();
  @Input() disabled: boolean = false;

  crearNuevoRegistroCasa() {
    this.nuevoRegistro.emit(); 
  }
}
