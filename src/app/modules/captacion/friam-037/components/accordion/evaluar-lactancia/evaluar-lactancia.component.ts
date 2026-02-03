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
  @Input() readOnly: boolean = false;
  respuestasAux: RespuestasVisita | null = null;
  title: string = 'EVALUAR LACTANCIA MATERNA';
  subtitle: string = 'OBSERVACIÓN DEL AMAMANTAMIENTO';
  formData: Array<any> = [
    {
      title: 'Madre',
      questions: [
        [
          { question: 'Relajada y cómoda', answer: null },
          { question: 'Signos de enfermedad y/o malestar', answer: null }
        ],
        [
          { question: 'Cómoda', answer: null },
          { question: 'Tensa e incómoda', answer: null }
        ],
        [
          { question: 'Signos de vínculo madre-hijo', answer: null },
          { question: 'Sin contacto visual', answer: null }
        ]
      ]
    },
    {
      title: 'Bebé',
      questions: [
        [
          { question: 'Saludable', answer: null },
          { question: 'Enfermo, somnoliento, irritable', answer: null }
        ],
        [
          { question: 'Calmado y relajado', answer: null },
          { question: 'Inquieto o llorando', answer: null }
        ],
        [
          { question: 'Busca o hoza el pecho', answer: null },
          { question: 'No busca ni hoza el pecho', answer: null }
        ]
      ]
    },
    {
      title: 'Pechos',
      questions: [
        [
          { question: 'Sanos', answer: null },
          { question: 'Enrojecidos, edematizados y/o dolorosos', answer: null }
        ],
        [
          { question: 'Sin dolor ni malestar', answer: null },
          { question: 'Con dolor o malestar', answer: null }
        ],
        [
          { question: 'Protráctil', answer: null },
          { question: 'Plano o invertido', answer: null }
        ]
      ]
    },
    {
      title: 'Posición del bebé',
      questions: [
        [
          { question: 'Cabeza y cuerpo alineados', answer: null },
          { question: 'Cabeza y cuerpo del bebé torcidos', answer: null }
        ],
        [
          { question: 'Frente al pecho, nariz frente al pezón', answer: null },
          { question: 'Sin contacto cuerpo a cuerpo', answer: null }
        ],
        [
          { question: 'Todo el cuerpo sostenido', answer: null },
          { question: 'Sostenido por la cabeza y el cuello', answer: null }
        ],
        [
          { question: 'Se acerca con nariz al pezón', answer: null },
          { question: 'Se acerca con labio inferior al pezón', answer: null }
        ]
      ]
    },
    {
      title: 'Agarre al pecho',
      questions: [
        [
          { question: 'Boca bien abierta', answer: null },
          { question: 'Boca poco abierta', answer: null }
        ],
        [
          { question: 'Labio inferior volteado hacia afuera', answer: null },
          { question: 'Labio inferior volteado hacia adentro', answer: null }
        ],
        [
          { question: 'Mentón toca el pecho', answer: null },
          { question: 'Mentón no toca el pecho', answer: null }
        ]
      ]
    },
    {
      title: 'Succión',
      questions: [
        [
          { question: 'Lentas y profundas con pausas', answer: null },
          { question: 'Rápidas y superficiales', answer: null }
        ],
        [
          { question: 'Mejillas redondas', answer: null },
          { question: 'Mejillas tensas y hacia adentro', answer: null }
        ],
        [
          { question: 'Suelta el pecho al terminar', answer: null },
          { question: 'El pecho sale fácilmente', answer: null }
        ]
      ]
    },
    {
      title: 'Deglución',
      questions: [
        [
          { question: 'Se ve y se escucha deglutir', answer: null },
          { question: 'No se ve ni se escucha deglutir', answer: null }
        ],
        [
          { question: 'Lengua acanalada alrededor del pecho', answer: null },
          { question: 'Lengua plana o puntiaguda', answer: null }
        ]
      ]
    }
  ];
  aux: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.formatForm();
      this.formatQuestionsAnswers();
    }
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

  validateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.formData.forEach((category: any, categoryIndex: number) => {
      category.questions.forEach((group: any, questionIndex: number) => {
        if (group[0].answer === null || group[0].answer === undefined) {
          errors.push(`${category.title}: Pregunta ${questionIndex + 1} requiere una respuesta`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  getFormData() {
    const validation = this.validateForm();
    if (!validation.isValid) {
      throw new Error(`Evaluación de lactancia incompleta: ${validation.errors.join(', ')}`);
    }

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
