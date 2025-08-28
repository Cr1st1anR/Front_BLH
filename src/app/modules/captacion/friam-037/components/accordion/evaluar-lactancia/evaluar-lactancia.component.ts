import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';
import type { EvaluarLactanciaData } from '../interfaces/evaluar-lactancia.interface';
import { RespuestasVisita } from '../interfaces/descripcion-situacion.interface';
import { VisitaDomiciliariaService } from '../../visita-domiciliaria-table/services/visita-domiciliaria.service';

@Component({
  selector: 'evaluar-lactancia',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './evaluar-lactancia.component.html',
  styleUrl: './evaluar-lactancia.component.scss',
})
export class EvaluarLactanciaComponent implements OnChanges {

  @Input() data: RespuestasVisita | null = null;
  respuestasAux: RespuestasVisita | null = null;
  title: string = 'EVALUAR LACTANCIA MATERNA';
  subtitle: string = 'OBSERVACIÓN DEL AMAMANTAMIENTO';
  formData: Array<any> = [];
  aux: any = {};

  constructor(
    private _visitaDomiciliariaService: VisitaDomiciliariaService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data'].currentValue != null) {
      this.getQuestions();
      this.formatForm();
    }
  }

  getQuestions() {
    this._visitaDomiciliariaService.loadQuestions().subscribe({
      next: (questions) => {
        this.formData = questions;
        this.formatQuestionsAnswers();
      }
    });
  }

  formatForm() {
    this.respuestasAux = JSON.parse(JSON.stringify(this.data!.respuestas));
  }

  formatQuestionsAnswers() {
    const aux = this.data!.evaluacionLactancia;
    const respuestas = [
      { respuestas: aux.madre.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.bebe.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.pechos.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.posicionBebe.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.agarrePecho.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.succion.split(',').map((x: string) => Number(x)) },
      { respuestas: aux.deglucion.split(',').map((x: string) => Number(x)) }
    ];

    this.formData.map((item, i) => {
      const res = respuestas[i].respuestas;
      item.questions.map((group: any, j: number) => {
        const resGroup = res[j];
        if (resGroup === 0) {
          group[0].answer = 0;
          group[1].answer = 0;
        } else {
          group[0].answer = 1;
          group[1].answer = 1;
        }


      });
    });
  }

  getFormData() {
    return this.formData;
  }
}
