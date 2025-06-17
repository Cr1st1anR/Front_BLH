import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButton } from 'primeng/radiobutton';

@Component({
  selector: 'evaluar-lactancia',
  imports: [FormsModule, AccordionModule, RadioButton],
  templateUrl: './evaluar-lactancia.component.html',
  styleUrl: './evaluar-lactancia.component.scss',
})
export class EvaluarLactanciaComponent {
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
}
