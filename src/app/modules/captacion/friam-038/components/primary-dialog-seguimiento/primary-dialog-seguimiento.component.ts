import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { TableVisitaComponent } from './table-visita/table-visita.component';
import { SecondaryDialogCondicionesComponent } from "../secondary-dialog-condiciones/secondary-dialog-condiciones.component";
import { ButtonModule } from 'primeng/button';
import { NewRegisterVisitaComponent } from "./new-register-visita/new-register-visita.component";

@Component({
  selector: 'primary-dialog-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ProgressSpinnerModule,
    ToastModule,
    TableVisitaComponent,
    ButtonModule,
    SecondaryDialogCondicionesComponent,
    NewRegisterVisitaComponent
],
  templateUrl: './primary-dialog-seguimiento.component.html',
  styleUrl: './primary-dialog-seguimiento.component.scss',
  providers: [MessageService],
})
export class PrimaryDialogSeguimientoComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() codigoDonante: string | null = null;
  @Input() idSeguimiento: number | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  @ViewChild(TableVisitaComponent) tableVisitaComp!: TableVisitaComponent;

  secondaryDialogVisible: boolean = false;
  selectedVisitaData: any = null;

  constructor(private messageService: MessageService) {}

  onNuevaVisita() {
    this.tableVisitaComp.crearNuevaVisita();
  }

  // Método para verificar si el botón de nueva visita debe estar deshabilitado
  isNewVisitaButtonDisabled(): boolean {
    return this.tableVisitaComp ? this.tableVisitaComp.isAnyRowEditing() : false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: `Cargando datos para donante: ${this.codigoDonante}`,
        key: 'tr',
        life: 2000,
      });
    }
  }

  closeDialog() {
    this.visible = false;
    this.dialogClosed.emit();
  }

  onEyeClicked(visitaData: any) {
    this.selectedVisitaData = visitaData;
    this.secondaryDialogVisible = true;
  }

  onSecondaryDialogClosed() {
    this.secondaryDialogVisible = false;
    this.selectedVisitaData = null;
  }
}
