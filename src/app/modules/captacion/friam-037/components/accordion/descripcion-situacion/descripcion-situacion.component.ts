import { Component, Input, input, OnChanges } from '@angular/core';
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
export class DescripcionSituacionComponent implements OnChanges{

  @Input() data: RespuestasVisita | null = null;
  @Input() preguntas: PreguntasResponse[] = [];
  @Input() categorias: CategoriasResponse[] = [];

  newRegister: object = {};
  respuestas: Respuestas[] = [];
  newPreguntas: Array<PreguntasResponse[]> = [];

  ngOnChanges() {
    if (this.data) {
      this.formQuestions();
      this.formAnswers();
    }
  }

  formQuestions(){
    const aux = JSON.parse(JSON.stringify(this.preguntas));
    this.preguntas = [];
    this.newPreguntas[0] = aux.slice(0,7);
    this.newPreguntas[1] = aux.slice(8,15);
  }

  formAnswers(){
    const aux = JSON.parse(JSON.stringify(this.data));
    this.respuestas = this.data!.respuestas;
    console.log(this.respuestas);
    
  }

  getFormData() {
    return this.respuestas;
  }
}
