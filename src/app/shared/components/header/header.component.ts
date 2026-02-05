import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    @Input() title: string = 'REGISTRO DE LÍNEA AMIGA (FRIAM-041)';

}
