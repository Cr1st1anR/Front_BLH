import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';
import type { EvaluarLactanciaData } from '../interfaces/evaluar-lactancia.interface';

@Component({
  selector: 'evaluar-lactancia',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './evaluar-lactancia.component.html',
  styleUrl: './evaluar-lactancia.component.scss',
})
export class EvaluarLactanciaComponent implements EvaluarLactanciaData {
  madre_relajada: string = '';
  madre_enferma: string = '';
  madre_comoda: string = '';
  madre_tensa: string = '';
  madre_vinculo: string = '';
  madre_no_vinculo: string = '';

  bebe_saludable: string = '';
  bebe_somnoliento: string = '';
  bebe_calmado: string = '';
  bebe_inquieto: string = '';
  bebe_busca_pecho: string = '';
  bebe_no_busca_pecho: string = '';

  pechos_sanos: string = '';
  pechos_enrojecidos: string = '';
  pechos_sin_dolor: string = '';
  pechos_con_dolor: string = '';
  pezon_protractil: string = '';
  pezon_plano: string = '';

  bebe_alineado: string = '';
  bebe_torcido: string = '';
  bebe_contacto: string = '';
  bebe_no_contacto: string = '';
  bebe_sostenido: string = '';
  bebe_cabeza_sostenida: string = '';
  bebe_nariz_pecho: string = '';
  bebe_menton_pecho: string = '';

  boca_bien_abierta: string = '';
  boca_no_abierta: string = '';
  labio_fuera: string = '';
  labios_adentro: string = '';
  menton_nariz_cerca: string = '';
  menton_nariz_lejos: string = '';

  succion_lenta: string = '';
  succion_rapida: string = '';
  mejillas_redondas: string = '';
  mejillas_no_inflan: string = '';
  vaciado_seno: string = '';
  no_vaciado: string = '';

  deglucion_traga: string = '';
  deglucion_no_traga: string = '';
  lengua_acanalada: string = '';
  lengua_plana: string = '';

  getFormData() {
    return {
      madre_relajada: this.madre_relajada,
      madre_enferma: this.madre_enferma,
      madre_comoda: this.madre_comoda,
      madre_tensa: this.madre_tensa,
      madre_vinculo: this.madre_vinculo,
      madre_no_vinculo: this.madre_no_vinculo,

      bebe_saludable: this.bebe_saludable,
      bebe_somnoliento: this.bebe_somnoliento,
      bebe_calmado: this.bebe_calmado,
      bebe_inquieto: this.bebe_inquieto,
      bebe_busca_pecho: this.bebe_busca_pecho,
      bebe_no_busca_pecho: this.bebe_no_busca_pecho,

      pechos_sanos: this.pechos_sanos,
      pechos_enrojecidos: this.pechos_enrojecidos,
      pechos_sin_dolor: this.pechos_sin_dolor,
      pechos_con_dolor: this.pechos_con_dolor,
      pezon_protractil: this.pezon_protractil,
      pezon_plano: this.pezon_plano,

      bebe_alineado: this.bebe_alineado,
      bebe_torcido: this.bebe_torcido,
      bebe_contacto: this.bebe_contacto,
      bebe_no_contacto: this.bebe_no_contacto,
      bebe_sostenido: this.bebe_sostenido,
      bebe_cabeza_sostenida: this.bebe_cabeza_sostenida,
      bebe_nariz_pecho: this.bebe_nariz_pecho,
      bebe_menton_pecho: this.bebe_menton_pecho,

      boca_bien_abierta: this.boca_bien_abierta,
      boca_no_abierta: this.boca_no_abierta,
      labio_fuera: this.labio_fuera,
      labios_adentro: this.labios_adentro,
      menton_nariz_cerca: this.menton_nariz_cerca,
      menton_nariz_lejos: this.menton_nariz_lejos,

      succion_lenta: this.succion_lenta,
      succion_rapida: this.succion_rapida,
      mejillas_redondas: this.mejillas_redondas,
      mejillas_no_inflan: this.mejillas_no_inflan,
      vaciado_seno: this.vaciado_seno,
      no_vaciado: this.no_vaciado,

      deglucion_traga: this.deglucion_traga,
      deglucion_no_traga: this.deglucion_no_traga,
      lengua_acanalada: this.lengua_acanalada,
      lengua_plana: this.lengua_plana,
    };
  }
}
