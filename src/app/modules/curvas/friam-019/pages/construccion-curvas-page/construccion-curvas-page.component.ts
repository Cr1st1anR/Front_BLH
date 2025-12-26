import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';

import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { PasteurizadorTableComponent } from '../../components/pasteurizador-table/pasteurizador-table.component';
import { EnfriadorTableComponent } from '../../components/enfriador-table/enfriador-table.component';

import type {
  DatosCurva,
  PasteurizadorData,
  ResumenPasteurizador,
  EnfriadorData,
  ResumenEnfriador,
  LoadingState,
  OpcionVolumenCurva,
  ResponsableOption,
  TipoMensaje,
  PayloadCurvaCompleta
} from '../../interfaces/construccion-curvas.interface';

@Component({
  selector: 'construccion-curvas-page',
  standalone: true,
  imports: [
    HeaderComponent,
    NewRegisterButtonComponent,
    PasteurizadorTableComponent,
    EnfriadorTableComponent,
    CommonModule,
    FormsModule,
    ToastModule,
    ProgressSpinnerModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    DatePickerModule
  ],
  templateUrl: './construccion-curvas-page.component.html',
  styleUrl: './construccion-curvas-page.component.scss',
  providers: [MessageService]
})
export class ConstruccionCurvasPageComponent implements OnInit, AfterViewInit {

  @ViewChild(PasteurizadorTableComponent)
  pasteurizadorTableComponent!: PasteurizadorTableComponent;

  @ViewChild(EnfriadorTableComponent)
  enfriadorTableComponent!: EnfriadorTableComponent;

  readonly loading: LoadingState = {
    main: false,
    responsables: false,
    volumenes: false,
    saving: false
  };

  mostrarFormulario: boolean = false;
  esActualizacion: boolean = false;
  volumenBusqueda: string = '';
  volumenSeleccionado: string = '';

  datosCurva: DatosCurva = {
    id: null,
    numero_frascos: '',
    tipo_frasco: '',
    volumen: '',
    termometro_tipo: '',
    marca: '',
    certificado_calibracion: '',
    nivel_agua_pasteurizador: '',
    temperatura_equipo: '',
    nivel_agua_enfriador: '',
    temperatura_agua: '',
    fecha: null,
    responsable: '',
    id_responsable: null
  };

  resumenPasteurizador: ResumenPasteurizador = {
    promedio_precalentamiento: '',
    minutos: ''
  };

  resumenEnfriador: ResumenEnfriador = {
    promedio_precalentamiento: '',
    minutos: ''
  };

  opcionesVolumenes: OpcionVolumenCurva[] = [];
  opcionesResponsables: ResponsableOption[] = [];

  private idCurvaActual: number | null = null;

  // ✅ MOCK: Base de datos simulada
  private mockDatabase = {
    curvas: [
      {
        id: 1,
        volumen: '100',
        fecha: new Date(2025, 11, 15),
        datosCurva: {
          id: 1,
          numero_frascos: '5',
          tipo_frasco: 'Tipo A',
          volumen: '100',
          termometro_tipo: 'Digital',
          marca: 'Marca X',
          certificado_calibracion: 'CERT-2025-001',
          nivel_agua_pasteurizador: '80',
          temperatura_equipo: '62.5',
          nivel_agua_enfriador: '75',
          temperatura_agua: '5',
          fecha: new Date(2025, 11, 15),
          responsable: 'Juan Pérez',
          id_responsable: 1
        },
        registrosPasteurizador: [
          { id: 1, tiempo: '0', t_frasco_testigo_1: '20', t_agua_1: '62', tiempo_2: '0', t_frasco_testigo_2: '20', t_agua_2: '62', tiempo_3: '0', t_frasco_testigo_3: '20', t_agua_3: '62' },
          { id: 2, tiempo: '1', t_frasco_testigo_1: '25', t_agua_1: '62.5', tiempo_2: '1', t_frasco_testigo_2: '25', t_agua_2: '62.5', tiempo_3: '1', t_frasco_testigo_3: '25', t_agua_3: '62.5' }
        ],
        resumenPasteurizador: { promedio_precalentamiento: '22.5', minutos: '30' },
        registrosEnfriador: [
          { id: 1, tiempo: '0', t_frasco_testigo_1: '62', t_agua_1: '5', tiempo_2: '0', t_frasco_testigo_2: '62', t_agua_2: '5', tiempo_3: '0', t_frasco_testigo_3: '62', t_agua_3: '5' }
        ],
        resumenEnfriador: { promedio_precalentamiento: '10', minutos: '15' }
      },
      {
        id: 2,
        volumen: '150',
        fecha: new Date(2025, 11, 20),
        datosCurva: {
          id: 2,
          numero_frascos: '8',
          tipo_frasco: 'Tipo B',
          volumen: '150',
          termometro_tipo: 'Análogo',
          marca: 'Marca Y',
          certificado_calibracion: 'CERT-2025-002',
          nivel_agua_pasteurizador: '85',
          temperatura_equipo: '63',
          nivel_agua_enfriador: '80',
          temperatura_agua: '4',
          fecha: new Date(2025, 11, 20),
          responsable: 'María García',
          id_responsable: 2
        },
        registrosPasteurizador: [],
        resumenPasteurizador: { promedio_precalentamiento: '', minutos: '' },
        registrosEnfriador: [],
        resumenEnfriador: { promedio_precalentamiento: '', minutos: '' }
      }
    ],
    responsables: [
      { id: 1, nombre: 'Juan Pérez' },
      { id: 2, nombre: 'María García' },
      { id: 3, nombre: 'Carlos Rodríguez' }
    ]
  };

