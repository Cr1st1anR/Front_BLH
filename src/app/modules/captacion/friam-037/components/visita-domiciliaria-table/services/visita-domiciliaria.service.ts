import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environments';
import { ApiResponse } from '../../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { BodyRespuestasVisita, BodyVisita } from '../../accordion/interfaces/descripcion-situacion.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitaDomiciliariaService {

  constructor(
    private http: HttpClient
  ) { }

  datos: Array<object> =
    [
      {
        id:1,
        title: "MADRE",
        questions: [
          [
            {
              question: "Se le ve relajada",
              answer: null
            },
            {
              question: "Se la ve enferma o deprimida",
              answer: null
            }
          ],
          [
            {
              question: "Está cómoda",
              answer: null
            },
            {
              question: "Esta tensa o incomoda",
              answer: null
            }
          ],
          [
            {
              question: "Está presente el vínculo afectivo madre/bebé",
              answer: null
            },
            {
              question: " No está presente el vínculo afectivo madre/bebé",
              answer: null
            }
          ]
        ]
      },
      {
        id:2,
        title: "BEBÉ",
        questions: [
          [
            {
              question: "Se lo ve saludable y bien nutrido ",
              answer: null
            },
            {
              question: "Se lo ve somnoliento o enfermo",
              answer: null
            }
          ],
          [
            {
              question: "Está calmado y relajado",
              answer: null
            },
            {
              question: "Está inquieto o llorando",
              answer: null
            }
          ],
          [
            {
              question: " Busca el pecho si tiene hambre",
              answer: null
            },
            {
              question: "No busca el pecho",
              answer: null
            }
          ]
        ]
      },
      {
        id:3,
        title: "PECHOS",
        questions: [
          [
            {
              question: "Están sanos",
              answer: null
            },
            {
              question: "Estan enrojecidos o hinchados",
              answer: null
            }
          ],
          [
            {
              question: "No presenta dolor o molestias en el pezón",
              answer: null
            },
            {
              question: "Presentan dolor o molestia en los pezones",
              answer: null
            }
          ],
          [
            {
              question: "Pezón protuye es protáctil",
              answer: null
            },
            {
              question: "Pezón plano no es retráctil",
              answer: null
            }
          ]
        ]
      },
      {
        id:4,
        title: "POSICION DEL BEBÉ DURANTE LA LACTANCIA",
        questions: [
          [
            {
              question: "La cabeza y el cuerpo estan alineados",
              answer: null
            },
            {
              question: "El cuello y lal cabeza estan torcidos",
              answer: null
            }
          ],
          [
            {
              question: "Esta en contacto con el cuerpo de la madre",
              answer: null
            },
            {
              question: "El bebe no esta en contacto ",
              answer: null
            }
          ],
          [
            {
              question: "Todo el cuerpo del bebe esta sostenido",
              answer: null
            },
            {
              question: "Solo la cabeza y el cuello estan sostenidos",
              answer: null
            }
          ],
          [
            {
              question: "Aproximación al pecho, nariz al pezón",
              answer: null
            },
            {
              question: "Aproximación al pecho, labio inferior/menton al pezón",
              answer: null
            }
          ]
        ]
      },
      {
        id:5,
        title:"AGARRE DEL PECHO",
        questions:[
          [
            {
              question: "La boca del bebé esta bien abierta",
              answer: null
            },
            {
              question: "La boca no esta muy abierta",
              answer: null
            }
          ],
          [
            {
              question: "Labio inferior hacia afuera ",
              answer: null
            },
            {
              question: "Labios hacia adentro o hacia adelante",
              answer: null
            }
          ],
          [
            {
              question: "El mentón y la nariz estan cerca del seno",
              answer: null
            },
            {
              question: "El mentón y la nariz estan lejos del seno",
              answer: null
            }
          ]
        ]
      },
      {
        id:6,
        title: "SUCCIÓN",
        questions: [
          [
            {
              question: "Succiones lentas, profundas, con pausas",
              answer: null
            },
            {
              question: "Succiones rápidas y superficiales",
              answer: null
            }
          ],
          [
            {
              question: "Las mejillas del bebe estan redondeadas",
              answer: null
            },
            {
              question: "Mejillas no se inflan",
              answer: null
            }
          ],
          [
            {
              question: "Vaciamiento del seno ",
              answer: null
            },
            {
              question: "Madre retira al bebé del pecho y no hay vaciamiento",
              answer: null
            }
          ]
        ]
      },
      {
        id:7,
        title: "DEGLUCIÓN",
        questions: [
          [
            {
              question: "Se escucha y se siente que traga",
              answer: null
            },
            {
              question: "No se escucha que traga",
              answer: null
            }
          ],
          [
            {
              question: "La lengua esta acanalada",
              answer: null
            },
            {
              question: "La lengua esta plana o la protruye",
              answer: null
            }
          ]
        ]
      }
    ];

  getDataVisitaDomiciliaria(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/getAllMadresPotenciales`;
    return this.http.get<ApiResponse>(url);
  }

  getVisitaMadre(id: string): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetVisitaMadre/${id}`;
    return this.http.get<ApiResponse>(url);
  }

  getPreguntas(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetPreguntasVisitaMadre`;
    return this.http.get<ApiResponse>(url);
  }

  getCategorias(): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/GetCategoriasVisitaMadre`;
    return this.http.get<ApiResponse>(url);
  }

  postDataVisitaMadres(body: BodyVisita): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/CreateVisitaMadre`;
    return this.http.post<ApiResponse>(url, body);
  }

  postRespuestasVisita(body: BodyRespuestasVisita): Observable<ApiResponse> {
    const url = `${environment.ApiBLH}/SaveRespuestasVisitaMadre`;
    return this.http.post<ApiResponse>(url, body);
  }

  loadQuestions() {
    return of(this.datos);
  }
}
