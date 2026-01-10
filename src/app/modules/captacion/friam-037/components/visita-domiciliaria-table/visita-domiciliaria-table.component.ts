import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VisitaMadresResponse } from './interfaces/visita-domiciliaria';
import { VisitaDomiciliariaService } from './services/visita-domiciliaria.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { jsPDF } from 'jspdf';
import { PdfFriam037Component } from '../../../../../utils/pdf-friam-037/pdf-friam-037.component';

@Component({
  selector: 'visita-domiciliaria-table',
  imports: [
    TableModule,
    CommonModule,
    HeaderComponent,
    ProgressSpinnerModule,
    ToastModule,
    ButtonModule,
    PdfFriam037Component
  ],
  templateUrl: './visita-domiciliaria-table.component.html',
  styleUrl: './visita-domiciliaria-table.component.scss',
  providers: [VisitaDomiciliariaService, MessageService],
})
export class VisitaDomiciliariaTableComponent implements OnInit {
  @ViewChild('pdfComponent') pdfComponent?: PdfFriam037Component;

  loading: boolean = false;
  showPdf = false;
  generatingPdf = false;
  currentPdfRowId: number | null = null;

  pdfPayload: {
    datosPersonales: any;
    preguntasCondicionesFisicas: any[];
    preguntasCondicionesPersonales: any[];
    evaluacionLactancia: any;
    datosAdicionales: any;
    fechaVisita: any;
  } | null = null;

  headersTableVisitaDomiciliaria: any[] = [
    {
      header: 'FECHA DE VISITA',
      field: 'fecha_visita',
      width: '200px',
      tipo: Date,
    },
    { header: 'NOMBRES', field: 'nombre', width: '200px', tipo: 'text' },
    { header: 'APELLIDOS', field: 'apellido', width: '200px', tipo: 'text' },
    { header: 'NO. DOC', field: 'documento', width: '200px', tipo: 'number' },
    { header: 'EDAD', field: 'edad', width: '200px', tipo: 'number' },
    { header: 'DIRECCION', field: 'direccion', width: '200px', tipo: 'text' },
    { header: 'CELULAR', field: 'celular', width: '200px', tipo: 'number' },
    { header: 'MUNICIPIO', field: 'ciudad', width: '200px', tipo: 'text' },
    { header: 'REPORTE', field: 'reporte', width: '150px', tipo: 'action' },
  ];

  dataTable: VisitaMadresResponse[] = [];

