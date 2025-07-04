import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'new-route',
  imports: [ButtonModule],
  templateUrl: './new-route.component.html',
  styleUrl: './new-route.component.scss',
})

export class NewRouteComponent {
  @Output() nuevaRuta = new EventEmitter<void>();
  @Input() disabled: boolean = false;

  crearRuta() {
    this.nuevaRuta.emit();
  }
}
