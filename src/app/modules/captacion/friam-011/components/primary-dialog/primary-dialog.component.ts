import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableTemperaturaComponent } from './table-temperatura/table-temperatura.component';
import { TableCasaComponent } from './table-casa/table-casa.component';
import { SecondaryDialogComponent } from '../secondary-dialog/secondary-dialog.component';
import { rutaRecoleccion } from '../table-list/interfaces/ruta-recoleccion';
import { casasVisitaData } from './interfaces/primaryDialog.interface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'primary-dialog',
  imports: [
    DialogModule,
    TableTemperaturaComponent,
    TableCasaComponent,
    SecondaryDialogComponent,
    ProgressSpinnerModule,
    ToastModule,
  ],
  templateUrl: './primary-dialog.component.html',
  styleUrl: './primary-dialog.component.scss',
  providers: [MessageService],
})
export class PrimaryDialogComponent implements OnChanges {
  @Input() rowDataDialog: rutaRecoleccion | null = null;
  @Output() dialogClosed = new EventEmitter<void>();
  @ViewChild(TableCasaComponent) tableMain!: TableCasaComponent;

  loading: boolean = false;
  dialogVisible: boolean = false;
  dataRutaRecoleccion: any = null;
  secondaryDialogVisible: boolean = false;
  selectedCasaNo: casasVisitaData | null = null;

  hasTemperaturaData: boolean | null = null;
  hasCasaData: boolean | null = null;
  private hasShownSuccessAlert: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowDataDialog'] && changes['rowDataDialog'].currentValue) {
      this.dataRutaRecoleccion = changes['rowDataDialog'].currentValue;
      this.dialogVisible = true;
      this.hasTemperaturaData = null;
      this.hasCasaData = null;
      this.hasShownSuccessAlert = false;
    }
  }

  onClosedDialog() {
    this.selectedCasaNo = null;
    if (this.tableMain) {
      this.tableMain.limpiarSeleccion();
    }
  }

  openDialogFrascosL(data: casasVisitaData) {
    this.selectedCasaNo = data;
  }

  onClosedDialogPrimary() {
    this.dialogClosed.emit();
    this.dialogVisible = false;
  }

  onTemperaturaDataLoaded(hasData: boolean) {
    this.hasTemperaturaData = hasData;
    this.checkSuccessAlert();
    this.checkMadresDonantesAlert();
  }

  onCasaDataLoaded(hasData: boolean) {
    this.hasCasaData = hasData;
    this.checkSuccessAlert();
    this.checkMadresDonantesAlert();
  }

  private checkSuccessAlert() {
    if (
      !this.hasShownSuccessAlert &&
      ((this.hasTemperaturaData === true && this.hasCasaData !== false) ||
        (this.hasCasaData === true && this.hasTemperaturaData !== false))
    ) {
      this.hasShownSuccessAlert = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos cargados para la ruta seleccionada',
        key: 'tr',
        life: 3000,
      });
    }
  }

  private checkMadresDonantesAlert() {
    if (this.hasTemperaturaData === false && this.hasCasaData === false) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'No hay datos para la ruta seleccionada',
        key: 'tr',
        life: 3000,
      });
    }
  }
}