  constructor(
    private visitaDomiciliariaService: VisitaDomiciliariaService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.visitaDomiciliariaService.getDataVisitaDomiciliaria().subscribe({
      next: (data) => {
        this.dataTable = this.formatData(data.data);
        this.loading = false;
        if (data && data.data.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Datos cargados correctamente',
            key: 'tr',
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No hay datos para mostrar',
            key: 'tr',
            life: 2000,
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Hubo un error al cargar los datos',
          key: 'tr',
          life: 2000,
        });
      },
    });
  }

  descargarPDF(rowData: any): void {
    if (this.generatingPdf) return;
    this.generatingPdf = true;
    this.currentPdfRowId = rowData.id;

    this.messageService.add({
      severity: 'info',
      summary: 'Generando PDF',
      detail: `Generando reporte para ${rowData.nombre} ${rowData.apellido}`,
      key: 'tr',
      life: 2000,
    });

    this.visitaDomiciliariaService.getVisitaMadre(rowData.id.toString()).subscribe({
      next: (response: any) => {
        if (!response?.data) {
          this.generatingPdf = false;
          this.currentPdfRowId = null;
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Datos incompletos para generar PDF',
            key: 'tr',
            life: 2500,
          });
          return;
        }

        const visitaData = response.data;

        if (!this.visitaCompleta(visitaData)) {
          this.generatingPdf = false;
          this.currentPdfRowId = null;
          this.messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Datos incompletos para generar PDF',
            key: 'tr',
            life: 2500,
          });
          return;
        }

        this.pdfPayload = this.mapResponseToPdfPayload(visitaData, rowData);
        this.showPdf = true;

        setTimeout(() => this.buildPdf(rowData), 400);
      },
      error: () => {
        this.generatingPdf = false;
        this.currentPdfRowId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener la información para el PDF',
          key: 'tr',
          life: 3000,
        });
      },
    });
  }

  private visitaCompleta(visitaData: any): boolean {
    const respuestasOk =
      Array.isArray(visitaData.respuestas) &&
      visitaData.respuestas.length >= 16;

    const evaluacionOk = !!visitaData.evaluacionLactancia;

    return respuestasOk && evaluacionOk;
  }

  private buildPdf(rowData: any) {
    const el = this.pdfComponent?.getNativeElement();
    if (!el) {
      this.generatingPdf = false;
      this.currentPdfRowId = null;
      return;
    }

    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(el, {
      margin: [15, 15, 15, 15],
      autoPaging: 'text',
      html2canvas: {
        scale: 0.72,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      callback: (doc: jsPDF) => {
        try {
          const expectedPages = el.querySelectorAll('.page').length;
          const totalPages = (doc as any).getNumberOfPages();
          if (totalPages > expectedPages) {
            for (let p = totalPages; p > expectedPages; p--) {
              (doc as any).deletePage(p);
            }
          }
        } catch (e) {

        }

        const fileName = `FRIAM037_${rowData.documento}.pdf`;
        doc.save(fileName);

        this.generatingPdf = false;
        this.currentPdfRowId = null;
        this.showPdf = false;
        this.pdfPayload = null;

        this.messageService.add({
          severity: 'success',
          summary: 'PDF',
          detail: 'PDF generado correctamente',
          key: 'tr',
          life: 1800,
        });
      },
    });
  }

  private mapResponseToPdfPayload(visitaData: any, rowData: any) {
    const datosPersonales = {
      nombre: rowData.nombre,
      apellido: rowData.apellido,
      documento: rowData.documento,
      edad: rowData.edad,
      direccion: rowData.direccion,
      celular: rowData.celular,
      ciudad: rowData.ciudad
    };

    const fechaVisita = this.formatDateForPdf(rowData.fecha_visita);

    const preguntasCondicionesFisicas = this.mapRespuestasToPreguntas(
      visitaData.respuestas,
      1, 6
    );

    const preguntasCondicionesPersonales = this.mapRespuestasToPreguntas(
      visitaData.respuestas,
      7, 16
    );

    const evaluacionLactancia = this.mapEvaluacionLactancia(visitaData.evaluacionLactancia);

    const datosAdicionales = {
      observaciones: visitaData.observaciones,
      recomendaciones: visitaData.recomendaciones,
      donanteEfectiva: visitaData.donante_efectiva,
      firmaUsuaria: visitaData.firmaUsuario,
      firmaEvaluador: visitaData.firmaEvaluador
    };

    return {
      datosPersonales,
      preguntasCondicionesFisicas,
      preguntasCondicionesPersonales,
      evaluacionLactancia,
      datosAdicionales,
      fechaVisita
    };
  }

  private formatDateForPdf(fechaString: string) {
    try {
      const fecha = new Date(fechaString);
      return {
        day: fecha.getDate().toString().padStart(2, '0'),
        month: fecha.toLocaleDateString('es-ES', { month: 'long' }),
        year: fecha.getFullYear().toString()
      };
    } catch (error) {
      return { day: '', month: '', year: '' };
    }
  }

  private mapRespuestasToPreguntas(respuestas: any[], idInicio: number, idFin: number) {
    const preguntasTexto = {
      1: '¿Cuenta con un espacio adecuado e higiénico para la recolección de leche humana?',
      2: '¿El espacio se encuentra libre de vectores?',
      3: '¿El espacio se encuentra libre de posibles contaminantes: detergentes, fungicidas, jabones, Etc.?',
      4: '¿El espacio para la recolección se encuentra limpio?',
      5: '¿La posible donante cuenta con lavamanos?',
      6: '¿Cuenta con sistema de refrigeración?',
      7: '¿Posible donante con excedente de leche humana?',
      8: '¿Se evidencia adecuada higiene de la donante?',
      9: '¿La posible donante se encuentra en buenas condiciones de salud y nutricional?',
      10: '¿El hijo o hija de la posible donante se encuentra en buenas condiciones de salud?',
      11: '¿Cuenta con exámenes de Laboratorio negativos para VIH, Serología y Hepatitis B?',
      12: '¿Se ha realizado tatuajes durante el último año?',
      13: '¿Ha recibido transfusiones sanguíneas durante el último año?',
      14: '¿Toma algún medicamento?',
      15: '¿Consume sustancias psicoactivas, alcohol o más de cinco (5) cigarrillo al día?',
      16: '¿La posible donante manifiesta utilizar recolectores para la leche humana?'
    };

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return Array.from({ length: idFin - idInicio + 1 }, (_, k) => ({
        pregunta: preguntasTexto[idInicio + k as keyof typeof preguntasTexto],
        respuesta: null
      }));
    }

    const minId = Math.min(...respuestas.map(r => r.id));
    let offset = 0;
    if (minId !== idInicio) {
      const esperado = idFin - idInicio + 1;
      const candidatos = respuestas.filter(r => r.id >= minId).length;
      if (candidatos >= esperado) {
        offset = minId - idInicio;
      }
    }

    const resultado: any[] = [];
    for (let i = idInicio; i <= idFin; i++) {
      const resp = respuestas.find(r => r.id === i + offset);
      resultado.push({
        pregunta: preguntasTexto[i as keyof typeof preguntasTexto],
        respuesta: resp ? resp.respuesta : null
      });
    }
    return resultado;
  }

  private mapEvaluacionLactancia(evaluacion: any) {
    if (!evaluacion) return {};

    const madre = evaluacion.madre ? evaluacion.madre.split(',').map((v: string) => parseInt(v)) : [];
    const bebe = evaluacion.bebe ? evaluacion.bebe.split(',').map((v: string) => parseInt(v)) : [];
    const pechos = evaluacion.pechos ? evaluacion.pechos.split(',').map((v: string) => parseInt(v)) : [];
    const posicionBebe = evaluacion.posicionBebe ? evaluacion.posicionBebe.split(',').map((v: string) => parseInt(v)) : [];
    const agarrePecho = evaluacion.agarrePecho ? evaluacion.agarrePecho.split(',').map((v: string) => parseInt(v)) : [];
    const succion = evaluacion.succion ? evaluacion.succion.split(',').map((v: string) => parseInt(v)) : [];
    const deglucion = evaluacion.deglucion ? evaluacion.deglucion.split(',').map((v: string) => parseInt(v)) : [];

    return {
      madre_relajada: madre[0] === 1,
      madre_enferma: madre[0] === 0,
      madre_comoda: madre[1] === 1,
      madre_tensa: madre[1] === 0,
      madre_vinculo_presente: madre[2] === 1,
      madre_vinculo_ausente: madre[2] === 0,

      bebe_saludable: bebe[0] === 1,
      bebe_somnoliento: bebe[0] === 0,
      bebe_calmado: bebe[1] === 1,
      bebe_inquieto: bebe[1] === 0,
      bebe_busca_pecho: bebe[2] === 1,
      bebe_no_busca_pecho: bebe[2] === 0,

      pechos_sanos: pechos[0] === 1,
      pechos_enrojecidos: pechos[0] === 0,
      pechos_sin_dolor: pechos[1] === 1,
      pechos_con_dolor: pechos[1] === 0,
      pezon_protactil: pechos[2] === 1,
      pezon_plano: pechos[2] === 0,

      posicion_alineado: posicionBebe[0] === 1,
      posicion_torcido: posicionBebe[0] === 0,
      posicion_contacto: posicionBebe[1] === 1,
      posicion_sin_contacto: posicionBebe[1] === 0,
      posicion_sostenido: posicionBebe[2] === 1,
      posicion_cabeza_cuello: posicionBebe[2] === 0,
      posicion_nariz_pezon: posicionBebe[3] === 1,
      posicion_labio_pezon: posicionBebe[3] === 0,

      agarre_boca_abierta: agarrePecho[0] === 1,
      agarre_boca_cerrada: agarrePecho[0] === 0,
      agarre_labio_afuera: agarrePecho[1] === 1,
      agarre_labio_adentro: agarrePecho[1] === 0,
      agarre_menton_cerca: agarrePecho[2] === 1,
      agarre_menton_lejos: agarrePecho[2] === 0,

      succion_lenta: succion[0] === 1,
      succion_rapida: succion[0] === 0,
      succion_mejillas_redondas: succion[1] === 1,
      succion_mejillas_no_inflan: succion[1] === 0,
      succion_vaciamiento: succion[2] === 1,
      succion_sin_vaciamiento: succion[2] === 0,

      deglucion_se_escucha: deglucion[0] === 1,
      deglucion_no_se_escucha: deglucion[0] === 0,
      deglucion_lengua_acanalada: deglucion[1] === 1,
      deglucion_lengua_plana: deglucion[1] === 0
    };
  }

  onRowClick(row: VisitaMadresResponse) {
    this.router.navigate(['/blh/captacion/visita-domiciliaria', row.id]);
  }

  formatData(data: VisitaMadresResponse[]): VisitaMadresResponse[] {
    return data.map(item => ({
      ...item,
      nombre: item.infoMadre.nombre,
      apellido: item.infoMadre.apellido,
      documento: item.infoMadre.documento,
      direccion: item.infoMadre.direccion,
      celular: item.infoMadre.celular,
      ciudad: item.infoMadre.ciudad,
      fecha_visita: this.formatDateToDDMMYYYY(item.fecha_visita),
      edad: this.ageCalculate(item.infoMadre.fechaNacimiento),
    }));
  }

  private formatDateToDDMMYYYY(fecha: Date | string): string {
    try {
      if (!fecha) return '';

      let fechaObj: Date;

      if (typeof fecha === 'string') {
        const fechaParts = fecha.split('-');
        if (fechaParts.length === 3) {
          const year = parseInt(fechaParts[0], 10);
          const month = parseInt(fechaParts[1], 10) - 1;
          const day = parseInt(fechaParts[2], 10);
          fechaObj = new Date(year, month, day);
        } else {
          fechaObj = new Date(fecha);
        }
      } else {
        fechaObj = new Date(fecha);
      }

      const day = fechaObj.getDate().toString().padStart(2, '0');
      const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const year = fechaObj.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  ageCalculate(age: Date): number {
    const fechaNacimiento = new Date(age);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  }
}
