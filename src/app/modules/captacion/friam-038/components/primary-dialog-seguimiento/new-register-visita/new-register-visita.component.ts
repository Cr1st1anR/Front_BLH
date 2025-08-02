import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-register-visita',
  imports: [ButtonModule],
  templateUrl: './new-register-visita.component.html',
  styleUrl: './new-register-visita.component.scss',
})
export class NewRegisterVisitaComponent {
  @Input() disabled: boolean = false;
  @Output() nuevaVisita = new EventEmitter<void>();

  crearNuevaVisita() {
    this.nuevaVisita.emit();
  }
}
