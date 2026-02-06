import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
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
import { HttpClientModule } from '@angular/common/http';

import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { NewRegisterButtonComponent } from "src/app/shared/components/new-register-button/new-register-button.component";
import { PasteurizadorTableComponent } from '../../components/pasteurizador-table/pasteurizador-table.component';
import { EnfriadorTableComponent } from '../../components/enfriador-table/enfriador-table.component';
import { ConstruccionCurvasService } from '../../services/construccion-curvas.service';

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
  PayloadCurvaCompletaAPI,
  MuestraAPI,
  CurvaDetalleResponse
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
    DatePickerModule,
    HttpClientModule
  ],
  templateUrl: './construccion-curvas-page.component.html',
  styleUrl: './construccion-curvas-page.component.scss',
  providers: [MessageService]
})
export class ConstruccionCurvasPageComponent implements OnInit, AfterViewInit {

  private readonly curvasService = inject(ConstruccionCurvasService);
  private readonly messageService = inject(MessageService);

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

  private volumenDebounceTimer: any = null;

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
    id_responsable: null,
    responsable2: '',
    id_responsable2: null
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

  ngOnInit(): void {
    this.cargarResponsables();
    this.mostrarMensaje('info', 'Información', 'Ingrese un volumen para buscar curvas existentes o cree una nueva');
  }

  ngAfterViewInit(): void {
    // Las tablas siempre están en el DOM gracias a [hidden]
  }

  // ============= CARGAR RESPONSABLES DESDE LA API =============
  private cargarResponsables(): void {
    this.loading.responsables = true;

    this.curvasService.obtenerEmpleados().subscribe({
      next: (response) => {
        this.opcionesResponsables = response.data.map(empleado => ({
          label: empleado.nombre,
          value: empleado.nombre,
          id: empleado.id
        }));
        this.loading.responsables = false;
      },
      error: (error) => {
        console.error('Error al cargar responsables:', error);
        this.mostrarMensaje('error', 'Error', 'No se pudieron cargar los responsables');
        this.loading.responsables = false;
      }
    });
  }

  // ============= BÚSQUEDA POR VOLUMEN =============
  onVolumenInput(): void {
    if (this.volumenDebounceTimer) {
      clearTimeout(this.volumenDebounceTimer);
    }

    if (!this.volumenBusqueda.trim()) {
      this.opcionesVolumenes = [];
      this.limpiarSeleccion();
      return;
    }

    this.volumenDebounceTimer = setTimeout(() => {
      this.buscarPorVolumen(this.volumenBusqueda.trim());
    }, 800);
  }

  private limpiarSeleccion(): void {
    this.volumenSeleccionado = '';
  }

