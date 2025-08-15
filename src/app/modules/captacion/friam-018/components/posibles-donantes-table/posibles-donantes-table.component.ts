import { Component, OnInit, ViewChild } from '@angular/core';
import { RegistroDonanteService } from './services/registro-donante.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, concatMap, Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../../../friam-041/components/table-list/interfaces/linea-amiga.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ResponseMadresDonantes } from './interfaces/registro-donante.interface';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfFriam018Component } from '../../../../../utils/pdf-friam-018/pdf-friam-018.component';

@Component({
  selector: 'posibles-donantes-table',
  templateUrl: './posibles-donantes-table.component.html',
  styleUrl: './posibles-donantes-table.component.scss',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    HeaderComponent,
    ProgressSpinnerModule,
    ToastModule,
    DatePickerModule,
    ButtonModule,
    PdfFriam018Component
  ],
  providers: [RegistroDonanteService, MessageService],
})
export class PosiblesDonantesTableComponent implements OnInit {

  @ViewChild('pdfComponent') pdfComponent?: PdfFriam018Component;

  loading: boolean = false;

  headersTablePosiblesDonantes: any[] = [
    { header: 'COD. DONANTE', field: 'codDonante', width: '150px', tipo: 'text' },
    { header: 'FECHA REGISTRO', field: 'fechaRegistro', width: '200px', tipo: 'text' },
    { header: 'NOMBRES', field: 'nombre', width: '200px', tipo: 'text' },
    { header: 'APELLIDOS', field: 'apellido', width: '200px', tipo: 'text' },
    { header: 'NO. DOC', field: 'documento', width: '200px', tipo: 'number' },
    { header: 'LABORATORIO', field: 'laboratorio', width: '200px', tipo: 'text' },
    { header: 'REPORTE', field: 'reporte', width: '150px', tipo: 'action' },
  ];

  dataRegistroDonante: any[] = [];
  dataRegistroDonanteByMadresDonantes: any[] = [];

  showPdf = false;
  generatingPdf = false;
  currentPdfRowId: number | null = null;

  pdfPayload: {
    datosInscripcion: any;
    historiaGestacion: any;
    examenesLab: any;
    medicamentos: any;
  } | null = null;

  constructor(
    private _registroDonanteService: RegistroDonanteService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    of(null)
      .pipe(
        concatMap(() => this.loadDataPosiblesDonantes()),
        concatMap(() => this.loadDataPosiblesDonantesByMadresDonantne())
      )
      .subscribe({
        complete: () => {
          this.formatDataByMadrePotenciales(this.dataRegistroDonante, this.dataRegistroDonanteByMadresDonantes);
          setTimeout(() => (this.loading = false), 1200);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en la secuencia de peticiones', err);
        },
      });
  }

  loadDataPosiblesDonantes(): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataRegistroDonante().pipe(
      tap((response) => {
        this.dataRegistroDonante = [];
        if (response && response.data.length > 0) {
          this.dataRegistroDonante = this.formatData(response.data);
          this.loading = false;
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
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        console.error('Error en getDataRegistroDonante:', error);
        return of(null);
      })
    );
  }

