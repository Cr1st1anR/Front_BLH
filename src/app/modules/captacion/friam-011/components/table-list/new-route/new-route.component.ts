import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-new-route',
  imports: [ButtonModule],
  templateUrl: './new-route.component.html',
  styleUrl: './new-route.component.scss',
})

export class NewRouteComponent {
  @Output() nuevaRuta = new EventEmitter<void>();

  crearRuta() {
    this.nuevaRuta.emit();
  }
}
