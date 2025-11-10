import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { NewRegisterPasterizacionComponent } from '../new-register-pasterizacion/new-register-pasterizacion.component';
import { PasterizacionTableComponent } from '../pasterizacion-table/pasterizacion-table.component';
import type { ControlReenvaseData } from '../../interfaces/control-reenvase.interface';

@Component({
  selector: 'pasterizacion-dialog',
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    NewRegisterPasterizacionComponent,
    PasterizacionTableComponent
  ],
  templateUrl: './pasterizacion-dialog.component.html',
  styleUrl: './pasterizacion-dialog.component.scss',
  providers: [MessageService]
})
export class PasterizacionDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() controlReenvaseData: ControlReenvaseData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(PasterizacionTableComponent) pasterizacionTableComp!: PasterizacionTableComponent;

  loading: boolean = false;

  get dialogHeader(): string {
    if (this.controlReenvaseData?.no_donante) {
      return `Código: ${this.controlReenvaseData.no_donante}`;
    }
    return 'Pasteurizaciones';
  }

  get idControlReenvase(): number | null {
    return this.controlReenvaseData?.id || null;
  }

  constructor(private readonly messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.controlReenvaseData) {
      this.mostrarMensajeCarga();
    }
  }

  onNuevaPasterizacion(): void {
    this.pasterizacionTableComp.crearNuevaPasterizacion();
  }

  isNewPasterizacionButtonDisabled(): boolean {
    return this.pasterizacionTableComp?.isAnyRowEditing() ?? false;
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  private mostrarMensajeCarga(): void {
    if (this.controlReenvaseData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando pasteurizaciones para donante: ${this.controlReenvaseData.no_donante}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
