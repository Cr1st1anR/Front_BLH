import { Component } from '@angular/core';

@Component({
  selector: 'entrega-leche-cruda-table',
  imports: [],
  templateUrl: './entrega-leche-cruda-table.component.html',
  styleUrl: './entrega-leche-cruda-table.component.scss'
})
export class EntregaLecheCrudaTableComponent {

  loading: boolean = false;

  readonly headersEntregaLecheCruda = [
    { header: 'FECHA', field: 'fecha', width: '50px', tipo: 'date' },
    { header: 'NOMBRE DE LA MADRE', field: 'nombre_madre', width: '200px', tipo: 'text' },
    { header: 'VOLUMEN DE LECHE MATERNA A.M', field: 'volumen_leche_materna_am', width: '150px', tipo: 'text' },
    { header: 'VOLUMEN DE LECHE MATERNA P.M', field: 'volumen_leche_materna_pm', width: '150px', tipo: 'text' },
    { header: 'PERDIDAS', field: 'perdidas', width: '80px', tipo: 'number' },
    { header: 'RESPONSABLE', field: 'responsable', width: '100px', tipo: 'text' },
  ];

  dataEntregaLecheCruda: any[] = [];

  
}
