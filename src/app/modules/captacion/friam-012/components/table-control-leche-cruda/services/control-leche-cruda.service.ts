import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ControlLecheCrudaService {

  constructor() { }

  getTableControlLecheCrudaData() {
    return [
      {
        id: 1,
        nCongelador: '001',
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: '3',
        diasPosparto: '2 meses',
        donante: '1836',
        numFrasco: 'LHC25 1130',
        edadGestacional: '38.1',
        volumen: '170',
        fechaExtraccion: '01/09/2025',
        fechaVencimiento: '15/09/2025',
        fechaParto: '10/06/2025',
        procedencia: 'Domicilio',
        fechaEntrada: '02/09/2025',
        responsableEntrada: 'Stephania M',
        fechaSalida: '05/09/2025',
        responsableSalida: 'Alejandra L',
        fechaRegistro: '02/09/2025',
        idFrascoLecheCruda: 1130
      },
      {
        id: 2,
        nCongelador: '001',
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: '3',
        diasPosparto: '2 meses',
        donante: '1836',
        numFrasco: 'LHC25 1131',
        edadGestacional: '38.1',
        volumen: '170',
        fechaExtraccion: '01/09/2025',
        fechaVencimiento: '15/09/2025',
        fechaParto: '10/06/2025',
        procedencia: 'Domicilio',
        fechaEntrada: '02/09/2025',
        responsableEntrada: 'Stephania M',
        fechaSalida: '05/09/2025',
        responsableSalida: 'Alejandra L',
        fechaRegistro: '02/09/2025',
        idFrascoLecheCruda: 1131
      },
      {
        id: 3,
        nCongelador: '002',
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: '3',
        diasPosparto: '2 meses',
        donante: '1836',
        numFrasco: 'LHC25 1132',
        edadGestacional: '38.1',
        volumen: '170',
        fechaExtraccion: '01/09/2025',
        fechaVencimiento: '15/09/2025',
        fechaParto: '10/06/2025',
        procedencia: 'Domicilio',
        fechaEntrada: '02/09/2025',
        responsableEntrada: 'Stephania M',
        fechaSalida: '05/09/2025',
        responsableSalida: 'Alejandra L',
        fechaRegistro: '02/09/2025',
        idFrascoLecheCruda: 1132
      },
      {
        id: 4,
        nCongelador: '002',
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: '3',
        diasPosparto: '2 meses',
        donante: '1836',
        numFrasco: 'LHC25 1133',
        edadGestacional: '38.1',
        volumen: '170',
        fechaExtraccion: '01/09/2025',
        fechaVencimiento: '15/09/2025',
        fechaParto: '10/06/2025',
        procedencia: 'Domicilio',
        fechaEntrada: '02/09/2025',
        responsableEntrada: 'Stephania M',
        fechaSalida: '05/09/2025',
        responsableSalida: 'Alejandra L',
        fechaRegistro: '02/09/2025',
        idFrascoLecheCruda: 1133
      },
      {
        id: 5,
        nCongelador: '003',
        ubicacion: 'BLH - área de almacenamiento',
        gaveta: '3',
        diasPosparto: '2 meses',
        donante: '1836',
        numFrasco: 'LHC25 1134',
        edadGestacional: '38.1',
        volumen: '170',
        fechaExtraccion: '01/09/2025',
        fechaVencimiento: '15/09/2025',
        fechaParto: '10/06/2025',
        procedencia: 'Domicilio',
        fechaEntrada: '02/09/2025',
        responsableEntrada: 'Stephania M',
        fechaSalida: '05/09/2025',
        responsableSalida: 'Alejandra L',
        fechaRegistro: '02/09/2025',
        idFrascoLecheCruda: 1134
      },
    ]
  }

  // met para generar el siguiente número de frasco
  generateNextFrascoNumber(): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString().slice(-2); // obtenmeos los ultimos 2 dgitos del año

    // Simulamos obtener el último ID de la base de datos
    // En tu implementación real, esto vendría del backend
    const lastId = this.getLastFrascoId();
    const nextId = lastId + 1;

    return `LHC${currentYear} ${nextId}`;
  }

  // Simula obtener el último ID de frasco de la base de datos
  private getLastFrascoId(): number {
    const data = this.getTableControlLecheCrudaData();
    if (data.length === 0) return 1129; // Valor inicial si no hay datos

    // Encuentra el ID más alto
    return Math.max(...data.map(item => item.idFrascoLecheCruda || 0));
  }
}
