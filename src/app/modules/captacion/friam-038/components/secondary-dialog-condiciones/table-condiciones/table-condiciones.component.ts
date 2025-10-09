import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SecondaryDialogCondicionesService } from '../services/secondary-dialog-condiciones.service';
import type { CondicionData, RespuestaAPI } from '../../interfaces/pregunta.interface';
import type { ValidationResult } from '../../interfaces/validation.interface';

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
    private readonly secondaryDialogService: SecondaryDialogCondicionesService,
    private readonly messageService: MessageService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Solo observar cambios relevantes sin acciones adicionales
  }

  /**
   * Cargar preguntas desde la API
   */
  private cargarPreguntas(): void {
    this.loading = true;

    this.secondaryDialogService.getPreguntas().subscribe({
      next: (response) => {
        this.procesarRespuestaPreguntas(response);
      },
      error: (error) => {
        this.manejarErrorCargaPreguntas(error);
      }
    });
  }

  /**
   * Procesar respuesta de preguntas de la API
   */
  private procesarRespuestaPreguntas(response: any): void {
    if (response?.data) {
      this.condicionesData = response.data.map((pregunta: any) => ({
        id_pregunta: pregunta.id,
        pregunta: pregunta.pregunta,
        respuesta: undefined
      }));
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  /**
   * Manejar errores en carga de preguntas
   */
  private manejarErrorCargaPreguntas(error: any): void {
    console.error('Error al cargar preguntas:', error);
    this.loading = false;

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las preguntas del formulario',
      key: 'tr-secondary',
      life: 3000,
    });
  }

  /**
   * Cargar respuestas existentes en el componente
   */
  cargarRespuestasExistentes(respuestasMap: Map<number, number | null>): void {
    this.condicionesData.forEach(condicion => {
      if (respuestasMap.has(condicion.id_pregunta)) {
        condicion.respuesta = respuestasMap.get(condicion.id_pregunta);
      }
    });

    this.cdr.detectChanges();
  }

  /**
   * Actualizar respuesta de una pregunta específica
   */
  actualizarRespuesta(preguntaId: number, respuesta: number | null): void {
    if (this.modoSoloLectura) return;

    const condicion = this.condicionesData.find(c => c.id_pregunta === preguntaId);
    if (condicion) {
      condicion.respuesta = respuesta;
    }
  }

  /**
   * Validar que todas las condiciones tengan respuesta
   */
  validateCondiciones(): ValidationResult {
    if (this.modoSoloLectura) {
      return { isValid: true, message: '' };
    }

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

  /**
   * Obtener respuestas en formato para envío a API
   */
  getRespuestasParaAPI(): RespuestaAPI[] {
    return this.condicionesData.map(condicion => ({
      idPregunta: condicion.id_pregunta,
      respuesta: condicion.respuesta === undefined ? null : condicion.respuesta
    }));
  }

  /**
   * Obtener datos de condiciones para validación
   */
  getCondicionesData(): CondicionData[] {
    return this.condicionesData;
  }

  /**
   * Obtener estadísticas de respuestas
   */
  getEstadisticasRespuestas(): { completadas: number; total: number } {
    const completadas = this.condicionesData.filter(c => c.respuesta !== undefined).length;
    return {
      completadas,
      total: this.condicionesData.length
    };
  }
}
