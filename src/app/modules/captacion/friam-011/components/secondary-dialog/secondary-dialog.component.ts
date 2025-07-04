import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableFrascoComponent } from './table-frasco/table-frasco.component';
import { NewRegisterFrascoComponent } from './new-register-frasco/new-register-frasco.component';
import { casasVisitaData } from '../primary-dialog/interfaces/primaryDialog.interface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'secondary-dialog',
  imports: [
    DialogModule,
    TableFrascoComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './secondary-dialog.component.html',
  styleUrl: './secondary-dialog.component.scss',
  providers: [MessageService],
})
export class SecondaryDialogComponent implements OnChanges {
  @Input() casaNo: casasVisitaData | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  loading: boolean = false;

  dialogVisible: boolean = false;

  frascosData: casasVisitaData | null = null;
  editingFrascoRow: any = null;
  clonedFrascoRow: any = null;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['casaNo'] && this.casaNo !== null) {
      this.frascosData = changes['casaNo'].currentValue;
      this.dialogVisible = true;

      this.loading = true;

      setTimeout(() => {
        this.loading = false;

        if (this.frascosData && this.frascosData.nombre) {
          this.messageService.add({
            severity: 'success',
            summary: 'Datos cargados correctamente',
            detail: `Información de frascos cargada para: ${this.frascosData.nombre}`,
            key: 'tr',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al cargar datos',
            detail:
              'No se pudieron cargar los datos de frascos. Inténtelo de nuevo.',
            key: 'tr',
            life: 2000,
          });
        }
      }, 1200);
    }
  }

  cerrarDialogo() {
    this.dialogVisible = false;
    this.casaNo = null;
    this.dialogClosed.emit();
  }
}
