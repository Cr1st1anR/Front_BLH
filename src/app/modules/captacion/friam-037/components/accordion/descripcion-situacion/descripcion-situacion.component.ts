import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';
import type { BodyRespuestasVisita, CategoriasResponse, Pregunta, PreguntasResponse, Respuesta, RespuestasVisita } from '../interfaces/descripcion-situacion.interface';

@Component({
  selector: 'descripcion-situacion',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './descripcion-situacion.component.html',
  styleUrl: './descripcion-situacion.component.scss',
})
export class DescripcionSituacionComponent implements OnChanges {

  @Input() data: RespuestasVisita | null = null;
  @Input() respuestasDescripcion: PreguntasResponse[][] | null = null;
  @Input() preguntas: PreguntasResponse[] = [];
  @Input() categorias: CategoriasResponse[] = [];
  @Input() readOnly: boolean = false;

  newRegister: object = {};
  respuestas: PreguntasResponse[][] = [];
  newPreguntas: Array<PreguntasResponse[]> = [];

  ngOnChanges(changes: SimpleChanges) {
    if (this.preguntas && this.preguntas.length) {
      this.formQuestions();
    }

    if (this.respuestasDescripcion && this.respuestasDescripcion.length > 0) {
      this.formAnswers();
    } else {
      const flat = (this.preguntas && this.preguntas.length) ? this.preguntas : [];
      this.respuestas = this.formatData(flat);
    }
  }

  formQuestions() {
    const aux = this.preguntas ? JSON.parse(JSON.stringify(this.preguntas)) : [];
    this.newPreguntas = [];
    this.newPreguntas[0] = aux.filter((p: any) => p.clasificacion === 1);
    this.newPreguntas[1] = aux.filter((p: any) => p.clasificacion === 2);
  }

  formAnswers() {
    this.respuestas = this.respuestasDescripcion!
    console.log(this.respuestas);
  }

  getFormData() {

    let dataAux : PreguntasResponse[] = [...this.respuestas[0], ...this.respuestas[1]];
    let newData = dataAux.map((d: PreguntasResponse) => {
      return {
        pregunta:d.id,
        respuesta: d.respuesta,
        visitaMadre: this.data?.id || null
      }
    });
    return newData as BodyRespuestasVisita[];
  }

  formatData(data:PreguntasResponse[]){
    let dataAux = [data.filter((d:any) => d.clasificacion === 1), data.filter((d:any) => d.clasificacion === 2)];
    return dataAux;
  }
}