  loadDataPosiblesDonantesByMadresDonantne(): Observable<ApiResponse | null> {
    return this._registroDonanteService.getDataMadresDonantesRegistered().pipe(
      tap((response) => {
        this.dataRegistroDonanteByMadresDonantes = [];
        if (response && response.data.length > 0) {
          this.dataRegistroDonanteByMadresDonantes = this.formatData(response.data);
          this.loading = false;
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
      }),
      catchError((error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Hubo un error al obtener datos',
          key: 'tr',
          life: 3000,
        });
        console.error('Error en getDataMadresDonantesRegistered:', error);
        return of(null);
      })
    );
  }

  formatDataByMadrePotenciales(dataFirst: ResponseMadresDonantes[], dataSecond: ResponseMadresDonantes[]) {
    dataFirst.forEach((item, index) => {
      const flat = dataSecond.find((d) => d.id === item.id) || item;
      this.dataRegistroDonante[index] = {
        ...item,
        MadreDonante: flat.MadreDonante || null,
        codDonante: flat.MadreDonante ? flat.MadreDonante.id : null,
        fechaRegistro: flat.fecha_registro ? (flat.fecha_registro as string).toString().split('T')[0] : '',
        nombre: flat.infoMadre.nombre,
        apellido: flat.infoMadre.apellido,
        documento: flat.infoMadre.documento,
        laboratorio: flat.MadreDonante
          ? flat.laboratorio
            .map((lab) => lab.fechaVencimiento)
            .sort((a, b) => (a > b ? 1 : -1))[0]
          : 'Sin Fecha',
        backgroundColorRow: flat.MadreDonante
          ? flat.MadreDonante.donanteApta === 1
            ? 'donante-efectiva'
            : ''
          : '',
      };
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

    this._registroDonanteService.getInfoCompleteMadrePotencial(rowData.id).subscribe({
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

        // Normalizar a objeto único
        const madreDataRaw = Array.isArray(response.data) ? response.data[0] : response.data;
        const madreData = madreDataRaw as unknown as ResponseMadresDonantes;
        this.pdfPayload = this.mapResponseToPdfPayload(madreData);
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
        const fileName = `FRIAM018_${rowData.codDonante || rowData.documento}.pdf`;
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

private mapResponseToPdfPayload(data: ResponseMadresDonantes) {
    const madreDonante = data.MadreDonante;
    const info = data.infoMadre;
    const gest = madreDonante?.gestacion;
    const examen = madreDonante?.examenesPrenatal;
    const meds = madreDonante?.medicamento;
    const hijos = madreDonante?.hijosMadre || [];
    const hijo = hijos[0];

    const labs = data.laboratorio || [];

    const labVdrl = labs[0] || null;
    const labHbs = labs[1] || null;
    const labHiv = labs[2] || null;

    const mapResultado = (lab: any) => {
      if (!lab || lab.resultado === null || lab.resultado === undefined) return '';
      return lab.resultado === 1 ? 'positivo' : 'negativo';
    };

    const datosInscripcion = {
      fechaDiligenciamiento: madreDonante?.fecha_diligenciamiento,
      nombre: info?.nombre,
      apellido: info?.apellido,
      documento: info?.documento,
      fechaNacimiento: info?.fechaNacimiento,
      edad: this.calcularEdad(info?.fechaNacimiento),
      codDonante: madreDonante?.id,
      telefono: info?.telefono,
      celular: info?.celular,
      direccion: info?.direccion,
      barrio: info?.barrio,
      ciudad: info?.ciudad,
      departamento: info?.departamento,
      profesion: info?.profesion,
      eps: info?.eps,
      donanteExclusiva: madreDonante?.donanteExclusivo,
      pesoBebe: hijo?.peso,
      nombreHijo: hijo?.nombre,
      donante_EoI: madreDonante?.tipoDonante,
      recoleccionDomicilio: madreDonante?.recoleccionDomicilio,
      capcitacion: madreDonante?.capacitado
    };

    const historiaGestacion = {
      lugarControlPrenatal: gest?.lugarControlPrenatal,
      tipoIPS: gest?.tipoIps,
      asistioControl: gest?.asistioControlPrenatal,
      pesoInicial: gest?.pesoGestacionInicial,
      pesoFinal: gest?.pesoGestacionFinal,
      talla: gest?.talla,
      tipoParto: gest?.partoTermino === 1 ? 'termino' : (gest?.preTermino === 1 ? 'pretermino' : ''),
      semanasGestacion: gest?.semanas,
      fechaParto: gest?.fechaParto
    };

    const examenesLab = {
      fechaRegistroLab: labVdrl?.fechaRegistro || labHbs?.fechaRegistro || labHiv?.fechaRegistro || datosInscripcion.fechaDiligenciamiento,
      vdrl: mapResultado(labVdrl),
      fechaVencimientoVdrl: labVdrl?.fechaVencimiento,
      hbsag: mapResultado(labHbs),
      fechaVencimientoHbsag: labHbs?.fechaVencimiento,
      hiv: mapResultado(labHiv),
      fechaVencimientoHiv: labHiv?.fechaVencimiento,
      hemoglobina: examen?.hemoglobina,
      hematocrito: examen?.hematocrito,
      transfusiones: examen?.transfuciones ?? examen?.transfuciones,
      enfermedadesGestacion: examen?.enfermedadesGestacion,
      fuma: examen?.fuma,
      alcohol: examen?.alcohol
    };

    const medicamentos = {
      medicamentos: meds?.medicamento,
      medicamento: meds?.medicamento,
      psicoactivos: meds?.psicoactivos,
      recibioEducacion: madreDonante?.recibioEducacion,
      donanteApta: madreDonante?.donanteApta,
      firmaDonante: madreDonante?.firmaDonante,
      profesionalResponsable: madreDonante?.firmaProfesional,
      firmaAcompanante: madreDonante?.firmaAcompañante,
      empleado: madreDonante?.empleado
    };

    return { datosInscripcion, historiaGestacion, examenesLab, medicamentos };
  }

  private calcularEdad(fecha: any): number | null {
    if (!fecha) return null;
    const nacimiento = new Date(fecha);
    if (isNaN(nacimiento.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  onRowClick(row: any): void {
    this._registroDonanteService.getInfoCompleteMadrePotencial(row.id).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(
            ['/blh/captacion/registro-donante-blh', row.documento],
            { state: { personInfo: response.data } }
          );
        } else {
          this.router.navigate(
            ['/blh/captacion/registro-donante-blh', row.documento],
            { state: { personInfo: row } }
          );
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'No se ha completado el registro de la madre donante',
            key: 'tr',
            life: 3000,
          });
        }
      },
    });
  }

  filtrarPorFecha(_filtro: { year: number; month: number }): void {
    this.loadDataPosiblesDonantes().subscribe();
  }

  formatData(data: ResponseMadresDonantes[]) {
    return data.map((item) => ({ ...item }));
  }

  dateDiff(fechas: string[]): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    for (const fechaStr of fechas) {
      const fecha = new Date(fechaStr);
      fecha.setHours(0, 0, 0, 0);
      const diferenciaEnDias = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diferenciaEnDias <= 15) {
        return true;
      }
    }
    return false;
  }
}
