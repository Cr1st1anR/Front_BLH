import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SecondaryDialogCondicionesService } from '../services/secondary-dialog-condiciones.service';

interface CondicionData {
  id_pregunta: number;
  pregunta: string;
  respuesta: number | null | undefined;
}

@Component({
  selector: 'table-condiciones',
  imports: [CommonModule, FormsModule, ToastModule, ProgressSpinnerModule],
  templateUrl: './table-condiciones.component.html',
  styleUrl: './table-condiciones.component.scss'
})
export class TableCondicionesComponent implements OnInit, OnChanges {
  @Input() visitaData: any = null;
  @Input() modoSoloLectura: boolean = false;

  condicionesData: CondicionData[] = [];
  loading: boolean = false;

  constructor(
    private secondaryDialogService: SecondaryDialogCondicionesService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // No recargar preguntas en cambios
  }

  cargarPreguntas(): void {
    this.loading = true;
    this.secondaryDialogService.getPreguntas().subscribe({
      next: (response) => {
        console.log('✅ Preguntas cargadas:', response);

        if (response?.data) {
          this.condicionesData = response.data.map((pregunta: any) => ({
            id_pregunta: pregunta.id,
            pregunta: pregunta.pregunta,
            respuesta: undefined
          }));

          console.log('✅ Condiciones inicializadas:', this.condicionesData);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar preguntas:', error);
        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las preguntas del formulario',
          key: 'tr-secondary',
          life: 3000,
        });
      }
    });
  }

  cargarRespuestasExistentes(respuestasMap: Map<number, number | null>): void {
    console.log('🔄 Aplicando respuestas existentes:', respuestasMap);

    this.condicionesData.forEach(condicion => {
      if (respuestasMap.has(condicion.id_pregunta)) {
        const respuesta = respuestasMap.get(condicion.id_pregunta);
        condicion.respuesta = respuesta;
        console.log(`✅ Cargada respuesta para pregunta ${condicion.id_pregunta}: ${respuesta}`);
      }
    });

    this.cdr.detectChanges();
  }

  actualizarRespuesta(preguntaId: number, respuesta: number | null): void {
    if (this.modoSoloLectura) return;

    const condicion = this.condicionesData.find(c => c.id_pregunta === preguntaId);
    if (condicion) {
      condicion.respuesta = respuesta;
      console.log(`✅ Respuesta actualizada: Pregunta ${preguntaId} = ${respuesta}`);
    }
  }

  validateCondiciones(): { isValid: boolean; message: string } {
    if (this.modoSoloLectura) return { isValid: true, message: '' };

    const condicionesSinResponder = this.condicionesData.filter(
      (c) => c.respuesta === undefined
    );

    if (condicionesSinResponder.length > 0) {
      return {
        isValid: false,
        message: `Faltan ${condicionesSinResponder.length} condiciones por evaluar`,
      };
    }

    return { isValid: true, message: '' };
  }

  getRespuestasParaAPI(): Array<{ idPregunta: number; respuesta: number | null }> {
    return this.condicionesData.map(condicion => ({
      idPregunta: condicion.id_pregunta,
      respuesta: condicion.respuesta === undefined ? null : condicion.respuesta
    }));
  }

  getCondicionesData(): Array<{ id_pregunta: number; respuesta: number | null | undefined }> {
    return this.condicionesData.map(condicion => ({
      id_pregunta: condicion.id_pregunta,
      respuesta: condicion.respuesta
    }));
  }
}