  get hasNewRowInEditingPasteurizador(): boolean {
    return this.pasteurizadorTableComponent?.isAnyRowEditing() ?? false;
  }

  get hasNewRowInEditingEnfriador(): boolean {
    return this.enfriadorTableComponent?.isAnyRowEditing() ?? false;
  }

  get dataPasteurizador(): PasteurizadorData[] {
    return this.pasteurizadorTableComponent?.dataPasteurizador || [];
  }

  get dataEnfriador(): EnfriadorData[] {
    return this.enfriadorTableComponent?.dataEnfriador || [];
  }

  constructor(
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarResponsables();
    this.mostrarMensaje('info', 'Información', 'Ingrese un volumen para buscar curvas existentes o cree una nueva');
  }

  ngAfterViewInit(): void {
    // Componentes listos
  }

  private cargarResponsables(): void {
    this.loading.responsables = true;

    setTimeout(() => {
      this.opcionesResponsables = this.mockDatabase.responsables.map(resp => ({
        label: resp.nombre,
        value: resp.nombre,
        id: resp.id
      }));

      this.loading.responsables = false;
    }, 300);
  }

  onVolumenInput(): void {
    if (this.volumenBusqueda.trim()) {
      this.buscarPorVolumen(this.volumenBusqueda.trim());
    } else {
      this.opcionesVolumenes = [];
      this.limpiarSeleccion();
    }
  }

  private buscarPorVolumen(volumen: string): void {
    this.loading.volumenes = true;

    setTimeout(() => {
      const curvasFiltradas = this.mockDatabase.curvas.filter(curva =>
        curva.volumen === volumen
      );

      curvasFiltradas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

      this.opcionesVolumenes = curvasFiltradas.map(curva => ({
        label: `${curva.volumen} c.c. - ${this.formatearFecha(curva.fecha)}`,
        value: curva.fecha.toISOString(),
        fecha: curva.fecha,
        id_registro: curva.id,
        volumen: curva.volumen
      }));

      this.loading.volumenes = false;

      if (this.opcionesVolumenes.length > 0) {
        this.mostrarMensaje('success', 'Resultados encontrados', `Se encontraron ${this.opcionesVolumenes.length} curva${this.opcionesVolumenes.length > 1 ? 's' : ''} con volumen ${volumen} c.c.`);
      } else {
        this.mostrarMensaje('info', 'Sin resultados', `No se encontraron curvas con volumen ${volumen} c.c.`);
      }
    }, 500);
  }

  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  onVolumenSeleccionado(event: any): void {
    const volumenSel = event.value;
    if (!volumenSel) {
      this.limpiarFormulario();
      return;
    }

    const opcionSeleccionada = this.opcionesVolumenes.find(opt => opt.value === volumenSel);
    if (!opcionSeleccionada) return;

    this.cargarDatosCurva(opcionSeleccionada.id_registro!);
  }

  private limpiarSeleccion(): void {
    this.volumenSeleccionado = '';
    this.mostrarFormulario = false;

    if (this.pasteurizadorTableComponent) {
      this.pasteurizadorTableComponent.limpiarDatos();
    }

    if (this.enfriadorTableComponent) {
      this.enfriadorTableComponent.limpiarDatos();
    }
  }

  private cargarDatosCurva(idCurva: number, intentosRestantes: number = 3): void {
    if (!this.pasteurizadorTableComponent || !this.enfriadorTableComponent) {
      if (intentosRestantes > 0) {
        setTimeout(() => {
          this.cargarDatosCurva(idCurva, intentosRestantes - 1);
        }, 300);
        return;
      } else {
        this.mostrarMensaje('error', 'Error', 'Las tablas no están listas. Por favor, intente nuevamente.');
        return;
      }
    }

    this.loading.main = true;

    setTimeout(() => {
      const curva = this.mockDatabase.curvas.find(c => c.id === idCurva);

      if (!curva) {
        this.loading.main = false;
        this.mostrarMensaje('error', 'Error', 'No se encontró la curva seleccionada');
        return;
      }

      this.datosCurva = { ...curva.datosCurva };
      this.resumenPasteurizador = { ...curva.resumenPasteurizador };
      this.resumenEnfriador = { ...curva.resumenEnfriador };

      this.pasteurizadorTableComponent.cargarDatosExternos(curva.registrosPasteurizador);
      this.enfriadorTableComponent.cargarDatosExternos(curva.registrosEnfriador);

      this.idCurvaActual = idCurva;
      this.esActualizacion = true;
      this.mostrarFormulario = true;
      this.loading.main = false;

      this.mostrarMensaje('success', 'Datos cargados', `Se han cargado los datos de la curva con volumen ${curva.volumen} c.c.`);
    }, 300);
  }

