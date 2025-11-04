import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { PasterizacionDialogComponent } from '../../components/pasterizacion-dialog/pasterizacion-dialog.component';
import { ControlReenvaseService } from '../../services/control-reenvase.service'; // ✅ AGREGAR IMPORT
import type { ControlReenvaseData } from '../../interfaces/control-reenvase.interface';

@Component({
  selector: 'pasterizacion-page',
  imports: [
    PasterizacionDialogComponent
  ],
  templateUrl: './pasterizacion-page.component.html',
  styleUrl: './pasterizacion-page.component.scss'
})
export class PasterizacionPageComponent implements OnInit {
  controlReenvaseData: ControlReenvaseData | null = null;
  showDialog: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private controlReenvaseService: ControlReenvaseService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['noDonante']) {
        const noDonante = params['noDonante'];
        const registroCompleto = this.buscarRegistroPorNoDonante(noDonante);
        
        if (registroCompleto) {
          this.controlReenvaseData = registroCompleto;
          this.showDialog = true;
        } else {
          console.warn('No se encontró registro para el donante:', noDonante);
          this.showDialog = false;
          this.controlReenvaseData = null;
        }
      } else {
        this.showDialog = false;
        this.controlReenvaseData = null;
      }
    });
  }

  private buscarRegistroPorNoDonante(noDonante: string): ControlReenvaseData | null {
    const todosLosRegistros = this.controlReenvaseService.getControlReenvaseData();
    return todosLosRegistros.find(registro => registro.no_donante === noDonante) || null;
  }

  onDialogClosed(): void {
    this.showDialog = false;
    this.controlReenvaseData = null;
    this.router.navigate(['/blh/captacion/control-reenvase']);
  }
}
