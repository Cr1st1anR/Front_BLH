import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import type { ExamenesLaboratorioData } from '../interfaces/examenes-laboratorio.interface';

@Component({
  selector: 'examenes-laboratorio',
  imports: [
    FormsModule,
    AccordionModule,
    InputTextModule,
    DatePickerModule,
    RadioButton,
    FileUpload,
    ToastModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './examenes-laboratorio.component.html',
  styleUrl: './examenes-laboratorio.component.scss',
  providers: [MessageService],
})
export class ExamenesLaboratorioComponent implements ExamenesLaboratorioData {
  fechaRegistroLab: Date | null = null;
  vdrl: string = '';
  fechaVencimientoVdrl: Date | null = null;
  hbsag: string = '';
  fechaVencimientoHbsag: Date | null = null;
  hiv: string = '';
  fechaVencimientoHiv: Date | null = null;
  hemoglobina: string = '';
  hematocrito: string = '';
  transfusiones: number = 0;
  enfermedadesGestacion: string = '';
  fuma: number = 0;
  alcohol: number = 0;

  fileNames = { vdrl: '', hbsag: '', hiv: '' };
  files: { [key: string]: File | null } = {
    vdrl: null,
    hbsag: null,
    hiv: null,
  };

  uploading: { [key: string]: boolean } = {
    vdrl: false,
    hbsag: false,
    hiv: false,
  };

  constructor(private messageService: MessageService) {}

  onFileSelect(event: any, tipo: 'vdrl' | 'hbsag' | 'hiv') {
    const file = event.files?.[0];
    this.fileNames[tipo] = file ? file.name : '';
    this.files[tipo] = file || null;
  }

  onUpload(tipo: 'vdrl' | 'hbsag' | 'hiv') {
    if (this.files[tipo]) {
      this.uploading[tipo] = true;

      setTimeout(() => {
        this.uploading[tipo] = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Archivo de ${tipo.toUpperCase()} subido correctamente`,
          key: 'tr',
          life: 2500,
        });

        //  logica de subida de archivos
        // llamar a un servicio
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un archivo antes de subir',
        key: 'tr',
        life: 2500,
      });
    }
  }

  getFormData() {
    return {
      fechaRegistroLab: this.fechaRegistroLab,
      vdrl: this.vdrl,
      fechaVencimientoVdrl: this.fechaVencimientoVdrl,
      hbsag: this.hbsag,
      fechaVencimientoHbsag: this.fechaVencimientoHbsag,
      hiv: this.hiv,
      fechaVencimientoHiv: this.fechaVencimientoHiv,
      hemoglobina: this.hemoglobina,
      hematocrito: this.hematocrito,
      transfusiones: this.transfusiones,
      enfermedadesGestacion: this.enfermedadesGestacion,
      fuma: this.fuma,
      alcohol: this.alcohol,
    };
  }
}
