import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms';
import { DescripcionSituacionComponent } from './descripcion-situacion/descripcion-situacion.component';
import { EvaluarLactanciaComponent } from './evaluar-lactancia/evaluar-lactancia.component';
import { DatosAdicionalesComponent } from './datos-adicionales/datos-adicionales.component';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'accordion',
  imports: [
    AccordionModule,
    HeaderComponent,
    FormsModule,
    DescripcionSituacionComponent,
    EvaluarLactanciaComponent,
    DatosAdicionalesComponent,
    ButtonModule,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  documento: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe((params) => {
      this.documento = params.get('documento');
      //console.log('Documento:', this.documento);
    });
  }

  onCancelar() {
    this.router.navigate(['/blh/captacion/visita-domiciliaria']);
  }
}
