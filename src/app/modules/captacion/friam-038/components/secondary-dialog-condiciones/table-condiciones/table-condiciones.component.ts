import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SecondaryDialogCondicionesService } from '../services/secondary-dialog-condiciones.service';

@Component({
  selector: 'table-condiciones',
  imports: [
    CommonModule,
    TableModule,
    RadioButtonModule,
    FormsModule,
    ToastModule,
  ],
  templateUrl: './table-condiciones.component.html',
  styleUrl: './table-condiciones.component.scss',
  providers: [MessageService],
})
export class TableCondicionesComponent implements OnInit {
  condiciones: any[] = [];
  opcionesRespuesta: string[] = ['SI', 'NO', 'N/A'];

  constructor(
    private messageService: MessageService,
    private _secondaryDialogService: SecondaryDialogCondicionesService
  ) {}

  ngOnInit(): void {
    this.loadCondiciones();
  }

  loadCondiciones(): void {
    this.condiciones = this._secondaryDialogService.getCondicionesSituacion();
  }

  onRespuestaChange(condicion: any, valor: string): void {
    condicion.respuesta = valor;
    console.log(`Condición ${condicion.id}: ${valor}`);

    this.messageService.add({
      severity: 'info',
      summary: 'Respuesta actualizada',
      detail: `${condicion.descripcion}: ${valor}`,
      key: 'tr',
      life: 1500,
    });
  }

  getCondicionesData(): any[] {
    return this.condiciones;
  }

  validateCondiciones(): { isValid: boolean; pendientes: number } {
    const condicionesPendientes = this.condiciones.filter(c => c.respuesta === null);
    return {
      isValid: condicionesPendientes.length === 0,
      pendientes: condicionesPendientes.length
    };
  }

  guardarCondiciones(): void {
    const validation = this.validateCondiciones();

    if (validation.isValid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Todas las condiciones han sido evaluadas',
        key: 'tr',
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `Faltan ${validation.pendientes} condiciones por evaluar`,
        key: 'tr',
        life: 3000,
      });
    }
  }
}
