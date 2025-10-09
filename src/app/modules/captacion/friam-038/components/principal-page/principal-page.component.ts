import { Component, OnInit } from '@angular/core';
import { TableMadresSeguimientoComponent } from '../table-madres-seguimiento/table-madres-seguimiento.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimaryDialogSeguimientoComponent } from '../primary-dialog-seguimiento/primary-dialog-seguimiento.component';

@Component({
  selector: 'principal-page-seguimiento',
  imports: [
    TableMadresSeguimientoComponent,
    HeaderComponent,
    PrimaryDialogSeguimientoComponent,
  ],
  templateUrl: './principal-page.component.html',
  styleUrl: './principal-page.component.scss',
})
export class PrincipalPageComponent implements OnInit {
  codigoDonante: string | null = null;
  idSeguimiento: number | null = null;
  showDialog: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // Escuchar cambios en query parameters
    this.route.queryParams.subscribe((params) => {
      this.codigoDonante = params['codigoDonante'] || null;
      // Mantener el idSeguimiento internamente pero no en la URL
      this.showDialog = !!this.codigoDonante;
    });
  }

  onRowClick(row: any) {
    console.log('Fila seleccionada:', row);
    // Guardar el idSeguimiento internamente
    this.idSeguimiento = row.id_seguimiento;

    // Solo navegar con codigoDonante en la URL
    this.router.navigate(['/blh/captacion/visitas-domiciliarias-seguimiento'], {
      queryParams: {
        codigoDonante: row.codigo_donante,
      },
    });
  }

  onDialogClosed() {
    this.showDialog = false;
    this.codigoDonante = null;
    this.idSeguimiento = null;
    // Limpiar query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
