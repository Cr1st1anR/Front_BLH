import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { AcidezDornicTableComponent } from '../acidez-dornic-table/acidez-dornic-table.component';
import type { SeleccionClasificacionData } from '../../interfaces/seleccion-clasificacion.interface';

@Component({
  selector: 'acidez-dornic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    AcidezDornicTableComponent
  ],
  templateUrl: './acidez-dornic-dialog.component.html',
  styleUrl: './acidez-dornic-dialog.component.scss',
  providers: [MessageService]
})
export class AcidezDornicDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() seleccionClasificacionData: SeleccionClasificacionData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(AcidezDornicTableComponent) acidezDornicTableComp!: AcidezDornicTableComponent;

  loading: boolean = false;

  get dialogHeader(): string {
    if (this.seleccionClasificacionData?.no_frasco_procesado) {
      return `Acidez Dornic - Frasco: ${this.seleccionClasificacionData.no_frasco_procesado}`;
    }
    return 'Acidez Dornic';
  }

  get idSeleccionClasificacion(): number | null {
    return this.seleccionClasificacionData?.id || null;
  }

  constructor(private readonly messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue && this.seleccionClasificacionData) {
      this.mostrarMensajeCarga();
    }
  }

  closeDialog(): void {
    this.visible = false;
    this.dialogClosed.emit();
  }

  private mostrarMensajeCarga(): void {
    if (this.seleccionClasificacionData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando acidez dornic para frasco: ${this.seleccionClasificacionData.no_frasco_procesado}`,
        key: 'tr',
        life: 2000,
      });
    }
  }
}