  crearNuevaCurva(): void {
    if (this.pasteurizadorTableComponent?.isAnyRowEditing() || this.enfriadorTableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe guardar o cancelar la edición actual');
      return;
    }

    this.limpiarFormulario();

    this.volumenBusqueda = '';
    this.volumenSeleccionado = '';
    this.opcionesVolumenes = [];
    this.esActualizacion = false;
    this.mostrarFormulario = true;
    this.idCurvaActual = null;

    this.mostrarMensaje('info', 'Nueva curva', 'Complete los datos de la curva y agregue registros');
  }

  crearNuevoRegistroPasteurizador(): void {
    this.pasteurizadorTableComponent?.crearNuevoRegistro();
  }

  crearNuevoRegistroEnfriador(): void {
    this.enfriadorTableComponent?.crearNuevoRegistro();
  }

  guardarOActualizarDatos(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos de la curva');
      return;
    }

    if (this.pasteurizadorTableComponent?.isAnyRowEditing() || this.enfriadorTableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar las ediciones antes de guardar');
      return;
    }

    const payload = this.prepararPayloadCompleto();
    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos');
      return;
    }

    this.enviarDatosCompletos(payload);
  }

  private validarFormulario(): boolean {
    return !!(
      this.datosCurva.numero_frascos?.trim() &&
      this.datosCurva.tipo_frasco?.trim() &&
      this.datosCurva.volumen?.trim() &&
      this.datosCurva.termometro_tipo?.trim() &&
      this.datosCurva.marca?.trim() &&
      this.datosCurva.certificado_calibracion?.trim() &&
      this.datosCurva.nivel_agua_pasteurizador?.trim() &&
      this.datosCurva.temperatura_equipo?.trim() &&
      this.datosCurva.nivel_agua_enfriador?.trim() &&
      this.datosCurva.temperatura_agua?.trim() &&
      this.datosCurva.fecha &&
      this.datosCurva.responsable?.trim()
    );
  }

  private prepararPayloadCompleto(): PayloadCurvaCompleta | null {
    try {
      const payload: PayloadCurvaCompleta = {
        datosCurva: {
          ...(this.esActualizacion && this.datosCurva.id ? { id: this.datosCurva.id } : {}),
          ...this.datosCurva
        },
        registrosPasteurizador: this.dataPasteurizador,
        resumenPasteurizador: this.resumenPasteurizador,
        registrosEnfriador: this.dataEnfriador,
        resumenEnfriador: this.resumenEnfriador
      };

      return payload;
    } catch (error) {
      return null;
    }
  }

  private enviarDatosCompletos(payload: PayloadCurvaCompleta): void {
    this.loading.saving = true;

    setTimeout(() => {
      this.loading.saving = false;
      const mensaje = this.esActualizacion
        ? 'Todos los datos han sido actualizados exitosamente'
        : 'Todos los datos han sido guardados exitosamente';

      this.mostrarMensaje('success', 'Éxito', mensaje);
      this.esActualizacion = true;

      if (!this.idCurvaActual) {
        this.idCurvaActual = Date.now();
      }
    }, 1500);
  }

  puedeGuardar(): boolean {
    return this.validarFormulario() &&
      (!this.pasteurizadorTableComponent || !this.pasteurizadorTableComponent.isAnyRowEditing()) &&
      (!this.enfriadorTableComponent || !this.enfriadorTableComponent.isAnyRowEditing());
  }

  obtenerTextoBotonGuardar(): string {
    return this.esActualizacion ? 'Actualizar' : 'Guardar';
  }

  limpiarFormulario(): void {
    this.datosCurva = {
      id: null,
      numero_frascos: '',
      tipo_frasco: '',
      volumen: '',
      termometro_tipo: '',
      marca: '',
      certificado_calibracion: '',
      nivel_agua_pasteurizador: '',
      temperatura_equipo: '',
      nivel_agua_enfriador: '',
      temperatura_agua: '',
      fecha: null,
      responsable: '',
      id_responsable: null
    };

    this.resumenPasteurizador = {
      promedio_precalentamiento: '',
      minutos: ''
    };

    this.resumenEnfriador = {
      promedio_precalentamiento: '',
      minutos: ''
    };

    if (this.pasteurizadorTableComponent) {
      this.pasteurizadorTableComponent.limpiarDatos();
    }

    if (this.enfriadorTableComponent) {
      this.enfriadorTableComponent.limpiarDatos();
    }

    this.mostrarFormulario = false;
    this.esActualizacion = false;
    this.idCurvaActual = null;
  }

  private mostrarMensaje(severity: TipoMensaje, summary: string, detail: string, life: number = 3000): void {
    this.messageService.add({ severity, summary, detail, key: 'tr', life });
  }
}