  private buscarPorVolumen(volumen: string): void {
    this.loading.volumenes = true;

    this.curvasService.buscarCurvasPorVolumen(Number(volumen)).subscribe({
      next: (response) => {
        const curvas = response.data;

        // ✅ Función helper para parsear fecha sin problema de zona horaria
        const parsearFechaSinZonaHoraria = (fechaString: string): Date => {
          const [año, mes, dia] = fechaString.split('-').map(Number);
          return new Date(año, mes - 1, dia); // Crea fecha en zona horaria local
        };

        this.opcionesVolumenes = curvas.map(curva => {
          const fechaObj = parsearFechaSinZonaHoraria(curva.fecha);
          return {
            label: `${curva.volumen} c.c. - ${this.formatearFecha(fechaObj)}`,
            value: curva.id.toString(),
            fecha: fechaObj,
            id_registro: curva.id,
            volumen: curva.volumen.toString()
          };
        });

        this.loading.volumenes = false;

        if (this.opcionesVolumenes.length > 0) {
          this.mostrarMensaje('success', 'Resultados encontrados', `Se encontraron ${this.opcionesVolumenes.length} curva${this.opcionesVolumenes.length > 1 ? 's' : ''} con volumen ${volumen} c.c.`);
        } else {
          this.mostrarMensaje('warn', 'Sin resultados', `No se encontraron curvas con volumen ${volumen} c.c.`);
        }
      },
      error: (error) => {
        console.error('Error al buscar curvas:', error);
        this.loading.volumenes = false;
        this.mostrarMensaje('error', 'Error', 'Error al buscar curvas por volumen');
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  // ============= SELECCIONAR VOLUMEN Y CARGAR DATOS =============
  onVolumenSeleccionado(event: any): void {
    const idCurvaSeleccionada = event.value;
    if (!idCurvaSeleccionada) {
      this.limpiarFormulario();
      return;
    }

    this.cargarDatosCurva(Number(idCurvaSeleccionada));
  }

  private cargarDatosCurva(idCurva: number): void {
    if (!this.pasteurizadorTableComponent || !this.enfriadorTableComponent) {
      this.mostrarMensaje('error', 'Error', 'Las tablas no están listas. Por favor, recargue la página.');
      return;
    }

    this.loading.main = true;

    this.curvasService.obtenerCurvaPorId(idCurva).subscribe({
      next: (response) => {
        const curvaDetalle = response.data[0];

        if (!curvaDetalle) {
          this.loading.main = false;
          this.mostrarMensaje('error', 'Error', 'No se encontró la curva seleccionada');
          return;
        }

        // ✅ Función helper para parsear fecha sin problema de zona horaria
        const parsearFechaSinZonaHoraria = (fechaString: string): Date => {
          const [año, mes, dia] = fechaString.split('-').map(Number);
          return new Date(año, mes - 1, dia); // Crea fecha en zona horaria local
        };

        // Mapear datos de la curva
        this.datosCurva = {
          id: curvaDetalle.id,
          numero_frascos: curvaDetalle.numeroFrascos.toString(),
          tipo_frasco: curvaDetalle.tipoFrasco,
          volumen: curvaDetalle.volumen.toString(),
          termometro_tipo: curvaDetalle.tipoTermometro,
          marca: curvaDetalle.marca,
          certificado_calibracion: curvaDetalle.certificado,
          nivel_agua_pasteurizador: curvaDetalle.aguaPasteurizador.toString(),
          temperatura_equipo: curvaDetalle.temperaturaEquipo.toString(),
          nivel_agua_enfriador: curvaDetalle.aguaEnfriador.toString(),
          temperatura_agua: curvaDetalle.temperaturaAgua.toString(),
          fecha: parsearFechaSinZonaHoraria(curvaDetalle.fecha),
          responsable: curvaDetalle.responsableOne.nombre,
          id_responsable: curvaDetalle.responsableOne.id,
          responsable2: curvaDetalle.responsableTwo?.nombre || '',
          id_responsable2: curvaDetalle.responsableTwo?.id || null
        };

        // Resumen Pasteurizador
        this.resumenPasteurizador = {
          promedio_precalentamiento: curvaDetalle.promedioPasteurizador.toString(),
          minutos: curvaDetalle.minutosPasteurizador.toString()
        };

        // Resumen Enfriador
        this.resumenEnfriador = {
          promedio_precalentamiento: curvaDetalle.promedioEnfriador.toString(),
          minutos: curvaDetalle.minutosEnfriador.toString()
        };

        // Convertir muestras agrupadas por tiempo
        const registrosPasteurizador = this.convertirMuestrasARegistros(curvaDetalle.pasteurizadores);
        const registrosEnfriador = this.convertirMuestrasARegistros(curvaDetalle.enfriadores);

        // Cargar datos en las tablas
        this.pasteurizadorTableComponent.cargarDatosExternos(registrosPasteurizador);
        this.enfriadorTableComponent.cargarDatosExternos(registrosEnfriador);

        this.idCurvaActual = idCurva;
        this.esActualizacion = true;
        this.mostrarFormulario = true;
        this.loading.main = false;

        this.mostrarMensaje('success', 'Datos cargados', `Se han cargado los datos de la curva con volumen ${curvaDetalle.volumen} c.c.`);
      },
      error: (error) => {
        console.error('Error al cargar curva:', error);
        this.loading.main = false;
        this.mostrarMensaje('error', 'Error', 'No se pudo cargar la curva seleccionada');
      }
    });
  }

  /**
   * Convierte las muestras de la API (agrupadas por tiempo) a registros de tabla
   * Cada registro tiene 3 fases (muestra 1, 2, 3) con el mismo tiempo
   */
  private convertirMuestrasARegistros(muestras: MuestraAPI[]): PasteurizadorData[] | EnfriadorData[] {
    // Agrupar muestras por tiempo
    const muestrasPorTiempo = muestras.reduce((acc, muestra) => {
      const tiempo = muestra.tiempo.toString();
      if (!acc[tiempo]) {
        acc[tiempo] = [];
      }
      acc[tiempo].push(muestra);
      return acc;
    }, {} as Record<string, MuestraAPI[]>);

    // Convertir cada grupo de muestras en un registro
    const registros: PasteurizadorData[] = [];

    Object.keys(muestrasPorTiempo)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(tiempo => {
        const muestrasGrupo = muestrasPorTiempo[tiempo].sort((a, b) => a.muestra - b.muestra);

        const registro: PasteurizadorData = {
          id: muestrasGrupo[0]?.id || null,
          tiempo: tiempo,
          t_frasco_testigo_1: muestrasGrupo[0]?.frascoTestigo?.toString() || '',
          t_agua_1: muestrasGrupo[0]?.agua?.toString() || '',
          tiempo_2: tiempo,
          t_frasco_testigo_2: muestrasGrupo[1]?.frascoTestigo?.toString() || '',
          t_agua_2: muestrasGrupo[1]?.agua?.toString() || '',
          tiempo_3: tiempo,
          t_frasco_testigo_3: muestrasGrupo[2]?.frascoTestigo?.toString() || '',
          t_agua_3: muestrasGrupo[2]?.agua?.toString() || ''
        };

        registros.push(registro);
      });

    return registros;
  }

  // ============= CREAR NUEVA CURVA =============
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

  // ============= CREAR NUEVOS REGISTROS EN TABLAS =============
  crearNuevoRegistroPasteurizador(): void {
    this.pasteurizadorTableComponent?.crearNuevoRegistro();
  }

  crearNuevoRegistroEnfriador(): void {
    this.enfriadorTableComponent?.crearNuevoRegistro();
  }

  // ============= GUARDAR O ACTUALIZAR =============
  guardarOActualizarDatos(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Por favor complete todos los campos obligatorios de la curva');
      return;
    }

    if (this.pasteurizadorTableComponent?.isAnyRowEditing() || this.enfriadorTableComponent?.isAnyRowEditing()) {
      this.mostrarMensaje('warn', 'Advertencia', 'Debe confirmar o cancelar las ediciones antes de guardar');
      return;
    }

    const payload = this.prepararPayloadParaAPI();
    if (!payload) {
      this.mostrarMensaje('error', 'Error', 'Error al preparar los datos para enviar');
      return;
    }

    this.enviarDatosAAPI(payload);
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
      this.datosCurva.id_responsable
    );
  }

  /**
   * Convierte los datos del formulario al formato esperado por la API
   */
  private prepararPayloadParaAPI(): PayloadCurvaCompletaAPI | null {
    try {
      // Convertir registros de tabla a muestras API
      const pasteurizadores = this.convertirRegistrosAMuestras(this.dataPasteurizador);
      const enfriadores = this.convertirRegistrosAMuestras(this.dataEnfriador);

      // Formatear fecha
      let fechaFormateada = '';
      if (this.datosCurva.fecha instanceof Date) {
        const año = this.datosCurva.fecha.getFullYear();
        const mes = (this.datosCurva.fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = this.datosCurva.fecha.getDate().toString().padStart(2, '0');
        fechaFormateada = `${año}-${mes}-${dia}`;
      }

      const payload: PayloadCurvaCompletaAPI = {
        numeroFrasco: Number(this.datosCurva.numero_frascos),
        tipoFrasco: this.datosCurva.tipo_frasco,
        tipoTermometro: this.datosCurva.termometro_tipo,
        marca: this.datosCurva.marca,
        certificado: this.datosCurva.certificado_calibracion,
        aguaPasteurizador: Number(this.datosCurva.nivel_agua_pasteurizador),
        temperaturaEquipo: Number(this.datosCurva.temperatura_equipo),
        volumen: Number(this.datosCurva.volumen),
        aguaEnfriador: Number(this.datosCurva.nivel_agua_enfriador),
        temperaturaAgua: Number(this.datosCurva.temperatura_agua),
        fecha: fechaFormateada,
        promedioPasteurizador: Number(this.resumenPasteurizador.promedio_precalentamiento),
        minutosPasteurizador: Number(this.resumenPasteurizador.minutos),
        promedioEnfriador: Number(this.resumenEnfriador.promedio_precalentamiento),
        minutosEnfriador: Number(this.resumenEnfriador.minutos),
        responsableOne: this.datosCurva.id_responsable!,
        responsableTwo: this.datosCurva.id_responsable2 || this.datosCurva.id_responsable!,
        pasteurizadores,
        enfriadores
      };

      return payload;
    } catch (error) {
      console.error('Error al preparar payload:', error);
      return null;
    }
  }

  /**
   * Convierte los registros de la tabla (con 3 fases) a muestras de la API
   */
  private convertirRegistrosAMuestras(registros: PasteurizadorData[] | EnfriadorData[]): MuestraAPI[] {
    const muestras: MuestraAPI[] = [];

    registros.forEach(registro => {
      const tiempo = Number(registro.tiempo);

      // Muestra 1 (si tiene datos)
      if (registro.t_frasco_testigo_1?.trim() && registro.t_agua_1?.trim()) {
        muestras.push({
          ...(registro.id ? { id: registro.id } : {}),
          tiempo,
          frascoTestigo: Number(registro.t_frasco_testigo_1),
          agua: Number(registro.t_agua_1),
          muestra: 1
        });
      }

      // Muestra 2 (si tiene datos)
      if (registro.t_frasco_testigo_2?.trim() && registro.t_agua_2?.trim()) {
        muestras.push({
          tiempo,
          frascoTestigo: Number(registro.t_frasco_testigo_2),
          agua: Number(registro.t_agua_2),
          muestra: 2
        });
      }

      // Muestra 3 (si tiene datos)
      if (registro.t_frasco_testigo_3?.trim() && registro.t_agua_3?.trim()) {
        muestras.push({
          tiempo,
          frascoTestigo: Number(registro.t_frasco_testigo_3),
          agua: Number(registro.t_agua_3),
          muestra: 3
        });
      }
    });

    return muestras;
  }

  private enviarDatosAAPI(payload: PayloadCurvaCompletaAPI): void {
    this.loading.saving = true;

    const request = this.esActualizacion && this.idCurvaActual
      ? this.curvasService.actualizarCurva(this.idCurvaActual, payload)
      : this.curvasService.crearCurva(payload);

    request.subscribe({
      next: (response) => {
        this.loading.saving = false;
        const mensaje = this.esActualizacion
          ? 'Curva actualizada exitosamente'
          : 'Curva creada exitosamente';

        this.mostrarMensaje('success', 'Éxito', mensaje);
        this.esActualizacion = true;

        if (!this.esActualizacion && response.data?.id) {
          this.idCurvaActual = response.data.id;
        }
      },
      error: (error) => {
        console.error('Error al guardar curva:', error);
        this.loading.saving = false;
        this.mostrarMensaje('error', 'Error', 'No se pudo guardar la curva. Por favor, intente nuevamente');
      }
    });
  }

  puedeGuardar(): boolean {
    return this.validarFormulario() &&
      (!this.pasteurizadorTableComponent || !this.pasteurizadorTableComponent.isAnyRowEditing()) &&
      (!this.enfriadorTableComponent || !this.enfriadorTableComponent.isAnyRowEditing());
  }

  obtenerTextoBotonGuardar(): string {
    return this.esActualizacion ? 'Actualizar' : 'Guardar';
  }

  // ============= LIMPIAR FORMULARIO =============
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
      id_responsable: null,
      responsable2: '',
      id_responsable2: null
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

  // ============= MANEJADORES DE CAMBIO DE RESPONSABLES =============
  onResponsable1Change(event: any): void {
    const responsableSeleccionado = this.opcionesResponsables.find(r => r.value === event.value);
    if (responsableSeleccionado) {
      this.datosCurva.responsable = responsableSeleccionado.value;
      this.datosCurva.id_responsable = responsableSeleccionado.id;
    }
  }

  onResponsable2Change(event: any): void {
    const responsableSeleccionado = this.opcionesResponsables.find(r => r.value === event.value);
    if (responsableSeleccionado) {
      this.datosCurva.responsable2 = responsableSeleccionado.value;
      this.datosCurva.id_responsable2 = responsableSeleccionado.id;
    }
  }
}
