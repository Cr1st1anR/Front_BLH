import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';
import type { CategoriasResponse, PreguntasResponse, Respuestas, RespuestasVisita } from '../interfaces/descripcion-situacion.interface';

@Component({
  selector: 'descripcion-situacion',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './descripcion-situacion.component.html',
  styleUrl: './descripcion-situacion.component.scss',
})
export class DescripcionSituacionComponent implements OnChanges {

  @Input() data: RespuestasVisita | null = null;
  @Input() preguntas: PreguntasResponse[] = [];
  @Input() categorias: CategoriasResponse[] = [];

  newRegister: object = {};
  respuestas: Respuestas[] = [];
  newPreguntas: Array<PreguntasResponse[]> = [];

  ngOnChanges(changes: SimpleChanges) {
    if (this.preguntas && this.preguntas.length) {
      this.formQuestions();
    }

    if (this.data && this.data.respuestas && this.data.respuestas.length) {
      this.formAnswers();
    } else {
      const flat = (this.preguntas && this.preguntas.length) ? this.preguntas : [];
      this.respuestas = flat.map((p) => ({ id: p.id, respuesta: null }));
    }
  }

  formQuestions() {
    const aux = this.preguntas ? JSON.parse(JSON.stringify(this.preguntas)) : [];
    this.newPreguntas = [];
    this.newPreguntas[0] = aux.filter((p: any) => p.clasificacion === 1);
    this.newPreguntas[1] = aux.filter((p: any) => p.clasificacion === 2);
  }

  formAnswers() {
    this.respuestas = this.data!.respuestas || [];
    console.log(this.respuestas);
  }

  getFormData() {
    return this.respuestas;
  }
}
