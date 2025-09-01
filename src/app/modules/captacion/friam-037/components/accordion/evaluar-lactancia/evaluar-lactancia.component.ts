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
export class EvaluarLactanciaComponent implements OnChanges, OnInit {

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

  ngOnInit(): void {
    this.getQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.formatForm();
      this.formatQuestionsAnswers();
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
    if (this.data && this.data.respuestas) {
      this.respuestasAux = JSON.parse(JSON.stringify(this.data.respuestas));
    } else {
      this.respuestasAux = null;
    }
  }

  formatQuestionsAnswers() {
    if (!this.data || !this.data.evaluacionLactancia) {
      this.formData.forEach((item: any) =>
        item.questions.forEach((group: any) => {
          group[0].answer = null;
          group[1].answer = null;
        })
      );
      return;
    }

    const aux = this.data.evaluacionLactancia;
    const parse = (s: string) => {
      const t = (s ?? '').toString().trim();
      return t === '' ? null : Number(t);
    };
    const respuestas = [
      { respuestas: aux.madre.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.bebe.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.pechos.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.posicionBebe.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.agarrePecho.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.succion.split(',').map((x: string) => parse(x)) },
      { respuestas: aux.deglucion.split(',').map((x: string) => parse(x)) }
    ];

    this.formData.forEach((item: any, i: number) => {
      const res = respuestas[i].respuestas;
      item.questions.forEach((group: any, j: number) => {
        const resGroup = res[j];
        if (resGroup === null || resGroup === undefined) {
          group[0].answer = null;
          group[1].answer = null;
        } else if (resGroup === 0) {
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
    const evaluacionLactancia = {
      madre: this.generateAnswerString(0),
      bebe: this.generateAnswerString(1),
      pechos: this.generateAnswerString(2),
      posicionBebe: this.generateAnswerString(3),
      agarrePecho: this.generateAnswerString(4),
      succion: this.generateAnswerString(5),
      deglucion: this.generateAnswerString(6)
    };

    return evaluacionLactancia;
  }

  private generateAnswerString(categoryIndex: number): string {
    if (!this.formData[categoryIndex]) {
      return '';
    }

    const answers: string[] = [];

    this.formData[categoryIndex].questions.forEach((group: any, questionIndex: number) => {
      if (group[0].answer === 0) {
        answers.push('0');
      }
      else if (group[0].answer === 1) {
        answers.push('1');
      }
      else {
        answers.push('');
      }
    });

    return answers.join(',');
  }
}
